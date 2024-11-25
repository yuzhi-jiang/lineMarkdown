import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Document } from '../types';
import toast from 'react-hot-toast';
import { ShareIcon } from '@heroicons/react/24/outline';
import ShareDialog from './ShareDialog';

interface DocumentTitleProps {
  document: Document;
  onUpdate: (doc: Document) => void;
}

export default function DocumentTitle({ document, onUpdate }: DocumentTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    setTitle(document.title);
  }, [document.title]);

  const handleSave = async () => {
    console.log('handleSave', title);
    if (title === document.title) {
      setIsEditing(false);
      return;
    }

    const { data, error } = await supabase
      .from('documents')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', document.id)
      .select()
      .single();

    if (error) {
      toast.error('保存失败');
      return;
    }

    if (data) {
      onUpdate(data);
      toast.success('标题已更新');
    }
    
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-full bg-[#F2F3F5] p-4 mb-4 rounded-lg">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="w-full px-2 py-1 text-lg font-medium bg-transparent border-0 focus:outline-none focus:ring-0"
          placeholder="未命名文档"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F2F3F5] p-4 mb-4 rounded-lg">
      <div className="flex items-center gap-2">
        <h1 
          onClick={() => setIsEditing(true)}
          className="text-xl font-bold cursor-pointer hover:text-gray-700"
        >
          {document.title}
        </h1>
        <button
          onClick={() => setIsShareDialogOpen(true)}
          className="p-1 hover:bg-gray-100 rounded"
          title="分享文档"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>

      <ShareDialog
        document={document}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </div>
  );
}