import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast, Toaster } from 'react-hot-toast';
import React from 'react';
import { useUser } from '../contexts/UserContext';

export default function ResetPassword() {


  
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // 从 URL 获取 token
  const token = searchParams.get('token');
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('token', token);
    if (!token) {
      toast.error('无效的重置链接');
      return;
    }

    try {
    
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setLoading(true);
      const confirmed = window.confirm('密码重置成功,是否前往登录页面?');
      if (confirmed) {
        navigate('/login');
      }
    
    } catch (error: any) {
      toast.error(error.message || '密码重置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Toaster position="top-center" />
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            重置密码
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              新密码
            </label>
            <input
              id="password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入新密码"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? '处理中...' : '重置密码'}
          </button>
        </form>
      </div>
    </div>
  );
} 