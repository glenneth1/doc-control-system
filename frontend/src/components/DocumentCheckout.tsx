import React, { useState } from 'react';
import { documentService } from '../services/document';
import { Document } from '../types/api';

interface DocumentCheckoutProps {
  document: Document;
  onClose: () => void;
  onCheckoutUpdate: () => void;
}

export default function DocumentCheckout({ document, onClose, onCheckoutUpdate }: DocumentCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [comments, setComments] = useState('');
  const [newVersion, setNewVersion] = useState<File | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('comments', comments);

      const updatedDoc = await documentService.checkoutDocument(document.id, comments);
      console.log('Document checked out:', updatedDoc);
      
      if (onCheckoutUpdate) {
        onCheckoutUpdate();
      }
    } catch (err: any) {
      console.error('Error checking out document:', err);
      setError(err.response?.data?.detail || 'Failed to check out document');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('comments', comments);
      
      if (newVersion) {
        formData.append('new_version', newVersion);
      }

      const updatedDoc = await documentService.checkinDocument(document.id, comments, newVersion || undefined);
      console.log('Document checked in:', updatedDoc);
      
      if (onCheckoutUpdate) {
        onCheckoutUpdate();
      }
    } catch (err: any) {
      console.error('Error checking in document:', err);
      setError(err.response?.data?.detail || 'Failed to check in document');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNewVersion(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-4">
          {document.current_checkout ? 'Check In Document' : 'Check Out Document'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            {debugInfo && (
              <pre className="mt-2 text-sm whitespace-pre-wrap">{debugInfo}</pre>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter your comments..."
            rows={4}
          />
        </div>
        
        {document.current_checkout && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Version (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={document.current_checkout ? handleCheckin : handleCheckout}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : document.current_checkout ? 'Check In' : 'Check Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
