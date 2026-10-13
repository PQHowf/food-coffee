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
  getInitialDemoPlan() {
    return {
      title: "Lịch trình 1 ngày: Ăn ngon & Cafe chill Hà Nội",
      date: "Thứ Bảy, cuối tuần",
      note: "Hành trình dạo chơi cùng bạn bè: khởi đầu với phở nóng, check-in view phố cổ, nếm thử bún chả đặc sản và tiệc lẩu tối ven hồ.",
      items: [
        {
          id: "stop_1",
          time: "08:00 - 09:15",
          period: "Sáng",
          title: "Ăn sáng mở đầu ngày mới",
          category: "food",
          placeName: "Phở Bát Đàn - Gia Truyền",
          address: "49 Bát Đàn, P. Cửa Đông, Q. Hoàn Kiếm, Hà Nội",
          recommendedDish: "Phở bò tái nạm bắp, thêm quẩy giòn & trứng chần",
          priceRange: "50.000đ - 75.000đ",
          image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
          note: "Tập trung lúc 8h00 trước cửa quán, ăn phở nóng hổi nạp năng lượng cho cả ngày.",
          travelDuration: "~10 phút di chuyển (1.5 km)",
          isCompleted: true
        },
        {
          id: "stop_2",
          time: "09:30 - 11:30",
          period: "Sáng",
          title: "Cà phê sáng & Check-in view phố",
          category: "cafe",
          placeName: "Cộng Cà Phê - Cầu Gỗ",
          address: "116 Cầu Gỗ, Hàng Bạc, Q. Hoàn Kiếm, Hà Nội",
          recommendedDish: "Cà phê cốt dừa béo ngậy, bạc xỉu đá, trà quế cam thảo",
          priceRange: "45.000đ - 65.000đ",
          image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
          note: "Ngồi ban công tầng 2 ngắm trọn nhịp sống phố cổ, chụp ảnh kỷ niệm.",
          travelDuration: "~15 phút di chuyển (2.4 km)",
          isCompleted: false
        },
        {
          id: "stop_3",
          time: "12:00 - 13:45",
          period: "Trưa",
          title: "Thưởng thức bún chả đặc sản",
          category: "food",
          placeName: "Bún Chả Hương Liên (Obama)",
          address: "24 Lê Văn Hưu, Phan Chu Trinh, Q. Hai Bà Trưng, Hà Nội",
          recommendedDish: "Combo bún chả nướng than hoa + nem hải sản đặc biệt",
          priceRange: "60.000đ - 95.000đ",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
          note: "Thịt nướng thơm lừng đậm đà, nem cua giòn rụm. Nên đến sớm 10 phút để có bàn mát.",
          travelDuration: "~20 phút di chuyển (3.8 km)",
          isCompleted: false
        },
        {
          id: "stop_4",
          time: "14:15 - 17:00",
          period: "Chiều",
          title: "Check-in triển lãm & Tráng miệng",
          category: "custom",
          placeName: "Trung tâm Nghệ thuật VCCA & Tiệm Trà Chiều",
          address: "B1-R3 Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
          recommendedDish: "Trà đào cam sả, bánh crepe cầu vồng & matcha latte",
          priceRange: "45.000đ - 70.000đ",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
          note: "Tham quan triển lãm nghệ thuật không gian mở, tránh nắng trưa và nghỉ ngơi trò chuyện.",
          travelDuration: "~25 phút di chuyển (5.1 km)",
          isCompleted: false
        },
        {
          id: "stop_5",
          time: "18:00 - 21:00",
          period: "Tối",
          title: "Lẩu riêu cua & Tiệc nướng ven hồ",
          category: "food",
          placeName: "Lẩu Nướng Phố Trúc Bạch",
          address: "38 Trúc Bạch, Ba Đình, Hà Nội",
          recommendedDish: "Lẩu riêu cua bắp bò sườn sụn, nầm nướng sốt me",
          priceRange: "150.000đ - 220.000đ",
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
          note: "Ngồi dãy bàn ngoài trời đón gió hồ lộng mát, kết thúc một ngày dạo chơi hoàn hảo bên bạn bè!",
          travelDuration: null,
          isCompleted: false
        }
      ]
    };
  },

  initTripPlan() {
    const saved = localStorage.getItem(STORAGE_KEYS.TRIP_PLAN);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          this.tripPlan = parsed;
          return;
        }
      } catch (e) {}
    }
    this.tripPlan = this.getInitialDemoPlan();
    this.saveTripPlan();
  },

  saveTripPlan() {
    if (this.tripPlan) {
      localStorage.setItem(STORAGE_KEYS.TRIP_PLAN, JSON.stringify(this.tripPlan));
    }
  },

  addPlanStop(stop) {
    if (!this.tripPlan) this.tripPlan = this.getInitialDemoPlan();
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

  resetToDemoPlan() {
    this.tripPlan = this.getInitialDemoPlan();
    this.saveTripPlan();
    return this.tripPlan;
  },

  clearPlan() {
    if (this.tripPlan) {
      this.tripPlan.items = [];
      this.saveTripPlan();
    }
  }
};
