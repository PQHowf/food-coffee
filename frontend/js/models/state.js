/**
 * models/state.js - Tầng Model của Frontend MVC
 * Quản lý dữ liệu (State), Lưu trữ LocalStorage và Dữ liệu hạt giống (Seed Data)
 */

const STORAGE_KEYS = {
  PLACES: 'food_coffee_places_v2',
  CURRENT_USER: 'food_coffee_current_user_v2',
  SAVED_FAVORITES: 'food_coffee_saved_favorites_v2'
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

// Seed Data mẫu nếu chưa có dữ liệu từ backend hoặc local
const initialPlacesData = [
  {
    id: "food_1",
    name: "Phở Thìn Lò Đúc",
    category: "food",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    address: "13 Lò Đúc, Ngô Thì Nhậm, Hai Bà Trưng",
    price: 75000,
    priceDisplay: "65.000đ - 90.000đ",
    rating: 4.8,
    reviewCount: 420,
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
    tags: ["Món nước", "Đặc sản Hà Nội", "Bò tái lăn"],
    recommendedDish: "Phở bò tái lăn xào lăn thơm phức, nhiều hành lá",
    suggestedBy: "Phạm Quốc Huy",
    suggestedByRole: "Food Reviewer",
    createdAt: "2026-03-10"
  },
  {
    id: "food_2",
    name: "Bánh Mì Huỳnh Hoa",
    category: "food",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    address: "26 Lê Thị Riêng, P. Bến Thành, Quận 1",
    price: 68000,
    priceDisplay: "65.000đ - 75.000đ",
    rating: 4.7,
    reviewCount: 890,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    tags: ["Ăn vặt", "Đặc sản Sài Gòn", "Bánh mì"],
    recommendedDish: "Bánh mì pate chả thịt nguội siêu đẫm nhân",
    suggestedBy: "Nguyễn Minh Anh",
    suggestedByRole: "Street Foodie",
    createdAt: "2026-03-12"
  },
  {
    id: "cafe_1",
    name: "Cộng Cà Phê - Cầu Gỗ",
    category: "cafe",
    city: "Hà Nội",
    district: "Hoàn Kiếm",
    address: "116 Cầu Gỗ, Hàng Bạc, Hoàn Kiếm",
    price: 55000,
    priceDisplay: "45.000đ - 65.000đ",
    rating: 4.7,
    reviewCount: 530,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    tags: ["Cốt dừa", "Không gian hoài niệm", "View hồ Gươm"],
    recommendedDish: "Cà phê cốt dừa thơm béo chuẩn vị Hà Nội",
    suggestedBy: "Phạm Quốc Huy",
    suggestedByRole: "Coffee Lover",
    createdAt: "2026-03-08"
  },
  {
    id: "cafe_2",
    name: "The Workshop Specialty Coffee",
    category: "cafe",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    address: "27 Ngô Đức Kế, Bến Nghé, Quận 1",
    price: 85000,
    priceDisplay: "70.000đ - 120.000đ",
    rating: 4.8,
    reviewCount: 360,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    tags: ["Specialty", "Pour over", "Làm việc yên tĩnh"],
    recommendedDish: "Cà phê Pour-over hạt Ethiopia hương hoa quả",
    suggestedBy: "Trần Tuấn Linh",
    suggestedByRole: "Barista & Roaster",
    createdAt: "2026-03-15"
  }
];

// Trạng thái trung tâm (State Model)
const model = {
  places: [],
  currentUser: null,
  favorites: [],
  currentTab: 'food', // 'food' | 'cafe' | 'add'
  filters: {
    search: '',
    city: 'all'
  },

  init() {
    const savedPlaces = localStorage.getItem(STORAGE_KEYS.PLACES);
    if (savedPlaces) {
      try {
        this.places = JSON.parse(savedPlaces);
      } catch (e) {
        this.places = [...initialPlacesData];
      }
    } else {
      this.places = [...initialPlacesData];
      this.savePlaces();
    }

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
  }
};
