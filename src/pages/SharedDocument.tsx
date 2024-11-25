import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Preview from '../components/Preview';
import { toast, Toaster } from 'react-hot-toast';
import React from 'react';
import Header from '../components/Header';
export default function SharedDocument() {
  const { shareId } = useParams();
  const [document, setDocument] = useState(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [needPassword, setNeedPassword] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [shareId]);

  const fetchDocument = async () => {
    try {
      const { data: shareSettings, error: shareError } = await supabase
        .from('share_settings')
        .select('*')
        .eq('share_id', shareId)
        .single();
      console.log('shareSettings', shareSettings);

      if (shareError) throw shareError;

      if (!shareSettings) {
        toast.error('分享链接不存在');
        return;
      }

      // 检查是否过期
      if (shareSettings.expiry_date && new Date(shareSettings.expiry_date) < new Date()) {
        toast.error('分享链接已过期');
        return;
      }

      // 检查是否需要密码
      if (shareSettings.password && !shareSettings.is_public) {
        setNeedPassword(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    } catch (err) {
      toast.error('加载文档失败');
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: shareSettings, error } = await supabase
        .from('share_settings')
        .select('*, documents(id, title, content)')
        .eq('share_id', shareId)
        .eq('password', password)
        .single();

      if (error || !shareSettings) {
        toast.error('密码错误');
        return;
      }

      setDocument(shareSettings.documents);
      setNeedPassword(false);
    } catch (err) {
      toast.error('验证失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Toaster position="top-center" />
        加载中...
      </div>
    );
  }

  if (needPassword) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow">
        <Toaster position="top-center" />
        <h1 className="text-xl font-bold mb-4">需要访问密码</h1>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4"
            placeholder="请输入访问密码"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            确认
          </button>
        </form>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center mt-20">
        <Toaster position="top-center" />
        文档不存在或已失效
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Toaster position="top-center" />
      <Header />
      <h1 className="text-2xl font-bold mb-6">{document.title}</h1>
      <Preview code={document.content || ''} />
    </div>
  );
} 