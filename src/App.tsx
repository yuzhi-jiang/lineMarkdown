import * as React from 'react';
import { useEffect, useState } from 'react';
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

function App() {
  const [session, setSession] = useState(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

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
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 p-4 overflow-y-auto">
          <DocumentList 
            onSelectDocument={setCurrentDocument}
            currentDocument={currentDocument}
          />
        </div>
        {currentDocument ? (
          <div className="flex-1 p-4 flex flex-col">
            <div className="mb-4">
              <DocumentTitle 
                document={currentDocument}
                onUpdate={setCurrentDocument}
              />
            </div>
            <div className="flex-1 flex">
              <div className="w-1/2 pr-2">
                <Editor
                  height="90vh"
                  defaultLanguage="markdown"
                  value={currentDocument.content}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                  }}
                />
              </div>
              <div className="w-1/2 pl-2">
                <Preview code={currentDocument.content || ''} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
            Select or create a document to start editing
          </div>
        )}
      </div>
    </>
  );
}

export default App;