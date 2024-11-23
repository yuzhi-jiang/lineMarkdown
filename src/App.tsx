import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Preview from './components/Preview';
import Auth from './components/Auth';
import DocumentList from './components/DocumentList';
import DocumentTitle from './components/DocumentTitle';
import { supabase } from './lib/supabase';
import { Document } from './types';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import './App.css';
import MarkdownToolbar from './components/MarkdownToolbar';

function App() {
  const [session, setSession] = useState(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [splitPosition, setSplitPosition] = useState(50);
  const splitDragRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleEditorChange = async (value: string | undefined) => {
    if (!value || !currentDocument) return;
    
    setCurrentDocument({
      ...currentDocument,
      content: value
    });

    const { error } = await supabase
      .from('documents')
      .update({
        content: value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentDocument.id);

    if (error) {
      toast.error('Error saving document');
    }
  };

  const handleMarkdownInsert = (text: string, cursorOffset?: number) => {
    if (!currentDocument) return;
    
    const editor = monacoRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const position = editor.getPosition();
    
    // 如果有选中的文本，使用它来替换占位符
    const selectedText = editor.getModel().getValueInRange(selection);
    
    // 根据不同的语法类型处理光标位置
    let finalText = text;
    let cursorPos;
    
    if (text.includes('``')) {
      finalText = '``';
      cursorPos = position.column + 1;
    } else if (text.includes('**')) {
      finalText = '****';
      cursorPos = position.column + 2;
    } else if (text.includes('*')) {
      finalText = '**';
      cursorPos = position.column + 1;
    } else if (text.includes('[]')) {
      finalText = '[](url)';
      cursorPos = position.column + 1;
    } else if (text.includes('![]')) {
      finalText = '![](url)';
      cursorPos = position.column + 2;
    } else {
      cursorPos = position.column + text.length;
    }

    const op = {
      range: selection,
      text: finalText,
      forceMoveMarkers: true
    };
    
    editor.executeEdits("my-source", [op]);
    
    // 设置新的光标位置
    editor.setPosition({
      lineNumber: position.lineNumber,
      column: cursorPos
    });
    editor.focus();
  };

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="fixed inset-0 flex bg-gray-100">
        <DocumentList 
          onSelectDocument={setCurrentDocument}
          currentDocument={currentDocument}
        />
        <div className="flex-1 flex flex-col min-h-0">
          {currentDocument && (
            <>
              <DocumentTitle 
                document={currentDocument}
                onUpdate={setCurrentDocument}
              />
              <MarkdownToolbar onInsert={handleMarkdownInsert} />
              <div className="flex-1 flex gap-4 min-h-0 p-4 bg-[#F5F5F0]">
                <div style={{ width: `${splitPosition}%` }} className="flex-shrink-0 min-h-0 rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="markdown"
                    value={currentDocument.content}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                        verticalSliderSize: 6,
                        horizontalSliderSize: 6
                      }
                    }}
                    onMount={(editor) => {
                      monacoRef.current = editor;
                    }}
                  />
                </div>
                <div
                  ref={splitDragRef}
                  className="w-[3px] hover:w-[5px] bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-all flex-shrink-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const handleDrag = (e) => {
                      const container = splitDragRef.current.parentElement;
                      const containerRect = container.getBoundingClientRect();
                      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
                      if (newPosition >= 20 && newPosition <= 80) {
                        setSplitPosition(newPosition);
                      }
                    };

                    const handleDragEnd = () => {
                      document.removeEventListener('mousemove', handleDrag);
                      document.removeEventListener('mouseup', handleDragEnd);
                      document.body.style.cursor = 'default';
                    };

                    document.addEventListener('mousemove', handleDrag);
                    document.addEventListener('mouseup', handleDragEnd);
                    document.body.style.cursor = 'col-resize';
                  }}
                />
                <div style={{ width: `${100 - splitPosition}%` }} className="flex-shrink-0 min-h-0 rounded-lg overflow-hidden">
                  <Preview code={currentDocument.content} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;