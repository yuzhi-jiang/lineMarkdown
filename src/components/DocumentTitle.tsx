import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document } from '../types';
import toast from 'react-hot-toast';

interface DocumentTitleProps {
  document: Document;
  onUpdate: (doc: Document) => void;
}

export default function DocumentTitle({ document, onUpdate }: DocumentTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document.title);

  useEffect(() => {
    setTitle(document.title);
  }, [document.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('documents')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', document.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update title');
      return;
    }

    if (data) {
      onUpdate(data);
      toast.success('Title updated');
    }
    
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-full bg-[#F2F3F5] p-4 mb-4 rounded-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-2 py-1 border rounded bg-white"
            autoFocus
          />
          <button 
            type="submit" 
            className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded border border-blue-500"
          >
            保存
          </button>
          <button 
            type="button" 
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-600 px-3 py-1 rounded border border-gray-500"
          >
            取消
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F2F3F5] p-4 mb-4 rounded-lg">
      <h1 
        onClick={() => setIsEditing(true)}
        className="text-xl font-bold cursor-pointer hover:text-gray-700"
      >
        {document.title}
      </h1>
    </div>
  );
}