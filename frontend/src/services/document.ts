import api from './api';

interface Document {
  id: number;
  title: string;
  description: string;
  file_path: string;
  mime_type: string;
  version: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
  current_checkout?: {
    user_id: number;
    checkout_time: string;
    comments: string;
  };
}

interface DocumentVersion {
  id: number;
  document_id: number;
  version_number: number;
  file_path: string;
  changes: string;
  created_at: string;
}

interface DocumentActivity {
  id: number;
  document_id: number;
  user_id: number;
  activity_type: string;
  details: string;
  activity_time: string;
}

export const documentService = {
  // Get all documents
  getDocuments: async () => {
    const response = await api.get<Document[]>('/documents');
    return response.data;
  },

  // Get a single document
  getDocument: async (id: number) => {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  // Upload a new document
  uploadDocument: async (formData: FormData) => {
    const response = await api.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download a document
  downloadDocument: async (id: number, version?: number) => {
    const url = `/documents/${id}/download${version ? `?version=${version}` : ''}`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  },

  // Checkout a document
  checkoutDocument: async (id: number, comments: string) => {
    const formData = new FormData();
    formData.append('comments', comments);
    const response = await api.post<Document>(`/documents/${id}/checkout`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Check in a document
  checkinDocument: async (id: number, comments: string, newVersion?: File) => {
    const formData = new FormData();
    formData.append('comments', comments);
    if (newVersion) {
      formData.append('new_version', newVersion);
    }
    const response = await api.post<Document>(`/documents/${id}/checkin`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get document versions
  getDocumentVersions: async (id: number) => {
    const response = await api.get<DocumentVersion[]>(`/documents/${id}/versions`);
    return response.data;
  },

  // Get document activity
  getDocumentActivity: async (id: number) => {
    const response = await api.get<DocumentActivity[]>(`/documents/${id}/activity`);
    return response.data;
  },
};

export type { Document, DocumentVersion, DocumentActivity };
