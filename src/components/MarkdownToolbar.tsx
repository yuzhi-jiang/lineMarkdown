import React from 'react';

interface MarkdownToolbarProps {
  onInsert: (text: string) => void;
}

export default function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const toolGroups = [
    {
      title: '标题',
      tools: [
        { text: '# ', label: 'H1' },
        { text: '## ', label: 'H2' },
        { text: '### ', label: 'H3' },
      ]
    },
    {
      title: '格式',
      tools: [
        { text: '**', label: 'B' },
        { text: '*', label: 'I' },
        { text: '``', label: '代码' },
        { text: '```', label: '代码块' },
        { text: '~~', label: '删除线' },
      ]
    },
    {
      title: '列表',
      tools: [
        { text: '- ', label: '列表' },
        { text: '1. ', label: '数字列表' },
      ]
    },
    {
      title: '其他',
      tools: [
        { text: '> ', label: '引用' },
        { text: '[]', label: '链接' },
        { text: '![]', label: '图片' },
        { text: '---\n', label: '分割线' },
      ]
    },
    {
      title: '图表',
      tools: [
        { 
          text: '```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```\n', 
          label: 'Mermaid' 
        },
        { 
          text: '$E = mc^2$', 
          label: '数学公式' 
        },
      ]
    },
  ];

  return (
    <div className="flex flex-col bg-[#FAFBFC] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-4">
        {toolGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-1">
            {groupIndex > 0 && (
              <div className="h-8 w-px bg-gray-300 mx-2" />
            )}
            <div className="flex items-center gap-1">
              {group.tools.map((tool, index) => (
                <button
                  key={index}
                  onClick={() => onInsert(tool.text)}
                  className="px-2.5 py-1.5 text-sm bg-white hover:bg-gray-50 
                           rounded transition-colors duration-200 font-medium
                           text-gray-700 hover:text-gray-900 border border-gray-200"
                  title={tool.label}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 