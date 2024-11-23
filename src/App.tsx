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
import Header from './components/Header';

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
      <Header />
      
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex min-h-0">
          <DocumentList
            onSelectDocument={setCurrentDocument}
            currentDocument={currentDocument}
          />
          {currentDocument && (
            <div className="flex-1 flex flex-col gap-2 min-h-0 p-4 bg-[#F5F5F0]">
              <div className="space-y-1">
                <DocumentTitle 
                  document={currentDocument} 
                  onUpdate={(updatedDoc) => setCurrentDocument(updatedDoc)}
                />
                <MarkdownToolbar onInsert={handleMarkdownInsert} />
              </div>
              <div className="flex gap-4 flex-1 min-h-0">
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
                <div style={{ width: `${100 - splitPosition}%` }} className="flex-shrink-0 min-h-0">
                  <Preview code={currentDocument.content} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;