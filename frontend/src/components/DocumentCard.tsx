import React from 'react';
import { Document } from '../types/api';

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onUpdate: () => void;
}

export default function DocumentCard({ document, onView, onUpdate }: DocumentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="card bg-solarized-base02 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-solarized-base1">{document.title}</h3>
        <span className="text-sm text-solarized-base01">v{document.version}</span>
      </div>
      
      {document.description && (
        <p className="mt-2 text-solarized-base0">{document.description}</p>
      )}
      
      <div className="mt-4 flex flex-wrap gap-2">
        {document.tags?.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-solarized-base03 text-solarized-base0"
          >
            {tag.name}
          </span>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-solarized-base01">
        <p>Created: {formatDate(document.created_at)}</p>
        <p>Updated: {formatDate(document.updated_at)}</p>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onView(document)}
          className="btn btn-primary text-sm"
        >
          View
        </button>
      </div>
    </div>
  );
}
