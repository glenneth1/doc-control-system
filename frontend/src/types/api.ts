export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface Tag {
  id: number;
  name: string;
}

export interface DocumentVersion {
  id: number;
  version_number: number;
  file_path: string;
  created_at: string;
  created_by: User;
  comments: string;
}

export interface DocumentActivity {
  id: number;
  activity_type: 'checkout' | 'checkin' | 'view';
  activity_time: string;
  details?: string;
  user: {
    id: number;
    username: string;
    full_name: string;
  };
}

export interface Document {
  id: number;
  title: string;
  description?: string;
  file_path: string;
  mime_type: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  version: number;
  tags: Tag[];
  versions: DocumentVersion[];
  activities?: DocumentActivity[];
  created_by: User;
  current_checkout?: CheckOutLog;
  tasks?: Task[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface DocumentCreateRequest {
  title: string;
  description?: string;
  tags: string[];
  file: File;
}

export interface DocumentUpdateRequest {
  title?: string;
  description?: string;
  tags?: string[];
  file?: File;
}

export interface API_Document {
  id: number;
  title: string;
  description: string;
  version: number;
  file_path: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  created_by: User;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: User;
  assigned_by: User;
  created_at: string;
  updated_at: string;
  document_id: number;
}

export interface CheckOutLog {
  id: number;
  document_id: number;
  checked_out_by: User;
  checked_out_at: string;
  checked_in_at: string | null;
  status: 'checked_out' | 'checked_in';
  comments: string;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to_id: number;
}

export interface CheckOutRequest {
  comments: string;
}

export interface CheckInRequest {
  comments: string;
  new_version?: File;
}
