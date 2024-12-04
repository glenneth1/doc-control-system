import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Document, DocumentVersion } from '../types/api';
import TaskManager from './TaskManager';
import DocumentHistory from './DocumentHistory';
import DocumentCheckout from './DocumentCheckout';
import { useAuth } from '../contexts/AuthContext';

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

  const { currentUser } = useAuth();

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
      setError('');
    } catch (err) {
      console.error('Error loading document content:', err);
      setError('Failed to load document content');
    } finally {
      setLoading(false);
      setIsVisible(true);
    }
  }, [document?.id, selectedVersion?.version_number, document.mime_type, fileUrl]);

  useEffect(() => {
    loadDocumentContent();
  }, [loadDocumentContent]);

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const handleViewVersion = useCallback((version: DocumentVersion) => {
    setSelectedVersion(version);
    setActiveTab('preview');
    setLoading(true);
    setIsVisible(false);
  }, []);

  const handleView = useCallback(() => {
    setSelectedVersion(null);
    setActiveTab('preview');
    setLoading(true);
    setIsVisible(false);
  }, []);

  const handleCheckoutUpdate = useCallback((updatedDoc: Document) => {
    setDocument(updatedDoc);
    if (onUpdate) {
      onUpdate();
    }
  }, [onUpdate]);

  const handleDownload = useCallback(async () => {
    if (!document?.id) return;

    try {
      const response = await api.get(`/documents/${document.id}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = document.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document');
    }
  }, [document?.id, document?.title]);

  const documentContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-solarized-base1">Loading document...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-md bg-solarized-red bg-opacity-10 p-4 mb-4">
          <p className="text-solarized-red text-sm">{error}</p>
        </div>
      );
    }

    if (fileUrl) {
      if (document.mime_type?.includes('pdf')) {
        return (
          <iframe
            src={fileUrl}
            className="w-full h-[calc(90vh-12rem)] border-0 rounded-md"
            title={document.title}
          />
        );
      }
      if (document.mime_type?.startsWith('image/')) {
        return (
          <img
            src={fileUrl}
            alt={document.title}
            className="max-w-full h-auto rounded-md"
          />
        );
      }
    }

    if (content) {
      return (
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-solarized-base1 bg-solarized-base02 p-4 rounded-md">
            {content}
          </pre>
        </div>
      );
    }

    return (
      <p className="text-solarized-base1">No preview available</p>
    );
  }, [loading, error, fileUrl, content, document.mime_type, document.title]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-solarized-base03 bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
        <div className="flex justify-center items-center">
          <p className="text-solarized-base1">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-solarized-base03 bg-opacity-75 flex items-center justify-center p-4 z-[9999] document-viewer-modal"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-solarized-base03 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col document-viewer-content">
        <div className="p-4 border-b border-solarized-base01">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="heading-2 text-solarized-base1">
                {document.title}
                {selectedVersion && (
                  <span className="ml-2 text-sm text-solarized-base01">
                    (Version {selectedVersion.version_number})
                  </span>
                )}
              </h2>
              {selectedVersion && (
                <button
                  onClick={handleView}
                  className="text-sm text-solarized-blue hover:text-solarized-base1"
                >
                  Return to latest version
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-solarized-base1 hover:text-solarized-base0"
            >
              ✕
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-t-md ${
                activeTab === 'preview'
                  ? 'bg-solarized-base02 text-solarized-base1'
                  : 'text-solarized-base01 hover:text-solarized-base1'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-t-md ${
                activeTab === 'tasks'
                  ? 'bg-solarized-base02 text-solarized-base1'
                  : 'text-solarized-base01 hover:text-solarized-base1'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-t-md ${
                activeTab === 'history'
                  ? 'bg-solarized-base02 text-solarized-base1'
                  : 'text-solarized-base01 hover:text-solarized-base1'
              }`}
            >
              History
            </button>

            <div className="flex-1"></div>

            {!selectedVersion && (
              <button
                onClick={() => setShowCheckout(true)}
                className={`btn ${document.current_checkout ? 'btn-secondary' : 'btn-primary'}`}
                disabled={!!document.current_checkout && document.current_checkout.checked_out_by.id !== currentUser?.id}
              >
                {document.current_checkout ? 'Check In' : 'Check Out'}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="btn btn-secondary"
              disabled={loading}
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'preview' && documentContent}
          {activeTab === 'tasks' && (
            <TaskManager
              document={document}
              onClose={() => setActiveTab('preview')}
              onTaskUpdate={onUpdate}
            />
          )}
          {activeTab === 'history' && (
            <DocumentHistory document={document} onVersionView={handleViewVersion} />
          )}
        </div>
      </div>

      {showCheckout && (
        <DocumentCheckout
          document={document}
          onClose={() => setShowCheckout(false)}
          onCheckoutUpdate={handleCheckoutUpdate}
        />
      )}
    </div>
  );
}
