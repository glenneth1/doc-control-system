import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Document, DocumentActivity, DocumentVersion } from '../types/api';
import VersionCompare from './VersionCompare';

interface DocumentHistoryProps {
  document: Document;
  onVersionView: (version: DocumentVersion) => void;
}

export default function DocumentHistory({ document, onVersionView }: DocumentHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activities, setActivities] = useState<DocumentActivity[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'versions'>('activity');
  const [selectedVersions, setSelectedVersions] = useState<DocumentVersion[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get<DocumentActivity[]>(`/documents/${document.id}/activities`);
        console.log('Fetched activities:', response.data);
        setActivities(response.data);
      } catch (err: any) {
        console.error('Error fetching activities:', err);
        setError(err.response?.data?.detail || 'Failed to load document history');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [document.id]);

  useEffect(() => {
    fetchHistory();
  }, [document.id]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const [activitiesResponse, versionsResponse] = await Promise.all([
        api.get<DocumentActivity[]>(`/documents/${document.id}/activities`),
        api.get<DocumentVersion[]>(`/documents/${document.id}/versions`)
      ]);

      setActivities(activitiesResponse.data);
      setVersions(versionsResponse.data.sort((a, b) => b.version_number - a.version_number));
    } catch (err: any) {
      setError('Failed to load document history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkout':
        return '📤';
      case 'checkin':
        return '📥';
      case 'view':
        return '👁';
      default:
        return '📝';
    }
  };

  const handleVersionSelect = (version: DocumentVersion) => {
    const index = selectedVersions.findIndex(v => v.id === version.id);
    if (index === -1) {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, version]);
      }
    } else {
      setSelectedVersions(selectedVersions.filter(v => v.id !== version.id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-solarized-base1">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-solarized-red bg-opacity-10 p-4">
        <p className="text-solarized-red text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-solarized-base01">
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'activity'
              ? 'border-b-2 border-solarized-blue text-solarized-blue'
              : 'text-solarized-base1'
          }`}
        >
          Activity Log
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'versions'
              ? 'border-b-2 border-solarized-blue text-solarized-blue'
              : 'text-solarized-base1'
          }`}
        >
          Versions
        </button>
      </div>

      {activeTab === 'activity' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-solarized-base1">Document History</h3>
          {activities.length === 0 ? (
            <p className="text-solarized-base1">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-md bg-solarized-base02"
                >
                  <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-solarized-base1">
                        <span className="font-medium">{activity.user.username}</span>
                        {' '}
                        {activity.activity_type === 'checkout' ? 'checked out' :
                         activity.activity_type === 'checkin' ? 'checked in' :
                         activity.activity_type === 'view' ? 'viewed' : 'modified'} the document
                      </p>
                      <span className="text-sm text-solarized-base01">
                        {formatDate(activity.activity_time)}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="mt-1 text-sm text-solarized-base0">{activity.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {versions.length === 0 ? (
            <p className="text-solarized-base1">No versions available.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-solarized-base1">
                  {selectedVersions.length === 2 ? (
                    <button
                      onClick={() => setShowCompare(true)}
                      className="btn btn-primary"
                    >
                      Compare Selected Versions
                    </button>
                  ) : (
                    <span>Select two versions to compare</span>
                  )}
                </div>
                {selectedVersions.length > 0 && (
                  <button
                    onClick={() => setSelectedVersions([])}
                    className="text-sm text-solarized-base1 hover:text-solarized-blue"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`card hover:bg-solarized-base02 transition-colors ${
                      selectedVersions.some(v => v.id === version.id)
                        ? 'border-2 border-solarized-blue'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedVersions.some(v => v.id === version.id)}
                            onChange={() => handleVersionSelect(version)}
                            className="form-checkbox h-4 w-4 text-solarized-blue"
                          />
                          <h4 className="text-lg font-medium text-solarized-base1">
                            Version {version.version_number}
                          </h4>
                        </div>
                        {version.comments && (
                          <p className="mt-1 text-solarized-base0">{version.comments}</p>
                        )}
                        <p className="mt-2 text-sm text-solarized-base01">
                          Created by {version.created_by.full_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-solarized-base01">
                          {formatDate(version.created_at)}
                        </span>
                        <button
                          onClick={() => onVersionView(version)}
                          className="btn btn-secondary text-sm"
                        >
                          View Version
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showCompare && selectedVersions.length === 2 && (
        <VersionCompare
          document={document}
          version1={selectedVersions[0]}
          version2={selectedVersions[1]}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
