import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Document, DocumentVersion } from '../types/api';
import TaskManager from './TaskManager';
import DocumentHistory from './DocumentHistory';
import DocumentCheckout from './DocumentCheckout';

interface DocumentViewerProps {
  initialDocument: Document;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function DocumentViewer({ initialDocument, onClose, onUpdate }: DocumentViewerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [document, setDocument] = useState<Document>(initialDocument);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'tasks' | 'history'>('preview');
  const [showCheckout, setShowCheckout] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(null);

  const loadDocumentContent = useCallback(async () => {
    if (!document?.id) return;

    try {
      setLoading(true);
      setError('');

      let url = `/documents/${document.id}`;
      if (selectedVersion?.version_number) {
        url += `/versions/${selectedVersion.version_number}`;
      }
      url += '/download';

      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });

      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

      if (document.mime_type?.includes('pdf') || document.mime_type?.startsWith('image/')) {
        const newUrl = URL.createObjectURL(blob);
        setFileUrl(newUrl);
        setContent(null);
      } else {
        const text = await blob.text();
        setContent(text);
        setFileUrl(null);
      }
    } catch (err) {
      console.error('Error loading document content:', err);
      setError('Failed to load document content');
    } finally {
      setLoading(false);
    }
  }, [document?.id, selectedVersion?.version_number, fileUrl]);

  const handleIframeLoad = useCallback(() => {
    if (iframeElement && document.mime_type?.includes('pdf')) {
      const doc = iframeElement.contentDocument;
      if (doc) {
        const style = doc.createElement('style');
        style.textContent = `
          body {
            margin: 0;
            background-color: #073642;
          }
        `;
        doc.head.appendChild(style);
      }
    }
  }, [iframeElement, document.mime_type]);

  useEffect(() => {
    loadDocumentContent();
  }, [loadDocumentContent]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleDocumentUpdate = useCallback((updatedDoc: Document) => {
    setDocument(updatedDoc);
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solarized-blue"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-solarized-red">
          {error}
        </div>
      );
    }

    if (fileUrl) {
      if (document.mime_type?.includes('pdf')) {
        return (
          <iframe
            ref={setIframeElement}
            src={fileUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
          />
        );
      }
      if (document.mime_type?.startsWith('image/')) {
        return (
          <img
            src={fileUrl}
            alt={document.title}
            className="max-w-full max-h-full object-contain mx-auto"
          />
        );
      }
    }

    if (content) {
      return (
        <pre className="whitespace-pre-wrap font-mono text-sm p-4 h-full overflow-auto">
          {content}
        </pre>
      );
    }

    return null;
  }, [loading, error, fileUrl, content, document.mime_type, document.title, handleIframeLoad]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className="bg-solarized-base02 w-11/12 h-5/6 max-w-6xl rounded-lg shadow-xl flex flex-col overflow-hidden transition-transform duration-300 transform"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        }}
      >
        <div className="flex justify-between items-center p-4 border-b border-solarized-base01">
          <h2 className="text-xl font-semibold text-solarized-base1">{document.title}</h2>
          <button
            onClick={handleClose}
            className="text-solarized-base1 hover:text-solarized-base0 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto relative">
            {renderContent}
          </div>

          <div className="w-80 border-l border-solarized-base01 flex flex-col">
            <div className="flex border-b border-solarized-base01">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium focus:outline-none ${
                  activeTab === 'preview'
                    ? 'text-solarized-blue border-b-2 border-solarized-blue'
                    : 'text-solarized-base1 hover:text-solarized-base0'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium focus:outline-none ${
                  activeTab === 'tasks'
                    ? 'text-solarized-blue border-b-2 border-solarized-blue'
                    : 'text-solarized-base1 hover:text-solarized-base0'
                }`}
                onClick={() => setActiveTab('tasks')}
              >
                Tasks
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium focus:outline-none ${
                  activeTab === 'history'
                    ? 'text-solarized-blue border-b-2 border-solarized-blue'
                    : 'text-solarized-base1 hover:text-solarized-base0'
                }`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'tasks' && (
                <TaskManager 
                  document={document}
                  onClose={() => setActiveTab('preview')}
                  onTaskUpdate={() => onUpdate?.()}
                />
              )}
              {activeTab === 'history' && (
                <DocumentHistory
                  document={document}
                  onVersionView={(version) => setSelectedVersion(version)}
                />
              )}
            </div>

            <div className="p-4 border-t border-solarized-base01">
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full px-4 py-2 bg-solarized-blue text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solarized-blue"
              >
                Manage Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <DocumentCheckout
          document={document}
          onClose={() => setShowCheckout(false)}
          onCheckoutUpdate={() => {
            const updatedDoc = { ...document, checked_out: true };
            handleDocumentUpdate(updatedDoc);
          }}
        />
      )}
    </div>
  );
}
