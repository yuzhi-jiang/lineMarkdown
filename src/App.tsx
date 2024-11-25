import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
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
import MarkdownToolbar from './components/MarkdownToolbar';
import Header from './components/Header';
import ResetPassword from './components/ResetPassword';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ChangePassword from './pages/ChangePassword';
import SharedDocument from './pages/SharedDocument';
// 路由配置
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/share/:shareId" element={<SharedDocument />} />
      {/* <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} /> */}
      <Route path="/" element={<App />} />
    </Routes>
  );
};

// 受保护的路由组件
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const [session, setSession] = useState(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       console.log('session', session);
//       setSession(session);
//     });
//   }, []);

//   if (!session) {
//     return <Navigate to="/login" />;
//   }

//   return <>{children}</>;
// };

/**
 * App 组件是应用程序的主要入口点
 * 管理用户会话、文档编辑和预览功能
 */
function App() {
  const navigate = useNavigate();
  // 用户会话状态
  const [session, setSession] = useState(null);
  // 当前选中的文档
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  // 当前选中的分类ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  // 编辑器和预览区域的分割位置(百分比)
  const [splitPosition, setSplitPosition] = useState(50);
  // 分割条的引用
  const splitDragRef = useRef<HTMLDivElement>(null);
  // Monaco编辑器的引用
  const monacoRef = useRef<any>(null);

  // 初始化用户会话和监听会话变化
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "PASSWORD_RECOVERY") {
        navigate('/reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);


   

  /**
   * 处理编辑器内容变化
   * @param value 新的文档内容
   */
  const handleEditorChange = async (value: string | undefined) => {
    if (!value || !currentDocument) return;
    
    setCurrentDocument({
      ...currentDocument,
      content: value
    });

    // 更新数据库中的文档内容
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

  /**
   * 处理Markdown工具栏的插入操作
   * @param text 要插入的文本
   * @param cursorOffset 光标偏移量
   */
  const handleMarkdownInsert = (text: string, cursorOffset?: number) => {
    if (!currentDocument) return;
    
    const editor = monacoRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const position = editor.getPosition();
    
    // 获取当前选中的文本
    const selectedText = editor.getModel().getValueInRange(selection);
    
    // 根据不同的Markdown语法处理插入文本和光标位置
    let finalText = text;
    let cursorPos;
    if(text.includes('```')){
      finalText = '```';
      cursorPos = position.column + 3;
    }else if (text.includes('``')) {
      finalText = '``';
      cursorPos = position.column + 1;
    } else if (text.includes('**')) {
      finalText = '****';
      cursorPos = position.column + 2;
    } else if (text.includes('*')) {
      finalText = '**';
      cursorPos = position.column + 1;
    } else if (text.includes('[]')) {
      finalText = '[](url)';
      cursorPos = position.column + 1;
    } else if (text.includes('![]')) {
      finalText = '![](url)';
      cursorPos = position.column + 2;
    } else {
      cursorPos = position.column + text.length;
    }

    // 执行编辑操作
    const op = {
      range: selection,
      text: finalText,
      forceMoveMarkers: true
    };
    
    editor.executeEdits("my-source", [op]);
    
    // 设置新的光标位置并聚焦编辑器
    editor.setPosition({
      lineNumber: position.lineNumber,
      column: cursorPos
    });
    editor.focus();
  };

  // 如果用户未登录，显示登录界面
  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth />
      </>
    );
  }

  // 主界面布局
  return (
    <>
      <Header />
      
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex min-h-0">
          {/* 文档列表侧边栏 */}
          <DocumentList
            onSelectDocument={setCurrentDocument}
            currentDocument={currentDocument}
          />
          {/* 文档编辑区域 */}
          {currentDocument && (
            <div className="flex-1 flex flex-col gap-2 min-h-0 p-4 bg-[#F5F5F0]">
              <div className="space-y-1">
                {/* 文档标题 */}
                <DocumentTitle 
                  document={currentDocument} 
                  onUpdate={(updatedDoc) => setCurrentDocument(updatedDoc)}
                />
                {/* Markdown工具栏 */}
                <MarkdownToolbar onInsert={handleMarkdownInsert} />
              </div>
              {/* 编辑器和预览区域 */}
              <div className="flex gap-4 flex-1 min-h-0">
                {/* Monaco编辑器 */}
                <div style={{ width: `${splitPosition}%` }} className="flex-shrink-0 min-h-0 rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="markdown"
                    value={currentDocument.content}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 6,
                        horizontalScrollbarSize: 6,
                        verticalSliderSize: 6,
                        horizontalSliderSize: 6
                      }
                    }}
                    onMount={(editor) => {
                      monacoRef.current = editor;
                    }}
                  />
                </div>
                {/* Markdown预览区域 */}
                <div style={{ width: `${100 - splitPosition}%` }} className="flex-shrink-0 min-h-0">
                  <Preview code={currentDocument.content} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </Router>
  );
}

export default AppWrapper;