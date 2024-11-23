import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Document, Category } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ChevronDownIcon, FolderIcon, DocumentIcon, PencilIcon, TrashIcon, DocumentPlusIcon, FolderPlusIcon } from '@heroicons/react/24/outline';

interface DocumentListProps {
  onSelectDocument: (doc: Document) => void;
  currentDocument: Document | null;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'category' | 'document';
  children?: TreeNode[];
  document?: Document;
  category?: Category;
  parent_id: string | null;
}

export default function DocumentList({ onSelectDocument, currentDocument }: DocumentListProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'category' | 'document'>('document');
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    fetchTreeData();
    const subscription = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, fetchTreeData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchTreeData)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchTreeData() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // 获取所有分类
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.user.id)
      .order('path');

    // 获取所有文档
    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.user.id)
      .order('updated_at', { ascending: false });

    if (categories && documents) {
      const tree = buildTree(categories, documents);
      setTreeData(tree);
    }
  }

  function buildTree(categories: Category[], documents: Document[]): TreeNode[] {
    const categoryMap = new Map<string, TreeNode>();
    const tree: TreeNode[] = [];

    // 首先创建所有分类节点
    categories.forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        type: 'category',
        category,
        parent_id: category.parent_id,
        children: []
      });
    });

    // 将文档添加到对应分类中
    documents.forEach(doc => {
      const node: TreeNode = {
        id: doc.id,
        name: doc.title,
        type: 'document',
        document: doc,
        parent_id: doc.category_id
      };

      if (doc.category_id && categoryMap.has(doc.category_id)) {
        categoryMap.get(doc.category_id)!.children!.push(node);
      }
    });

    // 构建树形结构
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      if (!category.parent_id) {
        tree.push(node);
      } else if (categoryMap.has(category.parent_id)) {
        categoryMap.get(category.parent_id)!.children!.push(node);
      }
    });

    return tree;
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      if (newItemType === 'category') {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: newItemName,
            parent_id: selectedNode?.type === 'category' ? selectedNode.id : null,
            user_id: user.user.id
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('documents')
          .insert([{
            title: newItemName,
            content: '# 新文档\n\n开始编写...',
            category_id: selectedNode?.type === 'category' ? selectedNode.id : null,
            user_id: user.user.id,
            is_public: false
          }]);

        if (error) throw error;
      }

      toast.success(newItemType === 'category' ? '分类创建成功' : '文档创建成功');
      setIsAdding(false);
      setNewItemName('');
      await fetchTreeData();
    } catch (err) {
      toast.error('创建失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (node: TreeNode) => {
    if (!confirm(`确定要删除${node.type === 'category' ? '分类' : '文档'}吗？`)) return;

    try {
      const { error } = await supabase
        .from(node.type === 'category' ? 'categories' : 'documents')
        .delete()
        .eq('id', node.id);

      if (error) throw error;
      toast.success('删除成功');
      await fetchTreeData();
    } catch (err) {
      toast.error('删除失败');
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    try {
      if (selectedNode.type === 'category') {
        const { error } = await supabase
          .from('categories')
          .update({ name: newItemName })
          .eq('id', selectedNode.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('documents')
          .update({ title: newItemName })
          .eq('id', selectedNode.id);

        if (error) throw error;
      }

      toast.success('重命名成功');
      setIsRenaming(false);
      setNewItemName('');
      await fetchTreeData();
    } catch (err) {
      toast.error('重命名失败');
    }
  };

  const renderTreeNode = (node: TreeNode, level = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div 
          className={`group flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50
            ${node.type === 'document' && node.document?.id === currentDocument?.id ? 
              'bg-blue-50 border-l-4 border-l-blue-500' : ''}
            ${node.id === selectedNode?.id ? 'bg-gray-100' : ''}`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
          onClick={() => {
            if (node.type === 'document' && node.document) {
              onSelectDocument(node.document);
            }
            setSelectedNode(node);
          }}
        >
          {node.type === 'category' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newExpanded = new Set(expandedIds);
                if (isExpanded) {
                  newExpanded.delete(node.id);
                } else {
                  newExpanded.add(node.id);
                }
                setExpandedIds(newExpanded);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          {node.type === 'category' ? (
            <FolderIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <DocumentIcon className="w-5 h-5 text-gray-400" />
          )}
          <span className="flex-1 truncate">{node.name}</span>
        </div>
        {isExpanded && node.children?.map(child => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="relative h-full">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3 z-10 w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-100"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4" />
        )}
      </button>
      
      <div className={`bg-white shadow-lg transition-all duration-300 h-full ${isCollapsed ? 'w-0' : 'w-64'} overflow-hidden`}>
        <div className="flex-1 flex flex-col">
          <div className="p-4 flex justify-between items-center border-b">
            {!isCollapsed && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNewItemType('document');
                    setIsAdding(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="新建文档"
                >
                  <DocumentPlusIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setNewItemType('category');
                    setIsAdding(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="新建分类"
                >
                  <FolderPlusIcon className="w-5 h-5" />
                </button>
                {selectedNode && (
                  <>
                    <button
                      onClick={() => {
                        setNewItemName(selectedNode.name);
                        setIsRenaming(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="重命名"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedNode)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="删除"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {(isAdding || isRenaming) && !isCollapsed && (
            <div className="p-4 border-b">
              <form onSubmit={isAdding ? handleAddItem : handleRename}>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 border rounded mb-2"
                  placeholder={`${isRenaming ? '新名称' : newItemType === 'category' ? '分类名称' : '文档名称'}`}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    确定
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setIsRenaming(false);
                      setNewItemName('');
                    }}
                    className="flex-1 bg-gray-200 px-3 py-1 rounded"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        </div>
      </div>
    </div>
  );
}