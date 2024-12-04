import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Document } from '../types/api';
import DocumentUpload from '../components/DocumentUpload';
import DocumentViewer from '../components/DocumentViewer';
import DocumentCard from '../components/DocumentCard';

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<Document[]>('/documents');
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleViewDocument = useCallback((document: Document) => {
    setSelectedDocument(document);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  const handleDocumentUpdate = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-solarized-base01">
        <h1 className="heading-1 text-solarized-base1">My Documents</h1>
        <DocumentUpload onUploadSuccess={handleDocumentUpdate} />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-solarized-base1">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="rounded-md bg-solarized-red bg-opacity-10 p-4 mb-4">
            <p className="text-solarized-red text-sm">{error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-solarized-base1">No documents found. Upload your first document!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={handleViewDocument}
                onUpdate={handleDocumentUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {selectedDocument && (
        <DocumentViewer
          key={selectedDocument.id}
          initialDocument={selectedDocument}
          onClose={handleCloseViewer}
          onUpdate={handleDocumentUpdate}
        />
      )}
    </div>
  );
}
