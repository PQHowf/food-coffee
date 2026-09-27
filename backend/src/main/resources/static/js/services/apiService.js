/**
 * services/apiService.js - Tầng Service kết nối Java Spring Boot REST API
 */

// Cấu hình URL Backend: Tự động nhận diện domain hiện tại (Render) hoặc localhost
const API_BASE_URL = window.API_BASE_URL ||
  (window.location.hostname.includes('render.com') ? `${window.location.origin}/api` : null) ||
  localStorage.getItem('RENDER_API_BASE_URL') ||
  'http://localhost:8080/api';

const apiService = {
  isBackendAvailable: null,

  async checkBackend() {
    if (this.isBackendAvailable !== null) return this.isBackendAvailable;
    try {
      const res = await fetch(`${API_BASE_URL}/places`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      this.isBackendAvailable = res.ok;
    } catch {
      this.isBackendAvailable = false;
    }
    return this.isBackendAvailable;
  },

  async getPlaces(category = 'all', city = 'all', search = '') {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (city && city !== 'all') params.append('city', city);
        if (search) params.append('search', search);

        const res = await fetch(`${API_BASE_URL}/places?${params.toString()}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Lỗi kết nối Backend Java, dùng dữ liệu client:', err);
      }
    }
    return null;
  },

  async createPlace(placeData) {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/places`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(placeData)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Không thể lưu quán qua backend:', err);
      }
    }
    return null;
  },

  async updatePlace(id, placeData) {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/places/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(placeData)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Không thể cập nhật quán qua backend:', err);
      }
    }
    return null;
  },

  async deletePlace(id) {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/places/${id}`, {
          method: 'DELETE'
        });
        return res.ok;
      } catch (err) {
        console.error('Không thể xoá quán qua backend:', err);
      }
    }
    return false;
  },

  async uploadImage(file) {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          return data.url.startsWith('http') ? data.url : `http://localhost:8080${data.url}`;
        }
      } catch (err) {
        console.error('Không thể upload ảnh lên backend:', err);
      }
    }
    return null;
  },

  async loginOrRegister(name, role) {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, role })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error('Lỗi gọi API user login:', err);
      }
    }
    return null;
  }
};
