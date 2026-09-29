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
      if (backendPlaces && Array.isArray(backendPlaces) && backendPlaces.length > 0) {
        // Lấy tập hợp ID quán từ server
        const backendIds = new Set(backendPlaces.map(p => String(p.id)));

        // Tìm các quán local người dùng đã tự thêm trước đó mà chưa kịp lưu lên server
        const pendingLocalPlaces = model.places.filter(p => 
          p && (String(p.id).startsWith('custom_') || (!backendIds.has(String(p.id)) && p.suggestedBy))
        );

        // Đẩy các quán local chưa có lên server để lưu vĩnh viễn vào DB
        for (const localP of pendingLocalPlaces) {
          try {
            const synced = await apiService.createPlace(localP);
            if (synced && synced.id) {
              localP.id = synced.id;
              backendPlaces.unshift(synced);
              backendIds.add(String(synced.id));
            }
          } catch (e) {
            console.warn('Lỗi đồng bộ quán local lên server:', e);
          }
        }

        // Hợp nhất dữ liệu: ưu tiên các quán từ backend, kết hợp các quán local còn lại (nếu server tạm thời lỗi)
        const mergedPlaces = [...backendPlaces];
        for (const localP of pendingLocalPlaces) {
          if (!mergedPlaces.some(p => String(p.id) === String(localP.id))) {
            mergedPlaces.unshift(localP);
          }
        }

        model.places = mergedPlaces;
        model.savePlaces();
        this.updateCounters();
        this.renderCurrentPlaces();
        console.log('✅ [MVC Controller] Đã kết nối & đồng bộ dữ liệu từ Java Spring Boot Backend (Tổng quán:', model.places.length, ')');

        // Đồng bộ tài khoản hiện tại lên database nếu có
        if (model.currentUser && model.currentUser.name) {
          try {
            const u = await apiService.loginOrRegister(model.currentUser.name, model.currentUser.role);
            if (u && u.name) {
              model.saveUser(u);
              this.updateAuthView();
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.log('ℹ️ [MVC Controller] Backend chưa bật, dùng dữ liệu lưu trữ local');
    }
  },

  updateCounters() {
    const foodCount = model.places.filter(p => p.category === 'food').length;
    const cafeCount = model.places.filter(p => p.category === 'cafe').length;
    view.updateCounters(foodCount, cafeCount);
  },

  updateAuthView() {
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

    // Lọc danh sách theo đúng tab danh mục hiện tại (kèm theo bộ lọc thành phố nếu có)
    let candidatePlaces = model.places.filter(p => p.category === targetCategory);
    if (model.filters.city !== 'all') {
      candidatePlaces = candidatePlaces.filter(p => p.city === model.filters.city);
    }

    if (!candidatePlaces.length) {
      // Nếu thành phố đang chọn không có quán nào thì lấy tất cả theo danh mục
      candidatePlaces = model.places.filter(p => p.category === targetCategory);
    }

    if (!candidatePlaces.length) {
      view.showToast(`Chưa có địa điểm ${targetCategoryName} nào trong hệ thống!`, 'warning');
      return;
    }

    // Mở modal quay ngẫu nhiên
    this.openRandomModal(candidatePlaces, targetCategory);
  },

  openRandomModal(places, category) {
    if (!view.dom.randomModal) return;

    this.currentRandomCandidates = places;
    this.currentRandomCategory = category;

    const isCafe = category === 'cafe';
    const categoryTitle = isCafe ? 'HÔM NAY ĐI CAFE Ở ĐÂU?' : 'HÔM NAY BẠN SẼ ĂN GÌ?';
    const categorySub = isCafe 
      ? `Hệ thống đang quay ngẫu nhiên 1 trong ${places.length} quán cafe chill...`
      : `Hệ thống đang quay ngẫu nhiên 1 trong ${places.length} quán ăn ngon...`;

    if (view.dom.randomModalTitle) view.dom.randomModalTitle.textContent = categoryTitle;
    if (view.dom.randomModalSubtitle) view.dom.randomModalSubtitle.textContent = categorySub;

    if (view.dom.randomWheelBox) view.dom.randomWheelBox.style.display = 'block';
    if (view.dom.winnerCard) view.dom.winnerCard.style.display = 'none';

    view.dom.randomModal.style.display = 'flex';
    this.spinRandomWheel(places);
  },

  spinRandomWheel(places) {
    if (!places || !places.length) return;

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
    if (view.dom.winnerName) view.dom.winnerName.textContent = winner.name;
    if (view.dom.winnerAddress) view.dom.winnerAddress.textContent = `${winner.address} (${winner.city})`;
    if (view.dom.winnerDish) {
      view.dom.winnerDish.textContent = winner.recommendedDish || (winner.category === 'cafe' ? 'Cà phê đặc biệt' : 'Món đặc sản');
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
      if (view.dom.formUserAvatar) view.dom.formUserAvatar.textContent = initials;
      if (view.dom.formUserName) view.dom.formUserName.textContent = model.currentUser.name;
      if (view.dom.formAuthorAvatar) view.dom.formAuthorAvatar.textContent = initials;
      if (view.dom.formSuggestedByPreview) view.dom.formSuggestedByPreview.textContent = model.currentUser.name;
      if (view.dom.formAuthorRole) view.dom.formAuthorRole.textContent = model.currentUser.role || 'Thành viên đề xuất';
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
    const myPlaces = model.places.filter(p => p.suggestedBy === model.currentUser.name);

    if (view.dom.accAvatarLarge) view.dom.accAvatarLarge.textContent = initials;
    if (view.dom.accNameDisplay) view.dom.accNameDisplay.textContent = model.currentUser.name;
    if (view.dom.accRoleDisplay) view.dom.accRoleDisplay.textContent = model.currentUser.role || 'Thành viên đề xuất';
    if (view.dom.accPlacesCount) view.dom.accPlacesCount.textContent = myPlaces.length;
    if (view.dom.accPlacesCountTab) view.dom.accPlacesCountTab.textContent = myPlaces.length;
    if (view.dom.accFavsCount) view.dom.accFavsCount.textContent = model.favorites.length;
    if (view.dom.accEditName) view.dom.accEditName.value = model.currentUser.name;
    if (view.dom.accEditRole) view.dom.accEditRole.value = model.currentUser.role || '';

    this.switchAccountTab('profile');
    this.renderUserPlaces();

    view.dom.accountModal.style.display = 'flex';
    view.refreshIcons();
  },

  switchAccountTab(tab) {
    if (tab === 'profile') {
      view.dom.accTabProfile?.classList.add('active');
      view.dom.accTabMyPlaces?.classList.remove('active');
      if (view.dom.accountUpdateForm) view.dom.accountUpdateForm.style.display = 'flex';
      if (view.dom.accountMyPlacesSection) view.dom.accountMyPlacesSection.style.display = 'none';
    } else {
      view.dom.accTabMyPlaces?.classList.add('active');
      view.dom.accTabProfile?.classList.remove('active');
      if (view.dom.accountUpdateForm) view.dom.accountUpdateForm.style.display = 'none';
      if (view.dom.accountMyPlacesSection) view.dom.accountMyPlacesSection.style.display = 'block';
      this.renderUserPlaces();
    }
    view.refreshIcons();
  },

  renderUserPlaces() {
    if (!model.currentUser) return;
    const myPlaces = model.places.filter(p => p.suggestedBy === model.currentUser.name);
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
    this.updateCounters();
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

    if (!recommendedDish) {
      view.showToast('Vui lòng nhập món ngon hoặc điểm đặc sắc nên thử!', 'warning');
      return;
    }

    const submitBtn = document.getElementById('submitPlaceBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin-icon"></i> ĐANG LƯU QUÁN...';
      view.refreshIcons();
    }

    try {
      const newPlace = {
        id: `custom_${Date.now()}`,
        name,
        category,
        city,
        district: city,
        address,
        price: 50000,
        priceDisplay: '',
        rating: 5.0,
        reviewCount: 1,
        image: finalImage,
        tags: [category === 'food' ? 'Quán ăn' : 'Cafe'],
        recommendedDish,
        suggestedBy: model.currentUser.name,
        suggestedByRole: model.currentUser.role || 'Thành viên đề xuất',
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Gửi lên Java backend (loại bỏ id để backend sinh ID tự động)
      const payload = { ...newPlace };
      delete payload.id;

      const serverPlace = await apiService.createPlace(payload);
      if (serverPlace && serverPlace.id) {
        newPlace.id = serverPlace.id;
        console.log('✅ Đã lưu quán vào database server thành công, ID:', serverPlace.id);
      } else {
        console.warn('⚠️ Server chưa phản hồi, lưu tạm quán vào local');
      }

      model.places.unshift(newPlace);
      model.savePlaces();
      this.updateCounters();
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
    view.dom.authModalClose?.addEventListener('click', () => this.closeAuthModal());
    view.dom.authTabLogin?.addEventListener('click', () => this.setAuthMode('login'));
    view.dom.authTabRegister?.addEventListener('click', () => this.setAuthMode('register'));
    view.dom.authForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAuthSubmit();
    });

    // Account Modal
    view.dom.accountModalClose?.addEventListener('click', () => this.closeAccountModal());
    view.dom.btnModalLogout?.addEventListener('click', () => {
      this.closeAccountModal();
      this.handleLogout();
    });
    view.dom.accountUpdateForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newName = view.dom.accEditName.value.trim();
      const newRole = view.dom.accEditRole.value.trim() || 'Thành viên đề xuất';
      if (!newName) {
        view.showToast('Vui lòng không để trống họ tên!', 'warning');
        return;
      }
      const oldName = model.currentUser.name;

      // Cập nhật lên Database server
      try {
        await apiService.updateUser(oldName, newName, newRole);
      } catch (err) {
        console.warn('Không thể cập nhật user lên server:', err);
      }

      model.currentUser.name = newName;
      model.currentUser.role = newRole;
      model.places.forEach(p => {
        if (p.suggestedBy === oldName) {
          p.suggestedBy = newName;
          p.suggestedByRole = newRole;
        }
      });
      model.saveUser(model.currentUser);
      model.savePlaces();
      this.updateAuthView();
      this.renderCurrentPlaces();
      this.closeAccountModal();
      view.showToast('Đã cập nhật thông tin tài khoản thành công!', 'success');
    });

    // Account Sub Tabs (Hồ sơ vs Quán đã thêm)
    view.dom.accTabProfile?.addEventListener('click', () => this.switchAccountTab('profile'));
    view.dom.accTabMyPlaces?.addEventListener('click', () => this.switchAccountTab('myplaces'));

    // Edit Place Modal Events
    view.dom.editPlaceModalClose?.addEventListener('click', () => this.closeEditPlaceModal());
    view.dom.btnCancelEditPlace?.addEventListener('click', () => this.closeEditPlaceModal());
    view.dom.editPlaceForm?.addEventListener('submit', (e) => this.handleEditPlaceSubmit(e));

    // Random Mystery Modal Actions
    view.dom.randomModalClose?.addEventListener('click', () => this.closeRandomModal());
    view.dom.reRollBtn?.addEventListener('click', () => {
      if (this.currentRandomCandidates && this.currentRandomCandidates.length) {
        this.spinRandomWheel(this.currentRandomCandidates);
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
