import { api } from '../api';

export interface Setting {
  id: number;
  category: string;
  setting_key: string;
  setting_value: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  updated_by: number | null;
}

export interface SettingsCategoryUpdate {
  settings: Record<string, any>;
}

export interface AuditLog {
  id: number;
  setting_id: number;
  old_value: string | null;
  new_value: string | null;
  changed_by: number;
  ip_address: string | null;
  created_at: string;
}

export const getSettingsCategories = async (): Promise<string[]> => {
  const response = await api.get('/admin/settings/categories');
  return response.data;
};

export const getSettingsByCategory = async (category: string): Promise<Setting[]> => {
  const response = await api.get(`/admin/settings/${category}`);
  return response.data;
};

export const updateSettingsByCategory = async (category: string, data: SettingsCategoryUpdate): Promise<Setting[]> => {
  const response = await api.put(`/admin/settings/${category}`, data);
  return response.data;
};

export const uploadPlatformLogo = async (file: File): Promise<Setting> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/admin/settings/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getSettingsAuditLogs = async (skip = 0, limit = 100): Promise<AuditLog[]> => {
  const response = await api.get(`/admin/settings/audit-logs?skip=${skip}&limit=${limit}`);
  return response.data;
};
