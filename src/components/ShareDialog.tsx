import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Document, ShareSettings } from '../types';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface ShareDialogProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareDialog({ document, isOpen, onClose }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setIsPublic(false);
    setPassword('');
    setExpiryDate('');
    setShareUrl('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const shareSettings: ShareSettings = {
        document_id: document.id,
        is_public: isPublic,
        password: password || null,
        expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
        share_id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('share_settings')
        .insert(shareSettings);

      if (error) throw error;

      const url = `${window.location.origin}/share/${shareSettings.share_id}`;
      setShareUrl(url);
      toast.success('分享链接已生成');
    } catch (err) {
      toast.error('生成分享链接失败');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('链接已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败');
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">分享文档</Dialog.Title>
            <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <span>公开分享</span>
              </label>
            </div>

            {!isPublic && (
              <div>
                <label className="block text-sm font-medium mb-1">访问密码</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="可选"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">过期时间</label>
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {!shareUrl && (
              <button
                onClick={handleShare}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? '生成中...' : '生成分享链接'}
              </button>
            )}

            {shareUrl && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="复制链接"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex justify-center">
                  <QRCodeSVG value={shareUrl} size={200} />
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 