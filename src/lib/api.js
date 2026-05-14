const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });

    try {
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth APIs
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User APIs
  async getUserInfo(uid) {
    return this.request(`/user/${uid}`);
  }

  async getAllUsers() {
    return this.request('/user');
  }

  async updateUser(uid, userData) {
    return this.request(`/user/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Chat APIs
  async getUserChats(userId) {
    return this.request(`/chat/userchats/${userId}`);
  }

  async updateUserChats(userId, chats) {
    return this.request(`/chat/userchats/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ chats }),
    });
  }

  async getOrCreateChat(firstUserId, secondUserId) {
    return this.request('/chat/chat', {
      method: 'POST',
      body: JSON.stringify({ firstUserId, secondUserId }),
    });
  }

  async getChat(chatId) {
    return this.request(`/chat/chat/${chatId}`);
  }

  async addMessage(chatId, message) {
    return this.request(`/chat/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async getMessages(userId, otherUserId) {
    return this.request(`/chat/messages/${userId}/${otherUserId}`);
  }

  // Upload API
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading to:', `${API_BASE_URL}/upload`);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  }

  // Friend Request APIs
  async sendFriendRequest(fromUserId, toUserId) {
    return this.request('/friend/request', {
      method: 'POST',
      body: JSON.stringify({ fromUserId, toUserId }),
    });
  }

  async getFriendRequests(userId) {
    return this.request(`/friend/requests/${userId}`);
  }

  async acceptFriendRequest(requestId) {
    return this.request('/friend/accept', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    });
  }

  async rejectFriendRequest(requestId) {
    return this.request('/friend/reject', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    });
  }

  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
  }
}

export const api = new ApiService();
export default api;
