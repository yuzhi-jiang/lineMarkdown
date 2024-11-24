import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useUser } from '../contexts/UserContext';
import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { profile, updateProfile, signOut } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const handleUpdateProfile = async () => {
    const error = await updateProfile({ full_name: fullName });
    
    if (error) {
      toast.error('更新失败');
      return;
    }

    toast.success('更新成功');
    setIsEditing(false);
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-bold text-gray-800">Markdown Editor Pro</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                placeholder="输入昵称"
                autoFocus
              />
              <button
                onClick={handleUpdateProfile}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-600 text-sm"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {profile?.full_name || profile?.email}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <PencilIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
          
          <Link
            to="/change-password"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            修改密码
          </Link>
          
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            退出登录
          </button>
        </div>
      </div>
    </header>
  );
} 