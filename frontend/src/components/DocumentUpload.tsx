import React, { useState } from 'react';
import api from '../services/api';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);

      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setTitle('');
      setDescription('');
      setTags('');
      setFile(null);
      setIsOpen(false);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        Upload Document
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-solarized-base03 bg-opacity-75 flex items-center justify-center p-4">
      <div className="card max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-2">Upload Document</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-solarized-base1 hover:text-solarized-base0"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-solarized-red bg-opacity-10 p-4">
              <p className="text-solarized-red text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-solarized-base1 text-sm font-medium mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-solarized-base1 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-solarized-base1 text-sm font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="e.g., important, report, draft"
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-solarized-base1 text-sm font-medium mb-2">
              File
            </label>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-solarized-base0 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-solarized-base02 file:text-solarized-base1 hover:file:bg-solarized-base01"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
