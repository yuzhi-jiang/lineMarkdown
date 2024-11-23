import * as React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://avatars.githubusercontent.com/u/45190043?v=4"
            alt="Avatar"
            className="w-20 h-20 rounded-full mb-4 border-2 border-blue-500"
          />
          <h1 className="text-2xl font-bold text-center">欢迎使用 Markdown Editor Pro</h1>
          <p className="text-gray-600 mt-2">登录以开始使用</p>
        </div>
        <SupabaseAuth 
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3B82F6',
                  brandAccent: '#2563EB',
                }
              }
            },
            style: {
              button: {
                borderRadius: '6px',
                height: '40px'
              },
              input: {
                borderRadius: '6px',
                height: '40px'
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: '邮箱',
                password_label: '密码',
                button_label: '登录',
                loading_button_label: '登录中...',
                email_input_placeholder: '请输入邮箱',
                password_input_placeholder: '请输入密码'
              },
              sign_up: {
                email_label: '邮箱',
                password_label: '密码',
                button_label: '注册',
                loading_button_label: '注册中...',
                email_input_placeholder: '请输入邮箱',
                password_input_placeholder: '请输入密码'
              }
            }
          }}
        />
      </div>
    </div>
  );
}