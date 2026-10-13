/**
 * models/state.js - Tầng Model của Frontend MVC
 * Quản lý dữ liệu (State), Lưu trữ LocalStorage và Dữ liệu hạt giống (Seed Data)
 */

const STORAGE_KEYS = {
  PLACES: 'food_coffee_places_v3',
  CURRENT_USER: 'food_coffee_current_user_v2',
  SAVED_FAVORITES: 'food_coffee_saved_favorites_v2',
  TRIP_PLAN: 'food_coffee_trip_plan_v1'
};

const CITIES = [
  "Tất cả thành phố",
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Đà Lạt",
  "Nha Trang",
  "Hải Phòng",
  "Cần Thơ",
  "Huế",
  "Vũng Tàu",
  "Quy Nhơn",
  "Sa Pa"
];

// Không dùng seed data mẫu - hiển thị 100% theo database thực tế
const initialPlacesData = [];

// Trạng thái trung tâm (State Model)
const model = {
  places: [],
  currentUser: null,
  favorites: [],
  currentTab: 'food', // 'food' | 'cafe' | 'add' | 'plan'
  tripPlan: null,
  filters: {
    search: '',
    city: 'all'
  },

  init() {
    // Dọn dẹp key cache cũ từng chứa quán mẫu
    try {
      localStorage.removeItem('food_coffee_places_v2');
      localStorage.removeItem('food_coffee_places_v1');
    } catch (e) {}

    const savedPlaces = localStorage.getItem(STORAGE_KEYS.PLACES);
    if (savedPlaces) {
      try {
        const parsed = JSON.parse(savedPlaces);
        // Loại bỏ triệt để các quán mẫu seed cũ nếu người dùng còn lưu
        const seedIds = ['food_1', 'food_2', 'cafe_1', 'cafe_2'];
        const seedNames = ['Phở Thìn Lò Đúc', 'Bánh Mì Huỳnh Hoa', 'Cộng Cà Phê - Cầu Gỗ', 'The Workshop Specialty Coffee'];
        this.places = (Array.isArray(parsed) ? parsed : []).filter(p => 
          p && !seedIds.includes(String(p.id)) && !seedNames.includes(p.name)
        );
        this.places.forEach(p => {
          if (!p.priceRange) p.priceRange = '<100K';
        });
      } catch (e) {
        this.places = [];
      }
    } else {
      this.places = [];
    }
    this.savePlaces();

    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }

    const savedFavs = localStorage.getItem(STORAGE_KEYS.SAVED_FAVORITES);
    if (savedFavs) {
      try {
        this.favorites = JSON.parse(savedFavs);
      } catch (e) {
        this.favorites = [];
      }
    }

    this.initTripPlan();
  },

  savePlaces() {
    localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(this.places));
  },

  saveUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  saveFavorites() {
    localStorage.setItem(STORAGE_KEYS.SAVED_FAVORITES, JSON.stringify(this.favorites));
  },

  toggleFavorite(placeId) {
    const idx = this.favorites.indexOf(placeId);
    if (idx > -1) {
      this.favorites.splice(idx, 1);
      this.saveFavorites();
      return false; // đã bỏ lưu
    } else {
      this.favorites.push(placeId);
      this.saveFavorites();
      return true; // đã lưu
    }
  },

  // ==========================================================================
  // KẾ HOẠCH ĐI CHƠI (TRIP PLANNER) STATE
  // ==========================================================================
  getEmptyPlan() {
    return {
      title: "Kế hoạch đi chơi",
      date: "Hôm nay",
      items: []
    };
  },

  initTripPlan() {
    const saved = localStorage.getItem(STORAGE_KEYS.TRIP_PLAN);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items)) {
          // Xoá bỏ dữ liệu demo cũ nếu có
          const hasOldDemo = parsed.items.some(i => i.id === 'stop_1' || i.id === 'stop_2');
          if (!hasOldDemo) {
            this.tripPlan = parsed;
            return;
          }
        }
      } catch (e) {}
    }
    this.tripPlan = this.getEmptyPlan();
    this.saveTripPlan();
  },

  saveTripPlan() {
    if (this.tripPlan) {
      localStorage.setItem(STORAGE_KEYS.TRIP_PLAN, JSON.stringify(this.tripPlan));
    }
  },

  addPlanStop(stop) {
    if (!this.tripPlan) this.tripPlan = this.getEmptyPlan();
    if (!this.tripPlan.items) this.tripPlan.items = [];
    stop.id = 'stop_' + Date.now();
    this.tripPlan.items.push(stop);
    this.saveTripPlan();
    return stop;
  },

  removePlanStop(stopId) {
    if (!this.tripPlan || !this.tripPlan.items) return;
    this.tripPlan.items = this.tripPlan.items.filter(item => String(item.id) !== String(stopId));
    this.saveTripPlan();
  },

  togglePlanStopComplete(stopId) {
    if (!this.tripPlan || !this.tripPlan.items) return false;
    const item = this.tripPlan.items.find(i => String(i.id) === String(stopId));
    if (item) {
      item.isCompleted = !item.isCompleted;
      this.saveTripPlan();
      return item.isCompleted;
    }
    return false;
  },

  updatePlanStop(stopId, updatedData) {
    if (!this.tripPlan || !this.tripPlan.items) return;
    const item = this.tripPlan.items.find(i => String(i.id) === String(stopId));
    if (item) {
      Object.assign(item, updatedData);
      this.saveTripPlan();
    }
  },

  clearPlan() {
    this.tripPlan = this.getEmptyPlan();
    this.saveTripPlan();
  }
};
