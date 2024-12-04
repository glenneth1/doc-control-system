import React, { useState, useEffect } from 'react';
import { Document, DocumentVersion } from '../types/api';
import api from '../services/api';
import { diffLines, Change } from 'diff';

interface VersionCompareProps {
  document: Document;
  version1: DocumentVersion;
  version2: DocumentVersion;
  onClose: () => void;
}

export default function VersionCompare({
  document,
  version1,
  version2,
  onClose
}: VersionCompareProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diff, setDiff] = useState<Change[]>([]);
  const [content1, setContent1] = useState<string>('');
  const [content2, setContent2] = useState<string>('');

  useEffect(() => {
    loadVersionContents();
  }, [version1.id, version2.id]);

  const loadVersionContents = async () => {
    try {
      setLoading(true);
      setError('');

      const [response1, response2] = await Promise.all([
        api.get(`/documents/${document.id}/versions/${version1.version_number}/download`, {
          responseType: 'blob'
        }),
        api.get(`/documents/${document.id}/versions/${version2.version_number}/download`, {
          responseType: 'blob'
        })
      ]);

      const fileType1 = response1.headers['content-type'];
      const fileType2 = response2.headers['content-type'];

      // Only compare text-based files
      if (!fileType1.startsWith('text/') || !fileType2.startsWith('text/')) {
        setError('Version comparison is only available for text-based files');
        return;
      }

      const text1 = await response1.data.text();
      const text2 = await response2.data.text();

      setContent1(text1);
      setContent2(text2);

      const differences = diffLines(text1, text2);
      setDiff(differences);
    } catch (err: any) {
      setError('Failed to load version contents');
    } finally {
      setLoading(false);
    }
  };

  const renderDiff = () => {
    return diff.map((part, index) => {
      const color = part.added
        ? 'bg-solarized-green bg-opacity-20'
        : part.removed
        ? 'bg-solarized-red bg-opacity-20'
        : '';

      return (
        <div
          key={index}
          className={`font-mono text-sm whitespace-pre-wrap p-1 ${color}`}
        >
          <span className="select-none mr-2">
            {part.added ? '+' : part.removed ? '-' : ' '}
          </span>
          {part.value}
        </div>
      );
    });
  };

  const renderSideBySide = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="overflow-auto">
          <h3 className="text-lg font-medium text-solarized-base1 mb-2">
            Version {version1.version_number}
          </h3>
          <pre className="font-mono text-sm whitespace-pre-wrap bg-solarized-base02 p-4 rounded">
            {content1}
          </pre>
        </div>
        <div className="overflow-auto">
          <h3 className="text-lg font-medium text-solarized-base1 mb-2">
            Version {version2.version_number}
          </h3>
          <pre className="font-mono text-sm whitespace-pre-wrap bg-solarized-base02 p-4 rounded">
            {content2}
          </pre>
        </div>
      </div>
    );
  };

  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  return (
    <div className="fixed inset-0 bg-solarized-base03 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-solarized-base03 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-solarized-base01">
          <div className="flex justify-between items-center mb-4">
            <h2 className="heading-2 text-solarized-base1">
              Compare Versions
            </h2>
            <button
              onClick={onClose}
              className="text-solarized-base1 hover:text-solarized-base0"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-solarized-base1">
              Comparing version {version1.version_number} with {version2.version_number}
            </div>
            <div className="flex-1" />
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'unified'
                    ? 'bg-solarized-blue text-solarized-base3'
                    : 'text-solarized-base1'
                }`}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'split'
                    ? 'bg-solarized-blue text-solarized-base3'
                    : 'text-solarized-base1'
                }`}
              >
                Side by Side
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-solarized-base1">Loading comparison...</p>
            </div>
          ) : error ? (
            <div className="rounded-md bg-solarized-red bg-opacity-10 p-4">
              <p className="text-solarized-red text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {viewMode === 'unified' ? renderDiff() : renderSideBySide()}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-solarized-base01 flex justify-end">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
