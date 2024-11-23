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
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-2 py-1 border rounded"
          autoFocus
          onBlur={() => setIsEditing(false)}
        />
        <button type="submit" className="text-blue-500 hover:text-blue-600">
          Save
        </button>
      </form>
    );
  }

  return (
    <h1 
      onClick={() => setIsEditing(true)}
      className="text-xl font-bold cursor-pointer hover:text-gray-700"
    >
      {document.title}
    </h1>
  );
}