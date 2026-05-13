import { api } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const upload = async (file) => {
  if (!file) return null;
  try {
    const data = await api.uploadFile(file);
    // Ensure we return the full URL for the uploaded file
    if (data.url && data.url.startsWith('/')) {
      // If it's a relative path, prepend the API base URL
      return `${API_BASE_URL.replace('/api', '')}${data.url}`;
    }
    return data.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export default upload;
