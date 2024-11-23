import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  return (
    <div className="bg-white h-[90vh] rounded-lg shadow-lg p-4 overflow-y-auto">
      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{code}</ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;