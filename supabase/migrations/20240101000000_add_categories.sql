-- 首先启用 LTREE 扩展
CREATE EXTENSION IF NOT EXISTS ltree;

-- 然后创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES categories(id),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    path LTREE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX categories_path_idx ON categories USING GIST (path);

-- 为每个用户创建一个默认的根分类
INSERT INTO categories (name, user_id, path)
SELECT DISTINCT 
    '默认分类', 
    user_id, 
    replace(gen_random_uuid()::text, '-', '_')::ltree
FROM documents;

-- 添加 category_id 列到 documents 表
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 更新现有文档到默认分类
UPDATE documents d
SET category_id = c.id
FROM categories c
WHERE d.user_id = c.user_id
AND d.category_id IS NULL;

-- 启用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 添加 RLS 策略
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- 创建更新分类路径的函数
CREATE OR REPLACE FUNCTION public.update_category_path()
RETURNS trigger AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = replace(NEW.id::text, '-', '_')::ltree;
  ELSE
    SELECT path || replace(NEW.id::text, '-', '_')::ltree
    INTO NEW.path
    FROM categories
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER on_category_insert
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION public.update_category_path();