import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGemoji from 'remark-gemoji';
import rehypeMermaid from 'rehype-mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface PreviewProps {
  code: string;
}

export default function Preview({ code }: PreviewProps) {
  useEffect(() => {
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      });
    });
  }, []);

  return (
    <div className="h-full overflow-hidden">
      <div className="prose prose-slate max-w-none h-full overflow-y-auto p-4 pr-6 bg-white rounded-lg custom-scrollbar">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            remarkMath,
            remarkGemoji,
          ]}
          rehypePlugins={[
            rehypeKatex,
            [rehypeMermaid, { strategy: 'pre-mermaid' }],
          ]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            a: ({node, ...props}) => (
              <a 
                {...props} 
                className="text-blue-500 hover:text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              />
            )
          }}
        >
          {code}
        </ReactMarkdown>
      </div>
    </div>
  );
}