import { api } from "./api";

const upload = async (file) => {
  if (!file) return null;
  try {
    const data = await api.uploadFile(file);
    return data.url;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export default upload;
