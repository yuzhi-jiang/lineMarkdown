import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  children?: Category[];
}

interface CategoryListProps {
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategoryId: string | null;
}

export default function CategoryList({ onSelectCategory, selectedCategoryId }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.user.id)
      .order('path');

    if (error) {
      toast.error('Error fetching categories');
      return;
    }

    const categoriesTree = buildCategoryTree(data || []);
    setCategories(categoriesTree);
  }

  function buildCategoryTree(flatCategories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const tree: Category[] = [];

    flatCategories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    flatCategories.forEach(category => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children?.push(categoryMap.get(category.id)!);
        }
      } else {
        tree.push(categoryMap.get(category.id)!);
      }
    });

    return tree;
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: newCategoryName,
        parent_id: parentId,
        user_id: user.user.id
      }])
      .select()
      .single();

    if (error) {
      toast.error('Error creating category');
      return;
    }

    toast.success('Category created');
    setIsAddingCategory(false);
    setNewCategoryName('');
    fetchCategories();
  }

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id}>
        <div 
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50
            ${selectedCategoryId === category.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => {
                const newExpanded = new Set(expandedIds);
                if (isExpanded) {
                  newExpanded.delete(category.id);
                } else {
                  newExpanded.add(category.id);
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
          <FolderIcon className="w-5 h-5 text-gray-400" />
          <span 
            onClick={() => onSelectCategory(category.id)}
            className="flex-1"
          >
            {category.name}
          </span>
        </div>
        {isExpanded && category.children?.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  const renderCategoryOptions = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <React.Fragment key={category.id}>
        <option value={category.id}>
          {'  '.repeat(level) + category.name}
        </option>
        {category.children && renderCategoryOptions(category.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b">
        <button
          onClick={() => setIsAddingCategory(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <PlusIcon className="w-5 h-5" />
          添加分类
        </button>
      </div>

      {isAddingCategory && (
        <div className="p-4 border-b">
          <form onSubmit={handleAddCategory}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
              placeholder="分类名称"
              autoFocus
            />
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 border rounded mb-2"
            >
              <option value="">顶级分类</option>
              {renderCategoryOptions(categories)}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white px-3 py-1 rounded"
              >
                确定
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="flex-1 bg-gray-200 px-3 py-1 rounded"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {categories.map(category => renderCategory(category))}
    </div>
  );
} 