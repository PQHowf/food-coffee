/**
 * services/apiService.js - Tầng Service kết nối Java Spring Boot REST API
 */

// Cấu hình URL Backend: Tự động nhận diện domain hiện tại (Render) hoặc localhost
const API_BASE_URL = window.API_BASE_URL ||
  localStorage.getItem('RENDER_API_BASE_URL') ||
  (window.location.port === '3000' || window.location.port === '5500' ? 'http://localhost:8080/api' : `${window.location.origin}/api`);

const apiService = {
  isBackendAvailable: null,

  async checkBackend() {
    try {
      const res = await fetch(`${API_BASE_URL}/places`, { method: 'GET', signal: AbortSignal.timeout(4000) });
      this.isBackendAvailable = res.ok;
    } catch {
      this.isBackendAvailable = false;
    }
    return this.isBackendAvailable;
  },

  async getPlaces(category = 'all', city = 'all', search = '') {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (city && city !== 'all') params.append('city', city);
      if (search) params.append('search', search);

      const url = params.toString() ? `${API_BASE_URL}/places?${params.toString()}` : `${API_BASE_URL}/places`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        this.isBackendAvailable = true;
        return await res.json();
      }
    } catch (err) {
      console.warn('Lỗi kết nối Backend Java, dùng dữ liệu client:', err);
    }
    return null;
  },

  async createPlace(placeData) {
    try {
      const payload = { ...placeData };
      // Luôn xoá id khi tạo mới để Spring Boot tự sinh ID (IDENTITY)
      delete payload.id;

      const res = await fetch(`${API_BASE_URL}/places`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });
      if (res.ok) {
        this.isBackendAvailable = true;
        return await res.json();
      } else {
        const errorText = await res.text();
        console.error('Server trả về lỗi khi tạo quán:', res.status, errorText);
      }
    } catch (err) {
      console.error('Không thể lưu quán qua backend:', err);
    }
    return null;
  },

  async updatePlace(id, placeData) {
    try {
      const res = await fetch(`${API_BASE_URL}/places/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placeData),
        signal: AbortSignal.timeout(12000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Không thể cập nhật quán qua backend:', err);
    }
    return null;
  },

  async deletePlace(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/places/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(12000)
      });
      return res.ok;
    } catch (err) {
      console.error('Không thể xoá quán qua backend:', err);
    }
    return false;
  },

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000)
      });

      if (res.ok) {
        const data = await res.json();
        const origin = (window.location.port === '3000' || window.location.port === '5500') ? 'http://localhost:8080' : window.location.origin;
        return data.url.startsWith('http') ? data.url : `${origin}${data.url}`;
      }
    } catch (err) {
      console.error('Không thể upload ảnh lên backend:', err);
    }
    return null;
  },

  async registerUser({ username, name, email, password, role }) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, password, role }),
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Lỗi gọi API đăng ký user:', err);
    }
    return null;
  },

  async loginUser({ username, password }) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Lỗi gọi API đăng nhập user:', err);
    }
    return null;
  },

  async loginOrRegister(payloadOrName, role) {
    try {
      let body;
      if (typeof payloadOrName === 'object' && payloadOrName !== null) {
        body = payloadOrName;
      } else {
        body = { name: payloadOrName, username: payloadOrName, role };
      }
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Lỗi gọi API user login:', err);
    }
    return null;
  },

  async getUser(nameOrUsername) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(nameOrUsername)}`, {
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Lỗi lấy thông tin user qua API:', err);
    }
    return null;
  },

  async getUserPlaces(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/places/user/${encodeURIComponent(userId)}`, {
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Lỗi lấy danh sách quán của user qua API:', err);
    }
    return [];
  },

  async updateUser(oldName, newName, newRole) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, role: newRole }),
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Lỗi cập nhật user qua API:', err);
    }
    return null;
  },

  async changePassword(username, currentPassword, newPassword) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword }),
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, message: data.message || (res.ok ? 'Đổi mật khẩu thành công!' : 'Đổi mật khẩu thất bại') };
    } catch (err) {
      console.error('Lỗi gọi API đổi mật khẩu:', err);
      return { ok: false, message: 'Lỗi kết nối máy chủ khi đổi mật khẩu' };
    }
  }
};
