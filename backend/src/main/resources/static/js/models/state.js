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
  userPlans: [],
  tripPlan: null,
  currentPlanDayFilter: 'all',

  getUserPlansKey() {
    const uid = this.currentUser ? (this.currentUser.id || this.currentUser.username || 'user') : 'guest';
    return `food_coffee_user_plans_${uid}`;
  },

  getEmptyPlan(title = 'Chuyến đi 2N1Đ', tripType = '2N1Đ', totalDays = 2, startDate = '', endDate = '') {
    const today = new Date().toISOString().split('T')[0];
    const days = parseInt(totalDays, 10) || 2;
    return {
      id: 'plan_' + Date.now(),
      userId: this.currentUser ? (this.currentUser.id || this.currentUser.username) : null,
      title: title || 'Chuyến đi ' + (tripType || '2N1Đ'),
      tripType: tripType || (days === 1 ? '1 ngày' : `${days}N${days - 1}Đ`),
      totalDays: days,
      startDate: startDate || today,
      endDate: endDate || '',
      status: 'active', // 'active' | 'completed'
      createdAt: Date.now(),
      items: []
    };
  },

  initTripPlan() {
    if (!this.currentUser) {
      this.tripPlan = null;
      this.userPlans = [];
      return;
    }

    const key = this.getUserPlansKey();
    let plans = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        plans = JSON.parse(saved);
        if (!Array.isArray(plans)) plans = [];
      }
    } catch (e) {
      plans = [];
    }

    // Tự động chuyển đổi từ dữ liệu kế hoạch cũ nếu có
    if (plans.length === 0) {
      const oldPlanSaved = localStorage.getItem(STORAGE_KEYS.TRIP_PLAN);
      if (oldPlanSaved) {
        try {
          const oldPlan = JSON.parse(oldPlanSaved);
          if (oldPlan && Array.isArray(oldPlan.items) && oldPlan.items.length > 0) {
            oldPlan.id = oldPlan.id || ('plan_' + Date.now());
            oldPlan.title = oldPlan.title || 'Chuyến đi 2N1Đ';
            oldPlan.tripType = oldPlan.tripType || '2N1Đ';
            oldPlan.totalDays = oldPlan.totalDays || 2;
            oldPlan.startDate = oldPlan.startDate || new Date().toISOString().split('T')[0];
            oldPlan.status = oldPlan.status || 'active';
            oldPlan.items.forEach(it => {
              if (!it.day) it.day = 1;
            });
            plans.push(oldPlan);
          }
        } catch (e) {}
      }
    }

    // Nếu vẫn chưa có kế hoạch nào, tạo mặc định chuyến 2N1Đ
    if (plans.length === 0) {
      const defaultPlan = this.getEmptyPlan('Chuyến đi 2N1Đ', '2N1Đ', 2);
      plans.push(defaultPlan);
    }

    this.userPlans = plans;
    // Chọn kế hoạch đang active hoặc kế hoạch đầu tiên
    const active = plans.find(p => p.status === 'active') || plans[0];
    this.tripPlan = active;
    this.currentPlanDayFilter = 'all';
    this.saveUserPlans();
  },

  saveUserPlans() {
    if (!this.currentUser) return;
    const key = this.getUserPlansKey();
    if (this.tripPlan) {
      const idx = this.userPlans.findIndex(p => String(p.id) === String(this.tripPlan.id));
      if (idx > -1) {
        this.userPlans[idx] = this.tripPlan;
      } else {
        this.userPlans.unshift(this.tripPlan);
      }
    }
    localStorage.setItem(key, JSON.stringify(this.userPlans));
  },

  saveTripPlan() {
    this.saveUserPlans();
  },

  createNewPlan({ title, tripType, totalDays, startDate, endDate }) {
    const newPlan = this.getEmptyPlan(title, tripType, totalDays, startDate, endDate);
    this.userPlans.unshift(newPlan);
    this.tripPlan = newPlan;
    this.currentPlanDayFilter = 'all';
    this.saveUserPlans();
    return newPlan;
  },

  switchActivePlan(planId) {
    const plan = this.userPlans.find(p => String(p.id) === String(planId));
    if (plan) {
      this.tripPlan = plan;
      this.currentPlanDayFilter = 'all';
      this.saveUserPlans();
      return plan;
    }
    return null;
  },

  deletePlan(planId) {
    this.userPlans = this.userPlans.filter(p => String(p.id) !== String(planId));
    if (this.tripPlan && String(this.tripPlan.id) === String(planId)) {
      this.tripPlan = this.userPlans[0] || this.createNewPlan({
        title: 'Chuyến đi 2N1Đ',
        tripType: '2N1Đ',
        totalDays: 2
      });
    }
    this.saveUserPlans();
  },

  togglePlanStatus(planId) {
    const plan = this.userPlans.find(p => String(p.id) === String(planId));
    if (plan) {
      plan.status = plan.status === 'completed' ? 'active' : 'completed';
      this.saveUserPlans();
      return plan.status;
    }
    return null;
  },

  addPlanStop(stop) {
    if (!this.tripPlan) {
      this.tripPlan = this.getEmptyPlan();
    }
    if (!this.tripPlan.items) this.tripPlan.items = [];
    stop.id = 'stop_' + Date.now();
    stop.day = parseInt(stop.day, 10) || 1;
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
      if (updatedData.day) {
        updatedData.day = parseInt(updatedData.day, 10) || 1;
      }
      Object.assign(item, updatedData);
      this.saveTripPlan();
    }
  },

  clearPlan() {
    if (!this.tripPlan) return;
    this.tripPlan.items = [];
    this.saveTripPlan();
  }
};
