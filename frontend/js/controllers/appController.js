/**
 * controllers/appController.js - Tầng Controller của Frontend MVC
 * Kết nối Model, View và Service; điều phối sự kiện người dùng
 */

const appController = {
  uploadedImageData: '',
  selectedRawFile: null,

  async init() {
    // 1. Khởi tạo Model & View Elements
    model.init();
    view.initElements();

    // 2. Điền danh sách thành phố vào dropdown
    view.populateCities(CITIES);

    // 3. Render giao diện ban đầu
    this.updateAuthView();
    this.updateCounters();
    this.renderCurrentPlaces();

    // 4. Đăng ký sự kiện (Event Listeners)
    this.bindEvents();

    // 5. Thử đồng bộ dữ liệu với Java Spring Boot Backend (bất đồng bộ)
    this.syncWithBackend();
  },

  async syncWithBackend() {
    try {
      const backendPlaces = await apiService.getPlaces();
      if (backendPlaces && Array.isArray(backendPlaces)) {
        // Đồng bộ dữ liệu chính xác tuyệt đối theo database
        model.places = backendPlaces;
        model.savePlaces();
        this.updateCounters();
        this.renderCurrentPlaces();
        console.log('✅ [MVC Controller] Đã kết nối & đồng bộ dữ liệu từ Database Server (Tổng quán:', model.places.length, ')');

        // Đồng bộ tài khoản hiện tại lên database nếu có để lấy id chuẩn
        if (model.currentUser && (model.currentUser.username || model.currentUser.name)) {
          try {
            const u = await apiService.getUser(model.currentUser.username || model.currentUser.name) ||
                      await apiService.loginOrRegister(model.currentUser.username || model.currentUser.name, model.currentUser.role);
            if (u && u.id) {
              model.currentUser.id = u.id;
              if (u.name) model.currentUser.name = u.name;
              if (u.username) model.currentUser.username = u.username;
              model.saveUser(model.currentUser);
              this.updateAuthView();
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.log('ℹ️ [MVC Controller] Backend chưa phản hồi, giữ dữ liệu local');
    }
  },

  isUserPlace(p) {
    if (!model.currentUser || !p) return false;
    // 1. So khớp chuẩn theo ID người dùng trong Database (user_id)
    if (model.currentUser.id && p.userId && String(p.userId) === String(model.currentUser.id)) {
      return true;
    }
    // 2. So khớp theo tên hiển thị
    if (model.currentUser.name && p.suggestedBy && p.suggestedBy === model.currentUser.name) {
      return true;
    }
    // 3. So khớp theo username
    if (model.currentUser.username && p.suggestedBy && p.suggestedBy === model.currentUser.username) {
      return true;
    }
    return false;
  },

  getUserPlacesCount() {
    if (!model.currentUser) return 0;
    return model.places.filter(p => this.isUserPlace(p)).length;
  },

  getUserPlaces() {
    if (!model.currentUser) return [];
    return model.places.filter(p => this.isUserPlace(p));
  },

  getRoleByPlacesCount(count) {
    if (count >= 20) return 'Bậc Thầy Ẩm Thực';
    if (count >= 15) return 'Thánh Review Quán';
    if (count >= 10) return 'Chuyên Gia Quán Xá';
    if (count >= 5) return 'Người Sành Ăn';
    return 'Tân Binh Ẩm Thực';
  },

  getRoleRankProgress(count) {
    if (count >= 20) {
      return `🏆 Đã thêm <strong>${count}</strong> quán. Bạn đã đạt danh hiệu cao nhất: <strong>Bậc Thầy Ẩm Thực</strong>!`;
    }
    if (count >= 15) {
      return `⭐ Đã thêm <strong>${count}</strong> quán. Thêm <strong>${20 - count}</strong> quán nữa để đạt mốc 20: <strong>Bậc Thầy Ẩm Thực</strong>.`;
    }
    if (count >= 10) {
      return `⭐ Đã thêm <strong>${count}</strong> quán. Thêm <strong>${15 - count}</strong> quán nữa để đạt mốc 15: <strong>Thánh Review Quán</strong>.`;
    }
    if (count >= 5) {
      return `⭐ Đã thêm <strong>${count}</strong> quán. Thêm <strong>${10 - count}</strong> quán nữa để đạt mốc 10: <strong>Chuyên Gia Quán Xá</strong>.`;
    }
    return `⭐ Đã thêm <strong>${count}</strong> quán. Thêm <strong>${5 - count}</strong> quán nữa để đạt mốc 5: <strong>Người Sành Ăn</strong>.`;
  },

  updateCounters() {
    const foodCount = model.places.filter(p => p.category === 'food').length;
    const cafeCount = model.places.filter(p => p.category === 'cafe').length;
    view.updateCounters(foodCount, cafeCount);
  },

  updateAuthView() {
    if (model.currentUser && (model.currentUser.name || model.currentUser.username)) {
      const myCount = this.getUserPlacesCount();
      model.currentUser.role = this.getRoleByPlacesCount(myCount);
    }

    view.renderAuth(
      model.currentUser,
      () => this.openAccountModal(),
      () => this.handleLogout(),
      () => this.openAuthModal('login')
    );

    // Cập nhật tab Thêm Quán nếu đang mở
    if (model.currentTab === 'add') {
      this.renderAddTabContent();
    }
  },

  renderCurrentPlaces() {
    let list = model.places.filter(p => p.category === model.currentTab);

    // Lọc theo thành phố
    if (model.filters.city !== 'all') {
      list = list.filter(p => p.city === model.filters.city);
    }

    // Tìm kiếm
    if (model.filters.search.trim()) {
      const q = model.filters.search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.recommendedDish && p.recommendedDish.toLowerCase().includes(q)) ||
        p.address.toLowerCase().includes(q)
      );
    }

    view.renderPlaces(list, model.favorites);
  },

  // Quay ngẫu nhiên chuẩn theo tab hiện tại (Quán ăn hoặc Quán cafe)
  handleRandomPicker() {
    const targetCategory = (model.currentTab === 'cafe') ? 'cafe' : 'food';
    const targetCategoryName = targetCategory === 'cafe' ? 'QUÁN CAFE' : 'QUÁN ĂN';

    const categoryPlaces = model.places.filter(p => p.category === targetCategory);
    if (!categoryPlaces.length) {
      view.showToast(`Chưa có địa điểm ${targetCategoryName} nào trong hệ thống! Hãy vào tab "Thêm Quán" để gợi ý nhé.`, 'warning');
      return;
    }

    // Đổ danh sách các thành phố thực tế có trong database vào bộ lọc của modal quay
    view.populateRandomCities(model.places);

    // Đồng bộ thành phố đang chọn ở thanh tìm kiếm (nếu có trong danh sách thành phố DB)
    if (view.dom.randomCityFilter) {
      const activeCity = model.filters.city;
      const options = Array.from(view.dom.randomCityFilter.options).map(o => o.value);
      if (options.includes(activeCity)) {
        view.dom.randomCityFilter.value = activeCity;
      } else {
        view.dom.randomCityFilter.value = 'all';
      }
    }
    if (view.dom.randomPriceFilter) {
      view.dom.randomPriceFilter.value = 'all';
    }

    // Mở modal quay ngẫu nhiên
    this.openRandomModal(targetCategory);
  },

  openRandomModal(category) {
    if (!view.dom.randomModal) return;

    this.currentRandomCategory = category;

    const isCafe = category === 'cafe';
    const categoryTitle = isCafe ? 'HÔM NAY ĐI CAFE Ở ĐÂU?' : 'HÔM NAY BẠN SẼ ĂN GÌ?';

    if (view.dom.randomModalTitle) view.dom.randomModalTitle.textContent = categoryTitle;

    view.dom.randomModal.style.display = 'flex';
    this.handleRandomFilterChange();
  },

  getRandomCandidates() {
    const targetCategory = (this.currentRandomCategory === 'cafe') ? 'cafe' : 'food';
    const selectedCity = view.dom.randomCityFilter ? view.dom.randomCityFilter.value : 'all';
    const selectedPrice = view.dom.randomPriceFilter ? view.dom.randomPriceFilter.value : 'all';

    let candidates = model.places.filter(p => p.category === targetCategory);

    if (selectedCity && selectedCity !== 'all') {
      candidates = candidates.filter(p => p.city === selectedCity);
    }

    if (selectedPrice && selectedPrice !== 'all') {
      candidates = candidates.filter(p => (p.priceRange || '<100K') === selectedPrice);
    }

    return candidates;
  },

  handleRandomFilterChange() {
    const candidates = this.getRandomCandidates();
    this.currentRandomCandidates = candidates;

    const count = candidates.length;
    const isCafe = this.currentRandomCategory === 'cafe';
    if (view.dom.randomModalSubtitle) {
      view.dom.randomModalSubtitle.textContent = count > 0
        ? `Đang quay ngẫu nhiên 1 trong ${count} quán ${isCafe ? 'cafe chill' : 'ăn ngon'}...`
        : `Không có quán ${isCafe ? 'cafe' : 'ăn'} nào phù hợp với bộ lọc hiện tại.`;
    }

    if (count > 0) {
      this.spinRandomWheel(candidates);
    } else {
      this.showRandomEmptyState();
    }
  },

  showRandomEmptyState() {
    if (view.dom.winnerCard) view.dom.winnerCard.style.display = 'none';
    if (view.dom.randomWheelBox) {
      view.dom.randomWheelBox.style.display = 'block';
      if (view.dom.slotPreview) {
        view.dom.slotPreview.parentElement.style.display = 'flex';
        view.dom.slotPreview.innerHTML = `
          <div style="text-align: center; color: #ffffff; padding: 12px 6px;">
            <div style="font-size: 1.5rem; margin-bottom: 6px;">🔍</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #fca5a5;">Không tìm thấy quán phù hợp</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">Vui lòng thử chọn mức giá hoặc thành phố khác</div>
          </div>
        `;
        view.refreshIcons();
      }
    }
    if (view.dom.reRollBtn) view.dom.reRollBtn.disabled = true;
    if (view.dom.acceptPickBtn) view.dom.acceptPickBtn.disabled = true;
  },

  spinRandomWheel(places) {
    if (!places || !places.length) {
      this.showRandomEmptyState();
      return;
    }

    if (view.dom.reRollBtn) view.dom.reRollBtn.disabled = false;
    if (view.dom.acceptPickBtn) view.dom.acceptPickBtn.disabled = false;

    if (view.dom.randomWheelBox) view.dom.randomWheelBox.style.display = 'block';
    if (view.dom.winnerCard) view.dom.winnerCard.style.display = 'none';

    if (view.dom.slotPreview) {
      view.dom.slotPreview.parentElement.style.display = 'flex';
      view.dom.slotPreview.innerHTML = `
        <div class="slot-spinner">
          <i data-lucide="loader-2" class="spin-icon"></i>
          <span>Đang quay chọn ${this.currentRandomCategory === 'cafe' ? 'quán cafe' : 'món ngon'}...</span>
        </div>
      `;
    }
    view.refreshIcons();

    // Hiệu ứng quay số nhanh rồi dừng ở quán chiến thắng
    let count = 0;
    const maxSteps = 10;
    const interval = setInterval(() => {
      count++;
      const tempPick = places[Math.floor(Math.random() * places.length)];
      if (view.dom.slotPreview) {
        view.dom.slotPreview.innerHTML = `
          <div style="text-align: center; color: #ffffff;">
            <div style="font-size: 0.85rem; color: #fb923c; font-weight: 700;">Đang lọc ngẫu nhiên...</div>
            <div style="font-size: 1.15rem; font-weight: 800; margin-top: 4px;">${view.escapeHTML(tempPick.name)}</div>
          </div>
        `;
      }

      if (count >= maxSteps) {
        clearInterval(interval);
        const finalWinner = places[Math.floor(Math.random() * places.length)];
        this.selectedWinnerPlace = finalWinner;
        this.displayRandomWinner(finalWinner);
      }
    }, 120);
  },

  displayRandomWinner(winner) {
    if (!winner || !view.dom.winnerCard) return;

    if (view.dom.randomWheelBox) {
      view.dom.randomWheelBox.style.display = 'none';
    }
    if (view.dom.slotPreview) {
      view.dom.slotPreview.parentElement.style.display = 'none';
    }

    const defaultImg = winner.category === 'cafe'
      ? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

    if (view.dom.winnerImage) view.dom.winnerImage.src = winner.image || defaultImg;
    if (view.dom.winnerCategory) {
      view.dom.winnerCategory.textContent = winner.category === 'cafe' ? '☕ QUÁN CAFE CHILL' : '🍲 QUÁN ĂN NGON';
    }
    if (view.dom.winnerPriceTag) {
      view.dom.winnerPriceTag.textContent = winner.priceRange || '<100K';
    }
    if (view.dom.winnerName) view.dom.winnerName.textContent = winner.name;

    let winnerFullAddress = winner.address || '';
    if (winner.city && !winnerFullAddress.toLowerCase().includes(winner.city.toLowerCase())) {
      winnerFullAddress = winnerFullAddress ? `${winnerFullAddress}, ${winner.city}` : winner.city;
    }
    if (view.dom.winnerAddress) view.dom.winnerAddress.textContent = winnerFullAddress;

    if (view.dom.winnerDish) {
      if (winner.recommendedDish) {
        view.dom.winnerDish.parentElement.style.display = 'flex';
        view.dom.winnerDish.textContent = winner.recommendedDish;
      } else {
        view.dom.winnerDish.parentElement.style.display = 'none';
      }
    }
    if (view.dom.winnerSuggested) {
      view.dom.winnerSuggested.textContent = `Gợi ý từ: ${winner.suggestedBy || 'Cộng đồng'}`;
    }

    view.dom.winnerCard.style.display = 'block';
    view.refreshIcons();
  },

  closeRandomModal() {
    if (view.dom.randomModal) {
      view.dom.randomModal.style.display = 'none';
    }
  },

  switchTab(tab) {
    model.currentTab = tab;
    [view.dom.tabFood, view.dom.tabCafe, view.dom.tabAdd].forEach(btn => btn?.classList.remove('active'));

    if (tab === 'food') {
      view.dom.tabFood?.classList.add('active');
      view.dom.placesSection.style.display = 'block';
      view.dom.filterToolbar.style.display = 'flex';
      view.dom.addPlaceSection.style.display = 'none';
      view.dom.sectionTitle.textContent = 'DANH SÁCH QUÁN ĂN';
      if (view.dom.sectionDesc) view.dom.sectionDesc.textContent = '';
      this.renderCurrentPlaces();
    } else if (tab === 'cafe') {
      view.dom.tabCafe?.classList.add('active');
      view.dom.placesSection.style.display = 'block';
      view.dom.filterToolbar.style.display = 'flex';
      view.dom.addPlaceSection.style.display = 'none';
      view.dom.sectionTitle.textContent = 'DANH SÁCH QUÁN CAFE';
      if (view.dom.sectionDesc) view.dom.sectionDesc.textContent = '';
      this.renderCurrentPlaces();
    } else if (tab === 'add') {
      view.dom.tabAdd?.classList.add('active');
      view.dom.placesSection.style.display = 'none';
      view.dom.filterToolbar.style.display = 'none';
      view.dom.addPlaceSection.style.display = 'block';
      this.renderAddTabContent();
    }
    view.refreshIcons();
  },

  renderAddTabContent() {
    if (model.currentUser) {
      view.dom.guestGateCard.style.display = 'none';
      view.dom.addFormContainer.style.display = 'block';

      const initials = view.getInitials(model.currentUser.name);
      const myCount = this.getUserPlacesCount();
      const role = this.getRoleByPlacesCount(myCount);
      model.currentUser.role = role;

      if (view.dom.formUserAvatar) view.dom.formUserAvatar.textContent = initials;
      if (view.dom.formUserName) view.dom.formUserName.textContent = model.currentUser.name;
      if (view.dom.formAuthorAvatar) view.dom.formAuthorAvatar.textContent = initials;
      if (view.dom.formSuggestedByPreview) view.dom.formSuggestedByPreview.textContent = model.currentUser.name;
      if (view.dom.formAuthorRole) view.dom.formAuthorRole.textContent = role;
    } else {
      view.dom.guestGateCard.style.display = 'block';
      view.dom.addFormContainer.style.display = 'none';
    }
  },

  // Modal Auth
  openAuthModal(mode = 'login') {
    view.dom.authModal.style.display = 'flex';
    this.setAuthMode(mode);
  },

  clearAuthErrors() {
    [view.dom.errAuthEmail, view.dom.errAuthUsername, view.dom.errAuthFullName, view.dom.errAuthPassword].forEach(el => {
      if (el) el.style.display = 'none';
    });
  },

  closeAuthModal() {
    if (view.dom.authModal) view.dom.authModal.style.display = 'none';
    if (view.dom.authForm) view.dom.authForm.reset();
    this.clearAuthErrors();
  },

  setAuthMode(mode) {
    this.currentAuthMode = mode;
    this.clearAuthErrors();

    if (mode === 'login') {
      view.dom.authTabLogin?.classList.add('active');
      view.dom.authTabRegister?.classList.remove('active');
      if (view.dom.authModalTitle) view.dom.authModalTitle.textContent = 'ĐĂNG NHẬP THÀNH VIÊN';
      if (view.dom.authEmailGroup) view.dom.authEmailGroup.style.display = 'none';
      if (view.dom.authFullNameGroup) view.dom.authFullNameGroup.style.display = 'none';
      if (view.dom.authUsernameGroup) view.dom.authUsernameGroup.style.display = 'block';
      if (view.dom.authUsernameLabel) view.dom.authUsernameLabel.innerHTML = 'Tên đăng nhập hoặc Email <span class="required">*</span>';
      if (view.dom.authPasswordGroup) view.dom.authPasswordGroup.style.display = 'block';
      if (view.dom.authSubmitBtn) view.dom.authSubmitBtn.innerHTML = '<i data-lucide="log-in"></i> ĐĂNG NHẬP';
    } else {
      view.dom.authTabRegister?.classList.add('active');
      view.dom.authTabLogin?.classList.remove('active');
      if (view.dom.authModalTitle) view.dom.authModalTitle.textContent = 'ĐĂNG KÝ TÀI KHOẢN MỚI';
      if (view.dom.authEmailGroup) view.dom.authEmailGroup.style.display = 'block';
      if (view.dom.authUsernameGroup) view.dom.authUsernameGroup.style.display = 'block';
      if (view.dom.authUsernameLabel) view.dom.authUsernameLabel.innerHTML = 'Tên đăng nhập <span class="required">*</span>';
      if (view.dom.authFullNameGroup) view.dom.authFullNameGroup.style.display = 'block';
      if (view.dom.authPasswordGroup) view.dom.authPasswordGroup.style.display = 'block';
      if (view.dom.authSubmitBtn) view.dom.authSubmitBtn.innerHTML = '<i data-lucide="user-plus"></i> HOÀN TẤT ĐĂNG KÝ';
    }
    view.refreshIcons();
  },

  async handleAuthSubmit() {
    const isRegister = this.currentAuthMode === 'register';
    this.clearAuthErrors();

    const username = view.dom.authUsername?.value.trim() || '';
    const password = view.dom.authPassword?.value || '';

    if (isRegister) {
      const email = view.dom.authEmail?.value.trim() || '';
      const fullName = view.dom.authFullName?.value.trim() || '';

      let hasError = false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        if (view.dom.errAuthEmail) view.dom.errAuthEmail.style.display = 'block';
        hasError = true;
      }
      if (!username) {
        if (view.dom.errAuthUsername) view.dom.errAuthUsername.style.display = 'block';
        hasError = true;
      }
      if (!fullName) {
        if (view.dom.errAuthFullName) view.dom.errAuthFullName.style.display = 'block';
        hasError = true;
      }
      if (!password || password.length < 4) {
        if (view.dom.errAuthPassword) {
          view.dom.errAuthPassword.textContent = 'Mật khẩu phải từ 4 ký tự trở lên';
          view.dom.errAuthPassword.style.display = 'block';
        }
        hasError = true;
      }

      if (hasError) return;

      if (view.dom.authSubmitBtn) {
        view.dom.authSubmitBtn.disabled = true;
        view.dom.authSubmitBtn.innerHTML = '<i data-lucide="loader"></i> Đang đăng ký...';
        view.refreshIcons();
      }

      try {
        const result = await apiService.registerUser({
          username,
          name: fullName,
          email,
          password,
          role: 'Thành viên đề xuất'
        });

        const savedUser = (result && result.name) ? result : {
          username,
          name: fullName,
          email,
          role: 'Thành viên đề xuất'
        };

        model.saveUser(savedUser);
        this.updateAuthView();
        this.closeAuthModal();
        view.showToast(`Đăng ký thành công! Chào mừng ${savedUser.name}`, 'success');
      } catch (err) {
        console.error('Lỗi khi đăng ký:', err);
        const savedUser = { username, name: fullName, email, role: 'Thành viên đề xuất' };
        model.saveUser(savedUser);
        this.updateAuthView();
        this.closeAuthModal();
        view.showToast(`Đăng ký thành công! Chào mừng ${fullName}`, 'success');
      } finally {
        if (view.dom.authSubmitBtn) {
          view.dom.authSubmitBtn.disabled = false;
          this.setAuthMode('register');
        }
      }
    } else {
      // Login mode
      let hasError = false;
      if (!username) {
        if (view.dom.errAuthUsername) view.dom.errAuthUsername.style.display = 'block';
        hasError = true;
      }
      if (!password) {
        if (view.dom.errAuthPassword) {
          view.dom.errAuthPassword.textContent = 'Vui lòng nhập mật khẩu';
          view.dom.errAuthPassword.style.display = 'block';
        }
        hasError = true;
      }

      if (hasError) return;

      if (view.dom.authSubmitBtn) {
        view.dom.authSubmitBtn.disabled = true;
        view.dom.authSubmitBtn.innerHTML = '<i data-lucide="loader"></i> Đang đăng nhập...';
        view.refreshIcons();
      }

      try {
        const result = await apiService.loginUser({ username, password });
        let loggedInUser = result && result.name ? result : null;

        if (!loggedInUser) {
          loggedInUser = await apiService.loginOrRegister({ username, password, role: 'Thành viên đề xuất' });
        }

        const finalUser = loggedInUser && loggedInUser.name 
          ? loggedInUser 
          : { name: username, username, role: 'Thành viên đề xuất' };

        model.saveUser(finalUser);
        this.updateAuthView();
        this.closeAuthModal();
        view.showToast(`Chào mừng bạn quay lại, ${finalUser.name}!`, 'success');
      } catch (err) {
        console.error('Lỗi khi đăng nhập:', err);
        const finalUser = { name: username, username, role: 'Thành viên đề xuất' };
        model.saveUser(finalUser);
        this.updateAuthView();
        this.closeAuthModal();
        view.showToast(`Chào mừng bạn quay lại, ${username}!`, 'info');
      } finally {
        if (view.dom.authSubmitBtn) {
          view.dom.authSubmitBtn.disabled = false;
          this.setAuthMode('login');
        }
      }
    }
  },

  async handleLogin(name, role) {
    let user = { name, role: role || 'Thành viên đề xuất' };
    try {
      const serverUser = await apiService.loginOrRegister(name, role);
      if (serverUser && serverUser.name) {
        user = serverUser;
        console.log('✅ Đã lưu tài khoản vào Database thành công, ID:', serverUser.id);
      }
    } catch (err) {
      console.warn('Lỗi lưu tài khoản lên server:', err);
    }
    model.saveUser(user);
    this.updateAuthView();
    this.closeAuthModal();
    view.showToast(`Chào mừng bạn, ${user.name}!`, 'success');
  },

  handleLogout() {
    model.saveUser(null);
    this.updateAuthView();
    view.showToast('Đã đăng xuất tài khoản. Bạn đang ở chế độ Khách.', 'info');
  },

  // Modal Account Info & Quản lý quán đã thêm
  openAccountModal() {
    if (!model.currentUser) {
      this.openAuthModal('login');
      return;
    }
    const initials = view.getInitials(model.currentUser.name);
    const myPlaces = this.getUserPlaces();
    const role = this.getRoleByPlacesCount(myPlaces.length);
    model.currentUser.role = role;
    model.saveUser(model.currentUser);

    if (view.dom.accAvatarLarge) view.dom.accAvatarLarge.textContent = initials;
    if (view.dom.accNameDisplay) view.dom.accNameDisplay.textContent = model.currentUser.name;
    if (view.dom.accRoleDisplay) view.dom.accRoleDisplay.textContent = role;
    if (view.dom.accPlacesCount) view.dom.accPlacesCount.textContent = myPlaces.length;
    if (view.dom.accPlacesCountTab) view.dom.accPlacesCountTab.textContent = myPlaces.length;
    if (view.dom.accEditName) view.dom.accEditName.value = model.currentUser.name;
    if (view.dom.accEditRole) view.dom.accEditRole.value = role;
    if (view.dom.roleRankProgress) view.dom.roleRankProgress.innerHTML = this.getRoleRankProgress(myPlaces.length);

    this.switchAccountTab('profile');
    this.renderUserPlaces();

    view.dom.accountModal.style.display = 'flex';
    view.refreshIcons();
  },

  switchAccountTab(tab) {
    if (tab === 'profile') {
      view.dom.accTabProfile?.classList.add('active');
      view.dom.accTabMyPlaces?.classList.remove('active');
      if (view.dom.accProfileTabContainer) view.dom.accProfileTabContainer.style.display = 'block';
      if (view.dom.accountMyPlacesSection) view.dom.accountMyPlacesSection.style.display = 'none';
    } else {
      view.dom.accTabMyPlaces?.classList.add('active');
      view.dom.accTabProfile?.classList.remove('active');
      if (view.dom.accProfileTabContainer) view.dom.accProfileTabContainer.style.display = 'none';
      if (view.dom.accountMyPlacesSection) view.dom.accountMyPlacesSection.style.display = 'block';
      this.renderUserPlaces();
    }
    view.refreshIcons();
  },

  renderUserPlaces() {
    if (!model.currentUser) return;
    const myPlaces = this.getUserPlaces();
    if (view.dom.accPlacesCount) view.dom.accPlacesCount.textContent = myPlaces.length;
    if (view.dom.accPlacesCountTab) view.dom.accPlacesCountTab.textContent = myPlaces.length;

    view.renderMyPlaces(
      myPlaces,
      (place) => this.openEditPlaceModal(place),
      (place) => this.handleDeletePlace(place)
    );
  },

  openEditPlaceModal(place) {
    if (!place || !view.dom.editPlaceModal) return;

    if (view.dom.editPlaceId) view.dom.editPlaceId.value = place.id;
    if (view.dom.editPlaceName) view.dom.editPlaceName.value = place.name;
    if (view.dom.editPlaceAddress) view.dom.editPlaceAddress.value = place.address;
    if (view.dom.editPlaceDish) view.dom.editPlaceDish.value = place.recommendedDish || '';
    if (view.dom.editPlaceImage) view.dom.editPlaceImage.value = place.image || '';

    if (place.category === 'cafe') {
      if (view.dom.editCategoryCafe) view.dom.editCategoryCafe.checked = true;
    } else {
      if (view.dom.editCategoryFood) view.dom.editCategoryFood.checked = true;
    }

    if (view.dom.editPlaceCity) {
      view.dom.editPlaceCity.value = place.city || 'Hà Nội';
    }

    if (view.dom.editPlacePriceRange) {
      view.dom.editPlacePriceRange.value = place.priceRange || '<100K';
    }

    view.dom.editPlaceModal.style.display = 'flex';
    view.refreshIcons();
  },

  closeEditPlaceModal() {
    if (view.dom.editPlaceModal) {
      view.dom.editPlaceModal.style.display = 'none';
    }
  },

  async handleEditPlaceSubmit(e) {
    e.preventDefault();
    const id = view.dom.editPlaceId.value;
    const place = model.places.find(p => String(p.id) === String(id));
    if (!place) return;

    const newCategory = document.querySelector('input[name="editPlaceCategory"]:checked')?.value || 'food';
    const newName = view.dom.editPlaceName.value.trim();
    const newCity = view.dom.editPlaceCity.value;
    const newPriceRange = view.dom.editPlacePriceRange?.value || '<100K';
    const newAddress = view.dom.editPlaceAddress.value.trim();
    const newDish = view.dom.editPlaceDish.value.trim();
    const newImage = view.dom.editPlaceImage.value.trim();

    if (!newName) {
      view.showToast('Vui lòng nhập tên quán!', 'warning');
      return;
    }

    place.category = newCategory;
    place.name = newName;
    place.city = newCity;
    place.priceRange = newPriceRange;
    place.address = newAddress;
    place.recommendedDish = newDish;
    if (newImage) place.image = newImage;

    // Gửi cập nhật lên Java Backend
    try {
      if (!isNaN(Number(id))) {
        await apiService.updatePlace(id, place);
      }
    } catch (err) {}

    model.savePlaces();
    this.updateCounters();
    this.renderCurrentPlaces();
    this.renderUserPlaces();
    this.closeEditPlaceModal();
    view.showToast(`Đã cập nhật thông tin quán "${newName}" thành công!`, 'success');
  },

  async handleDeletePlace(place) {
    if (!place) return;
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa quán "${place.name}" khỏi danh sách?`);
    if (!confirmed) return;

    // Gọi API xoá lên Java Backend
    try {
      if (!isNaN(Number(place.id))) {
        await apiService.deletePlace(place.id);
      }
    } catch (err) {}

    model.places = model.places.filter(p => String(p.id) !== String(place.id));
    model.savePlaces();

    if (model.currentUser) {
      const myCount = this.getUserPlacesCount();
      const newRole = this.getRoleByPlacesCount(myCount);
      if (model.currentUser.role !== newRole) {
        model.currentUser.role = newRole;
        model.saveUser(model.currentUser);
        apiService.updateUser(model.currentUser.name, model.currentUser.name, newRole).catch(() => {});
      }
    }

    this.updateCounters();
    this.updateAuthView();
    this.renderCurrentPlaces();
    this.renderUserPlaces();
    view.showToast(`Đã xóa quán "${place.name}"!`, 'info');
  },

  closeAccountModal() {
    view.dom.accountModal.style.display = 'none';
  },

  // Upload xử lý ảnh
  async handleFileSelection(file) {
    if (!file || !file.type.startsWith('image/')) {
      view.showToast('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP,...)', 'warning');
      return;
    }

    this.selectedRawFile = file;

    // Ưu tiên đẩy file ảnh lên Java Spring Boot server
    try {
      const serverUrl = await apiService.uploadImage(file);
      if (serverUrl) {
        this.uploadedImageData = serverUrl;
        this.updateUploadPreview(serverUrl, file.name, file.size, true);
        view.showToast('Đã tải ảnh lên máy chủ thành công!', 'success');
        return;
      }
    } catch (e) {
      console.log('Chuyển nén ảnh client');
    }

    // Fallback: Nén nhẹ phía client chống lag
    this.compressImageFile(file, (dataUrl, name, size) => {
      this.uploadedImageData = dataUrl;
      this.updateUploadPreview(dataUrl, name, size, false);
      view.showToast('Tải ảnh từ thiết bị thành công!', 'success');
    });
  },

  updateUploadPreview(src, name, size, isServer) {
    if (view.dom.uploadPreviewImg) view.dom.uploadPreviewImg.src = src;
    if (view.dom.previewFileName) view.dom.previewFileName.textContent = name;
    if (view.dom.previewFileSize) {
      const sizeKB = Math.round(size / 1024);
      const label = isServer ? ' (Đã lưu máy chủ)' : '';
      view.dom.previewFileSize.textContent = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB${label}` : `${sizeKB} KB${label}`;
    }
    if (view.dom.uploadDropZone) view.dom.uploadDropZone.style.display = 'none';
    if (view.dom.uploadPreviewBox) view.dom.uploadPreviewBox.style.display = 'flex';
    view.refreshIcons();
  },

  compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
          else { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.82), file.name, file.size);
      };
      img.onerror = () => callback(e.target.result, file.name, file.size);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  resetImageUpload() {
    this.uploadedImageData = '';
    this.selectedRawFile = null;
    if (view.dom.newPlaceFileInput) view.dom.newPlaceFileInput.value = '';
    if (view.dom.uploadPreviewBox) view.dom.uploadPreviewBox.style.display = 'none';
    if (view.dom.uploadDropZone) view.dom.uploadDropZone.style.display = 'flex';
    if (view.dom.newPlaceImage) view.dom.newPlaceImage.value = '';
  },

  async handleAddPlaceSubmit(e) {
    e.preventDefault();
    if (!model.currentUser) {
      view.showToast('Vui lòng đăng nhập để thêm quán mới!', 'error');
      this.openAuthModal('login');
      return;
    }

    const category = document.querySelector('input[name="placeCategory"]:checked')?.value || 'food';
    const name = document.getElementById('newPlaceName')?.value.trim() || '';
    const city = document.getElementById('newPlaceCity')?.value.trim() || '';
    const priceRange = document.getElementById('newPlacePriceRange')?.value || '<100K';
    const address = document.getElementById('newPlaceAddress')?.value.trim() || '';
    const recommendedDish = document.getElementById('newPlaceDish')?.value.trim() || '';
    const inputUrl = document.getElementById('newPlaceImage')?.value.trim() || '';

    const defaultImg = category === 'food' 
      ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80';

    // Nếu có file ảnh được chọn từ thiết bị mà chưa có URL máy chủ thì tải lên máy chủ ngay
    if (this.selectedRawFile && (!this.uploadedImageData || this.uploadedImageData.startsWith('data:'))) {
      try {
        const uploadedUrl = await apiService.uploadImage(this.selectedRawFile);
        if (uploadedUrl) {
          this.uploadedImageData = uploadedUrl;
        }
      } catch (err) {
        console.warn('Không thể upload ảnh lên server, dùng ảnh mặc định/fallback');
      }
    }

    const finalImage = this.uploadedImageData || inputUrl || defaultImg;

    if (!name) {
      document.getElementById('errPlaceName')?.classList.add('show');
      return;
    } else {
      document.getElementById('errPlaceName')?.classList.remove('show');
    }

    if (!address) {
      document.getElementById('errPlaceAddress')?.classList.add('show');
      return;
    } else {
      document.getElementById('errPlaceAddress')?.classList.remove('show');
    }

    const submitBtn = document.getElementById('submitPlaceBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin-icon"></i> ĐANG LƯU QUÁN...';
      view.refreshIcons();
    }

    try {
      // Đảm bảo lấy được ID của user từ database nếu local chưa có
      if (model.currentUser && !model.currentUser.id && (model.currentUser.username || model.currentUser.name)) {
        try {
          const u = await apiService.getUser(model.currentUser.username || model.currentUser.name);
          if (u && u.id) {
            model.currentUser.id = u.id;
            model.saveUser(model.currentUser);
          }
        } catch (e) {}
      }

      const newPlace = {
        id: `custom_${Date.now()}`,
        userId: model.currentUser && model.currentUser.id ? model.currentUser.id : null,
        name,
        category,
        city,
        priceRange,
        address,
        image: finalImage,
        recommendedDish: recommendedDish || null,
        suggestedBy: model.currentUser.name,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Gửi lên Java backend (loại bỏ id client để backend sinh ID tự động)
      const payload = { ...newPlace };
      delete payload.id;

      const serverPlace = await apiService.createPlace(payload);
      if (serverPlace && serverPlace.id) {
        newPlace.id = serverPlace.id;
        if (serverPlace.userId) newPlace.userId = serverPlace.userId;
        console.log('✅ Đã lưu quán vào database server thành công, ID:', serverPlace.id, 'UserId:', serverPlace.userId);
      } else {
        console.warn('⚠️ Server chưa phản hồi, lưu tạm quán vào local');
      }

      model.places.unshift(newPlace);
      model.savePlaces();

      // Cập nhật lại danh xưng tự động theo số quán đã đóng góp
      const userPlacesCount = this.getUserPlacesCount();
      const newRole = this.getRoleByPlacesCount(userPlacesCount);
      if (model.currentUser.role !== newRole) {
        model.currentUser.role = newRole;
        model.saveUser(model.currentUser);
        apiService.updateUser(model.currentUser.name, model.currentUser.name, newRole).catch(() => {});
        view.showToast(`Chúc mừng bạn đã đạt danh xưng mới: "${newRole}"!`, 'success');
      }

      this.updateCounters();
      this.updateAuthView();
      this.resetImageUpload();
      view.dom.addPlaceForm?.reset();

      view.showToast(`🎉 Thêm quán "${name}" thành công! Gợi ý từ: ${model.currentUser.name}`, 'success');
      this.switchTab(category);

      setTimeout(() => {
        const card = document.getElementById(`card-${newPlace.id}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.outline = '3px solid #10b981';
          setTimeout(() => card.style.outline = 'none', 2500);
        }
      }, 300);
    } catch (err) {
      console.error('Lỗi khi thêm quán:', err);
      view.showToast('Có lỗi xảy ra khi lưu quán!', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="check-circle-2"></i> ĐĂNG GỢI Ý NGAY';
        view.refreshIcons();
      }
    }
  },

  bindEvents() {
    // Brand click
    view.dom.brandLogo?.addEventListener('click', () => this.switchTab('food'));

    // Navigation Tabs
    view.dom.tabFood?.addEventListener('click', () => this.switchTab('food'));
    view.dom.tabCafe?.addEventListener('click', () => this.switchTab('cafe'));
    view.dom.tabAdd?.addEventListener('click', () => this.switchTab('add'));

    // City Filter
    view.dom.cityFilter?.addEventListener('change', (e) => {
      model.filters.city = e.target.value;
      this.renderCurrentPlaces();
    });

    // Search Input
    let searchTimeout = null;
    view.dom.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value;
      if (view.dom.clearSearchBtn) view.dom.clearSearchBtn.style.display = val ? 'flex' : 'none';
      searchTimeout = setTimeout(() => {
        model.filters.search = val;
        this.renderCurrentPlaces();
      }, 200);
    });

    view.dom.clearSearchBtn?.addEventListener('click', () => {
      view.dom.searchInput.value = '';
      model.filters.search = '';
      view.dom.clearSearchBtn.style.display = 'none';
      this.renderCurrentPlaces();
    });


    // Quick Randomizer Button in toolbar
    view.dom.filterRandomBtn?.addEventListener('click', () => {
      this.handleRandomPicker();
    });

    // Reset Filters
    view.dom.resetFiltersBtn?.addEventListener('click', () => this.resetFilters());
    view.dom.emptyResetBtn?.addEventListener('click', () => this.resetFilters());

    // Guest Gate Buttons
    view.dom.gateLoginBtn?.addEventListener('click', () => this.openAuthModal('login'));

    // Form Add Place
    view.dom.addPlaceForm?.addEventListener('submit', (e) => this.handleAddPlaceSubmit(e));
    view.dom.resetFormBtn?.addEventListener('click', () => {
      view.dom.addPlaceForm.reset();
      this.resetImageUpload();
    });

    // File Upload (iOS, Android, Mac, Win)
    if (view.dom.uploadDropZone && view.dom.newPlaceFileInput) {
      view.dom.uploadDropZone.addEventListener('click', () => view.dom.newPlaceFileInput.click());
      view.dom.newPlaceFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) this.handleFileSelection(e.target.files[0]);
      });

      ['dragenter', 'dragover'].forEach(name => {
        view.dom.uploadDropZone.addEventListener(name, (e) => {
          e.preventDefault(); e.stopPropagation();
          view.dom.uploadDropZone.classList.add('drag-active');
        });
      });
      ['dragleave', 'dragend', 'drop'].forEach(name => {
        view.dom.uploadDropZone.addEventListener(name, (e) => {
          e.preventDefault(); e.stopPropagation();
          view.dom.uploadDropZone.classList.remove('drag-active');
        });
      });
      view.dom.uploadDropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer?.files?.[0]) this.handleFileSelection(e.dataTransfer.files[0]);
      });
    }

    view.dom.btnChangeUpload?.addEventListener('click', () => view.dom.newPlaceFileInput?.click());
    view.dom.btnRemoveUpload?.addEventListener('click', () => this.resetImageUpload());
    view.dom.btnToggleUrl?.addEventListener('click', () => {
      if (view.dom.uploadUrlInputWrap) {
        const isShow = view.dom.uploadUrlInputWrap.style.display === 'block';
        view.dom.uploadUrlInputWrap.style.display = isShow ? 'none' : 'block';
      }
    });

    view.dom.btnFormViewAccount?.addEventListener('click', () => this.openAccountModal());

    // Auth Modal
    view.dom.authModalClose?.addEventListener('click', (e) => {
      e?.preventDefault();
      this.closeAuthModal();
    });
    view.dom.authTabLogin?.addEventListener('click', (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      this.setAuthMode('login');
    });
    view.dom.authTabRegister?.addEventListener('click', (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      this.setAuthMode('register');
    });
    view.dom.authForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAuthSubmit();
    });

    view.dom.accountModalClose?.addEventListener('click', () => this.closeAccountModal());
    view.dom.btnModalLogout?.addEventListener('click', () => {
      this.closeAccountModal();
      this.handleLogout();
    });
    view.dom.accountUpdateForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newName = view.dom.accEditName.value.trim();
      if (!newName) {
        view.showToast('Vui lòng không để trống họ tên!', 'warning');
        return;
      }
      const oldName = model.currentUser.name;
      const myPlaces = model.places.filter(p => p.suggestedBy === oldName);
      const role = this.getRoleByPlacesCount(myPlaces.length);

      // Cập nhật lên Database server
      try {
        await apiService.updateUser(oldName, newName, role);
      } catch (err) {
        console.warn('Không thể cập nhật user lên server:', err);
      }

      model.currentUser.name = newName;
      model.currentUser.role = role;
      model.places.forEach(p => {
        if (p.suggestedBy === oldName) {
          p.suggestedBy = newName;
          p.suggestedByRole = role;
        }
      });
      model.saveUser(model.currentUser);
      model.savePlaces();
      this.updateAuthView();
      this.renderCurrentPlaces();
      this.closeAccountModal();
      view.showToast('Đã cập nhật thông tin tài khoản thành công!', 'success');
    });

    // Form đổi mật khẩu
    view.dom.changePasswordForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (view.dom.errAccCurrentPass) view.dom.errAccCurrentPass.style.display = 'none';
      if (view.dom.errAccNewPass) view.dom.errAccNewPass.style.display = 'none';
      if (view.dom.errAccConfirmPass) view.dom.errAccConfirmPass.style.display = 'none';

      const currentPass = view.dom.accCurrentPass?.value || '';
      const newPass = view.dom.accNewPass?.value || '';
      const confirmPass = view.dom.accConfirmPass?.value || '';

      if (!currentPass) {
        if (view.dom.errAccCurrentPass) {
          view.dom.errAccCurrentPass.textContent = 'Vui lòng nhập mật khẩu hiện tại';
          view.dom.errAccCurrentPass.style.display = 'block';
        }
        return;
      }

      if (!newPass || newPass.length < 4) {
        if (view.dom.errAccNewPass) {
          view.dom.errAccNewPass.textContent = 'Mật khẩu mới phải từ 4 ký tự trở lên';
          view.dom.errAccNewPass.style.display = 'block';
        }
        return;
      }

      if (newPass !== confirmPass) {
        if (view.dom.errAccConfirmPass) {
          view.dom.errAccConfirmPass.textContent = 'Mật khẩu xác nhận không khớp';
          view.dom.errAccConfirmPass.style.display = 'block';
        }
        return;
      }

      const btn = view.dom.btnChangePassword;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin-icon"></i> Đang đổi mật khẩu...';
        view.refreshIcons();
      }

      const username = model.currentUser?.username || model.currentUser?.name;
      const res = await apiService.changePassword(username, currentPass, newPass);

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="shield-check"></i> CẬP NHẬT MẬT KHẨU';
        view.refreshIcons();
      }

      if (res && res.ok) {
        view.showToast('Đổi mật khẩu thành công!', 'success');
        view.dom.changePasswordForm.reset();
      } else {
        if (view.dom.errAccCurrentPass) {
          view.dom.errAccCurrentPass.textContent = res?.message || 'Mật khẩu hiện tại không chính xác';
          view.dom.errAccCurrentPass.style.display = 'block';
        }
        view.showToast(res?.message || 'Không thể đổi mật khẩu!', 'error');
      }
    });

    // Account Sub Tabs (Hồ sơ vs Quán đã thêm)
    view.dom.accTabProfile?.addEventListener('click', () => this.switchAccountTab('profile'));
    view.dom.accTabMyPlaces?.addEventListener('click', () => this.switchAccountTab('myplaces'));

    // Edit Place Modal Events
    view.dom.editPlaceModalClose?.addEventListener('click', () => this.closeEditPlaceModal());
    view.dom.btnCancelEditPlace?.addEventListener('click', () => this.closeEditPlaceModal());
    view.dom.editPlaceForm?.addEventListener('submit', (e) => this.handleEditPlaceSubmit(e));

    // Random Mystery Modal Actions
    view.dom.randomCityFilter?.addEventListener('change', () => this.handleRandomFilterChange());
    view.dom.randomPriceFilter?.addEventListener('change', () => this.handleRandomFilterChange());
    view.dom.randomModalClose?.addEventListener('click', () => this.closeRandomModal());
    view.dom.reRollBtn?.addEventListener('click', () => {
      const candidates = this.getRandomCandidates();
      if (candidates && candidates.length) {
        this.spinRandomWheel(candidates);
      } else {
        this.showRandomEmptyState();
      }
    });
    view.dom.acceptPickBtn?.addEventListener('click', () => {
      this.closeRandomModal();
      if (this.selectedWinnerPlace) {
        const p = this.selectedWinnerPlace;
        // Chuyển sang đúng tab nếu cần
        if (model.currentTab !== p.category) {
          this.switchTab(p.category);
        }
        setTimeout(() => {
          const card = document.getElementById(`card-${p.id}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.outline = '3px solid #f59e0b';
            card.style.transition = 'outline 0.3s ease';
            setTimeout(() => card.style.outline = 'none', 3000);
          }
        }, 300);
        view.showToast(`Chúc bạn có trải nghiệm tuyệt vời tại "${p.name}"!`, 'success');
      }
    });

    // Modals backdrop click & ESC
    window.addEventListener('click', (e) => {
      if (e.target === view.dom.authModal) this.closeAuthModal();
      if (e.target === view.dom.accountModal) this.closeAccountModal();
      if (e.target === view.dom.randomModal) this.closeRandomModal();
      if (e.target === view.dom.editPlaceModal) this.closeEditPlaceModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAuthModal();
        this.closeAccountModal();
        this.closeRandomModal();
        this.closeEditPlaceModal();
      }
    });
  },

  resetFilters() {
    model.filters.search = '';
    model.filters.city = 'all';
    view.dom.searchInput.value = '';
    if (view.dom.clearSearchBtn) view.dom.clearSearchBtn.style.display = 'none';
    view.dom.cityFilter.value = 'all';
    this.renderCurrentPlaces();
    view.showToast('Đã xóa tất cả bộ lọc!', 'info');
  }
};

// Khởi chạy ứng dụng khi DOM tải xong
document.addEventListener('DOMContentLoaded', () => appController.init());
