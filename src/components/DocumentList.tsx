import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Document } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface DocumentListProps {
  onSelectDocument: (doc: Document) => void;
  currentDocument: Document | null;
}

export default function DocumentList({ onSelectDocument, currentDocument }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
    const subscription = supabase
      .channel('documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, fetchDocuments)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchDocuments() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Error fetching documents: ' + error.message);
      return;
    }
    setDocuments(data || []);
  }

  async function createNewDocument() {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Please sign in to create a document');
        return;
      }

      const newDoc = {
        title: 'Untitled Document',
        content: '# New Document\n\nStart writing here...',
        user_id: user.user.id,
        is_public: false
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([newDoc])
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        toast.error(error.message);
        return;
      }

      if (data) {
        toast.success('New document created');
        setDocuments(prev => [data, ...prev]);
        onSelectDocument(data);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Documents</h2>
        <button
          onClick={createNewDocument}
          disabled={isLoading}
          className={`${
            isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-4 py-2 rounded transition-colors`}
        >
          {isLoading ? 'Creating...' : 'New Document'}
        </button>
      </div>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
              currentDocument?.id === doc.id ? 'bg-blue-50 border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{doc.title}</h3>
              <span className="text-sm text-gray-500">
                {format(new Date(doc.updated_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No documents yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}