/**
 * views/view.js - Tầng View của Frontend MVC
 * Chuyên trách render HTML, DOM elements, Modals và Toast notifications
 */

const view = {
  dom: {},

  initElements() {
    this.dom = {
      // Brand & Navigation
      brandLogo: document.getElementById('brandLogo'),
      authSection: document.getElementById('authSection'),
      pwaInstallBtn: document.getElementById('pwaInstallBtn'),
      iosInstallModal: document.getElementById('iosInstallModal'),
      closeIosInstallBtn: document.getElementById('closeIosInstallBtn'),
      closeIosInstallIcon: document.getElementById('closeIosInstallIcon'),
      tabFood: document.getElementById('tabFood'),
      tabCafe: document.getElementById('tabCafe'),
      tabAdd: document.getElementById('tabAdd'),
      tabPlan: document.getElementById('tabPlan'),
      planTabLockBadge: document.getElementById('planTabLockBadge'),
      foodCount: document.getElementById('foodCount'),
      cafeCount: document.getElementById('cafeCount'),
      tabLockBadge: document.getElementById('tabLockBadge'),

      // Filter Toolbar
      filterToolbar: document.getElementById('filterToolbar'),
      searchInput: document.getElementById('searchInput'),
      clearSearchBtn: document.getElementById('clearSearchBtn'),
      cityFilter: document.getElementById('cityFilter'),
      filterRandomBtn: document.getElementById('filterRandomBtn'),
      activeFilterSummary: document.getElementById('activeFilterSummary'),
      summaryText: document.getElementById('summaryText'),
      resetFiltersBtn: document.getElementById('resetFiltersBtn'),

      // Places Grid & Sections
      placesSection: document.getElementById('placesSection'),
      sectionTitle: document.getElementById('sectionTitle'),
      sectionDesc: document.getElementById('sectionDesc'),
      resultCountBadge: document.getElementById('resultCountBadge'),
      placesGrid: document.getElementById('placesGrid'),
      emptyState: document.getElementById('emptyState'),
      emptyResetBtn: document.getElementById('emptyResetBtn'),
      infiniteScrollContainer: document.getElementById('infiniteScrollContainer'),
      infiniteScrollLoader: document.getElementById('infiniteScrollLoader'),
      infiniteScrollEnd: document.getElementById('infiniteScrollEnd'),
      infiniteScrollSentinel: document.getElementById('infiniteScrollSentinel'),

      // Add Place View
      addPlaceSection: document.getElementById('addPlaceSection'),
      guestGateCard: document.getElementById('guestGateCard'),
      gateLoginBtn: document.getElementById('gateLoginBtn'),
      addFormContainer: document.getElementById('addFormContainer'),
      addPlaceForm: document.getElementById('addPlaceForm'),
      formUserAvatar: document.getElementById('formUserAvatar'),
      formUserName: document.getElementById('formUserName'),
      formAuthorAvatar: document.getElementById('formAuthorAvatar'),
      formAuthorRole: document.getElementById('formAuthorRole'),
      formSuggestedByPreview: document.getElementById('formSuggestedByPreview'),
      btnFormViewAccount: document.getElementById('btnFormViewAccount'),
      newPlaceCity: document.getElementById('newPlaceCity'),
      newPlacePriceRange: document.getElementById('newPlacePriceRange'),
      newPlaceImage: document.getElementById('newPlaceImage'),
      newPlaceFileInput: document.getElementById('newPlaceFileInput'),
      uploadDropZone: document.getElementById('uploadDropZone'),
      uploadPreviewBox: document.getElementById('uploadPreviewBox'),
      uploadPreviewImg: document.getElementById('uploadPreviewImg'),
      previewFileName: document.getElementById('previewFileName'),
      previewFileSize: document.getElementById('previewFileSize'),
      btnChangeUpload: document.getElementById('btnChangeUpload'),
      btnRemoveUpload: document.getElementById('btnRemoveUpload'),
      btnToggleUrl: document.getElementById('btnToggleUrl'),
      uploadUrlInputWrap: document.getElementById('uploadUrlInputWrap'),
      resetFormBtn: document.getElementById('resetFormBtn'),

      // Auth Modal
      authModal: document.getElementById('authModal'),
      authModalClose: document.getElementById('authModalClose'),
      authTabLogin: document.getElementById('authTabLogin'),
      authTabRegister: document.getElementById('authTabRegister'),
      authForm: document.getElementById('authForm'),
      authEmailGroup: document.getElementById('authEmailGroup'),
      authEmail: document.getElementById('authEmail'),
      errAuthEmail: document.getElementById('errAuthEmail'),
      authUsernameGroup: document.getElementById('authUsernameGroup'),
      authUsername: document.getElementById('authUsername'),
      authUsernameLabel: document.getElementById('authUsernameLabel'),
      errAuthUsername: document.getElementById('errAuthUsername'),
      authFullNameGroup: document.getElementById('authFullNameGroup'),
      authFullName: document.getElementById('authFullName'),
      errAuthFullName: document.getElementById('errAuthFullName'),
      authPasswordGroup: document.getElementById('authPasswordGroup'),
      authPassword: document.getElementById('authPassword'),
      authSubmitBtn: document.getElementById('authSubmitBtn'),
      authModalTitle: document.getElementById('authModalTitle'),
      // Fallback an toàn cho client còn lưu cache script cũ
      authNameLabel: document.getElementById('authUsernameLabel') || document.getElementById('authNameLabel') || { textContent: '' },
      authRoleGroup: document.getElementById('authRoleGroup') || { style: {} },
      authRole: document.getElementById('authRole') || { value: '' },

      // Account Info Modal
      accountModal: document.getElementById('accountModal'),
      accountModalClose: document.getElementById('accountModalClose'),
      accAvatarWrapper: document.getElementById('accAvatarWrapper'),
      accAvatarLarge: document.getElementById('accAvatarLarge'),
      btnUploadAvatarTrigger: document.getElementById('btnUploadAvatarTrigger'),
      accAvatarFileInput: document.getElementById('accAvatarFileInput'),
      avatarActionsQuick: document.getElementById('avatarActionsQuick'),
      btnChangeAvatarLink: document.getElementById('btnChangeAvatarLink'),
      btnRemoveAvatarLink: document.getElementById('btnRemoveAvatarLink'),
      accNameDisplay: document.getElementById('accNameDisplay'),
      accRoleDisplay: document.getElementById('accRoleDisplay'),
      accPlacesCount: document.getElementById('accPlacesCount'),
      accProfileTabContainer: document.getElementById('accProfileTabContainer'),
      accountUpdateForm: document.getElementById('accountUpdateForm'),
      accEditName: document.getElementById('accEditName'),
      accEditRole: document.getElementById('accEditRole'),
      roleRankProgress: document.getElementById('roleRankProgress'),
      btnSaveAccount: document.getElementById('btnSaveAccount'),
      btnModalLogout: document.getElementById('btnModalLogout'),
      accTabProfile: document.getElementById('accTabProfile'),
      accTabMyPlaces: document.getElementById('accTabMyPlaces'),
      accTabPassword: document.getElementById('accTabPassword'),
      accPasswordTabContainer: document.getElementById('accPasswordTabContainer'),
      accPlacesCountTab: document.getElementById('accPlacesCountTab'),
      accountMyPlacesSection: document.getElementById('accountMyPlacesSection'),
      accountMyPlacesList: document.getElementById('accountMyPlacesList'),
      changePasswordForm: document.getElementById('changePasswordForm'),
      accCurrentPass: document.getElementById('accCurrentPass'),
      errAccCurrentPass: document.getElementById('errAccCurrentPass'),
      accNewPass: document.getElementById('accNewPass'),
      errAccNewPass: document.getElementById('errAccNewPass'),
      accConfirmPass: document.getElementById('accConfirmPass'),
      errAccConfirmPass: document.getElementById('errAccConfirmPass'),
      btnChangePassword: document.getElementById('btnChangePassword'),

      // Edit Place Modal
      editPlaceModal: document.getElementById('editPlaceModal'),
      editPlaceModalClose: document.getElementById('editPlaceModalClose'),
      editPlaceForm: document.getElementById('editPlaceForm'),
      editPlaceId: document.getElementById('editPlaceId'),
      editCategoryFood: document.getElementById('editCategoryFood'),
      editCategoryCafe: document.getElementById('editCategoryCafe'),
      editPlaceName: document.getElementById('editPlaceName'),
      editPlaceCity: document.getElementById('editPlaceCity'),
      editPlacePriceRange: document.getElementById('editPlacePriceRange'),
      editPlaceAddress: document.getElementById('editPlaceAddress'),
      editPlaceDish: document.getElementById('editPlaceDish'),
      editPlaceImage: document.getElementById('editPlaceImage'),
      editPlaceFileInput: document.getElementById('editPlaceFileInput'),
      editUploadDropZone: document.getElementById('editUploadDropZone'),
      editUploadPreviewBox: document.getElementById('editUploadPreviewBox'),
      editUploadPreviewImg: document.getElementById('editUploadPreviewImg'),
      editPreviewFileName: document.getElementById('editPreviewFileName'),
      editPreviewFileSize: document.getElementById('editPreviewFileSize'),
      btnEditChangeUpload: document.getElementById('btnEditChangeUpload'),
      btnEditRemoveUpload: document.getElementById('btnEditRemoveUpload'),
      btnCancelEditPlace: document.getElementById('btnCancelEditPlace'),
      btnSaveEditPlace: document.getElementById('btnSaveEditPlace'),

      // Random Mystery Modal
      randomModal: document.getElementById('randomModal'),
      randomModalClose: document.getElementById('randomModalClose'),
      randomModalTitle: document.getElementById('randomModalTitle'),
      randomModalSubtitle: document.getElementById('randomModalSubtitle'),
      randomCityFilter: document.getElementById('randomCityFilter'),
      randomPriceFilter: document.getElementById('randomPriceFilter'),
      randomWheelBox: document.getElementById('randomWheelBox'),
      slotPreview: document.getElementById('slotPreview'),
      winnerCard: document.getElementById('winnerCard'),
      winnerImage: document.getElementById('winnerImage'),
      winnerCategory: document.getElementById('winnerCategory'),
      winnerPriceTag: document.getElementById('winnerPriceTag'),
      winnerName: document.getElementById('winnerName'),
      winnerAddress: document.getElementById('winnerAddress'),
      winnerPrice: document.getElementById('winnerPrice'),
      winnerDish: document.getElementById('winnerDish'),
      winnerSuggested: document.getElementById('winnerSuggested'),
      reRollBtn: document.getElementById('reRollBtn'),
      toastContainer: document.getElementById('toastContainer'),

      // Trip Planner (Kế hoạch đi chơi)
      planSection: document.getElementById('planSection'),
      planGuestGateCard: document.getElementById('planGuestGateCard'),
      btnPlanGateLogin: document.getElementById('btnPlanGateLogin'),
      planContentContainer: document.getElementById('planContentContainer'),
      planHeroTitle: document.getElementById('planHeroTitle'),
      btnPlanNewTrip: document.getElementById('btnPlanNewTrip'),
      btnPlanManageTrips: document.getElementById('btnPlanManageTrips'),
      savedTripsCount: document.getElementById('savedTripsCount'),
      savedTripsCountFull: document.getElementById('savedTripsCountFull'),
      btnPlanPickFromDb: document.getElementById('btnPlanPickFromDb'),
      btnPlanAddCustom: document.getElementById('btnPlanAddCustom'),
      btnPlanClear: document.getElementById('btnPlanClear'),
      statPlanStops: document.getElementById('statPlanStops'),
      statPlanDuration: document.getElementById('statPlanDuration'),
      statPlanBudget: document.getElementById('statPlanBudget'),
      statPlanProgress: document.getElementById('statPlanProgress'),
      planDaysContainer: document.getElementById('planDaysContainer'),
      planDaysTabs: document.getElementById('planDaysTabs'),
      planActiveDaysHint: document.getElementById('planActiveDaysHint'),
      planTimelineList: document.getElementById('planTimelineList'),
      planEmptyState: document.getElementById('planEmptyState'),
      btnEmptyPickPlace: document.getElementById('btnEmptyPickPlace'),
      btnEmptyAddCustom: document.getElementById('btnEmptyAddCustom'),
      sidebarPlaceSearch: document.getElementById('sidebarPlaceSearch'),
      sidebarPlacesList: document.getElementById('sidebarPlacesList'),
      planPickPlaceModal: document.getElementById('planPickPlaceModal'),
      planPickModalClose: document.getElementById('planPickModalClose'),
      modalPickSearch: document.getElementById('modalPickSearch'),
      modalPickCategory: document.getElementById('modalPickCategory'),
      modalPlacesPickerGrid: document.getElementById('modalPlacesPickerGrid'),
      planAddCustomModal: document.getElementById('planAddCustomModal'),
      planCustomModalClose: document.getElementById('planCustomModalClose'),
      planCustomModalTitle: document.getElementById('planCustomModalTitle'),
      planCustomForm: document.getElementById('planCustomForm'),
      customStopName: document.getElementById('customStopName'),
      customStopDay: document.getElementById('customStopDay'),
      customStopTime: document.getElementById('customStopTime'),
      customStopAddress: document.getElementById('customStopAddress'),
      customStopDish: document.getElementById('customStopDish'),
      customStopPrice: document.getElementById('customStopPrice'),
      customStopNote: document.getElementById('customStopNote'),
      planEditStopModal: document.getElementById('planEditStopModal'),
      planEditStopModalClose: document.getElementById('planEditStopModalClose'),
      planEditStopForm: document.getElementById('planEditStopForm'),
      editStopId: document.getElementById('editStopId'),
      editStopName: document.getElementById('editStopName'),
      editStopDay: document.getElementById('editStopDay'),
      editStopTime: document.getElementById('editStopTime'),
      editStopAddress: document.getElementById('editStopAddress'),
      editStopDish: document.getElementById('editStopDish'),
      editStopPrice: document.getElementById('editStopPrice'),
      editStopNote: document.getElementById('editStopNote'),
      editStopReview: document.getElementById('editStopReview'),
      // New Plan Modals
      planCreateTripModal: document.getElementById('planCreateTripModal'),
      planCreateTripModalClose: document.getElementById('planCreateTripModalClose'),
      planCreateTripForm: document.getElementById('planCreateTripForm'),
      newTripTitle: document.getElementById('newTripTitle'),
      newTripStartDate: document.getElementById('newTripStartDate'),
      newTripEndDate: document.getElementById('newTripEndDate'),
      tripDurationPreview: document.getElementById('tripDurationPreview'),
      tripDurationPreviewVal: document.getElementById('tripDurationPreviewVal'),
      planManageTripsModal: document.getElementById('planManageTripsModal'),
      planManageTripsModalClose: document.getElementById('planManageTripsModalClose'),
      savedTripsList: document.getElementById('savedTripsList'),
      btnOpenNewTripFromManage: document.getElementById('btnOpenNewTripFromManage'),
      planEditTripModal: document.getElementById('planEditTripModal'),
      planEditTripModalClose: document.getElementById('planEditTripModalClose'),
      planEditTripForm: document.getElementById('planEditTripForm'),
      editTripId: document.getElementById('editTripId'),
      editTripTitle: document.getElementById('editTripTitle'),
      editTripStartDate: document.getElementById('editTripStartDate'),
      editTripEndDate: document.getElementById('editTripEndDate'),
      editTripStatus: document.getElementById('editTripStatus'),
      editTripDurationPreviewVal: document.getElementById('editTripDurationPreviewVal')
    };
  },

  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  },

  getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  getFallbackImage(place) {
    const isFood = !place || place.category !== 'cafe';
    const foodImages = [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
    ];
    const cafeImages = [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'
    ];
    const list = isFood ? foodImages : cafeImages;
    let seed = 0;
    if (place && place.id) {
      seed = typeof place.id === 'number' ? place.id : Array.from(String(place.id)).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    } else if (place && place.name) {
      seed = Array.from(String(place.name)).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    }
    return list[Math.abs(seed) % list.length];
  },

  createPlaceCardHTML(place, favorites = []) {
    const isFav = favorites.includes(place.id);
    const catBadgeClass = place.category === 'food' ? 'badge-food' : 'badge-cafe';
    const catLabel = place.category === 'food' ? 'QUÁN ĂN' : 'QUÁN CAFE';
    const catIcon = place.category === 'food' ? 'utensils' : 'coffee';
    const initials = this.getInitials(place.suggestedBy);
    let authorAvatarContent = initials;
    if (place.suggestedByAvatar) {
      authorAvatarContent = `<img src="${this.escapeHTML(place.suggestedByAvatar)}" alt="${this.escapeHTML(place.suggestedBy || '')}" class="user-avatar-img">`;
    } else if (typeof model !== 'undefined' && model.currentUser && model.currentUser.avatar && (place.suggestedBy === model.currentUser.name || place.suggestedBy === model.currentUser.username)) {
      authorAvatarContent = `<img src="${this.escapeHTML(model.currentUser.avatar)}" alt="${this.escapeHTML(place.suggestedBy || '')}" class="user-avatar-img">`;
    }

    const fallbackImg = this.getFallbackImage(place);
    let rawImg = (place.image && typeof place.image === 'string') ? place.image.trim() : '';

    // Chuẩn hóa nếu link ảnh chứa domain cũ onrender.com -> thành relative path
    if (rawImg.includes('/uploads/')) {
      rawImg = rawImg.substring(rawImg.lastIndexOf('/uploads/'));
    }

    const imgSrc = rawImg || fallbackImg;

    let fullAddress = place.address || '';
    if (place.city && !fullAddress.toLowerCase().includes(place.city.toLowerCase())) {
      fullAddress = fullAddress ? `${fullAddress}, ${place.city}` : place.city;
    }

    return `
      <article class="place-card" id="card-${place.id}">
        <div class="card-image-wrap">
          <img 
            src="${this.escapeHTML(imgSrc)}" 
            alt="${this.escapeHTML(place.name)}" 
            class="card-image"
            loading="lazy"
            onerror="if (!this.dataset.fallbackTried) { this.dataset.fallbackTried = '1'; this.src = '${this.escapeHTML(fallbackImg)}'; }"
          >
          <span class="card-category-badge ${catBadgeClass}">
            <i data-lucide="${catIcon}"></i> ${catLabel}
          </span>
        </div>

        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-title">${this.escapeHTML(place.name)}</h3>
            <span class="card-price-pill">${this.escapeHTML(place.priceRange || '<100K')}</span>
          </div>

          <div class="card-info-item address">
            <i data-lucide="map-pin"></i>
            <span>${this.escapeHTML(fullAddress)}</span>
          </div>

          ${place.recommendedDish ? `
            <div class="card-highlight-dish">
              <strong>Món nên thử:</strong> ${this.escapeHTML(place.recommendedDish)}
            </div>
          ` : ''}

          <div class="card-footer">
            <div class="suggested-by-badge" title="Người đã đề xuất địa điểm này">
              <div class="suggested-avatar">${authorAvatarContent}</div>
              <div class="suggested-text">
                <span class="suggested-label">Gợi ý từ:</span>
                <strong class="suggested-name">${this.escapeHTML(place.suggestedBy || 'Ẩn danh')}</strong>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  renderPlaces(places, favorites) {
    if (this.dom.resultCountBadge) {
      this.dom.resultCountBadge.style.display = 'none';
    }

    if (!places || places.length === 0) {
      this.dom.placesGrid.innerHTML = '';
      this.dom.emptyState.style.display = 'flex';
      return;
    }

    this.dom.emptyState.style.display = 'none';
    const html = places.map(place => this.createPlaceCardHTML(place, favorites)).join('');
    this.dom.placesGrid.innerHTML = html;
    this.refreshIcons();
  },

  appendPlaces(places, favorites) {
    if (!places || places.length === 0) return;
    const html = places.map(place => this.createPlaceCardHTML(place, favorites)).join('');
    this.dom.placesGrid.insertAdjacentHTML('beforeend', html);
    this.refreshIcons();
  },

  updateCounters(foodCount, cafeCount) {
    if (this.dom.foodCount) this.dom.foodCount.textContent = foodCount;
    if (this.dom.cafeCount) this.dom.cafeCount.textContent = cafeCount;
  },

  populateCities(cities) {
    this.dom.cityFilter.innerHTML = cities.map(city => {
      const val = city === "Tất cả thành phố" ? "all" : city;
      return `<option value="${val}">${city}</option>`;
    }).join('');

    const formCities = cities.filter(c => c !== "Tất cả thành phố");
    this.dom.newPlaceCity.innerHTML = formCities.map(city => {
      return `<option value="${city}">${city}</option>`;
    }).join('');
    if (this.dom.editPlaceCity) {
      this.dom.editPlaceCity.innerHTML = formCities.map(city => {
        return `<option value="${city}">${city}</option>`;
      }).join('');
    }
  },

  populateRandomCities(places) {
    if (!this.dom.randomCityFilter) return;
    const currentVal = this.dom.randomCityFilter.value || 'all';
    // Chỉ lấy các thành phố thực tế đang có trong database (places)
    const uniqueCities = [...new Set((places || []).map(p => p.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
    
    let html = '<option value="all">Tất cả thành phố</option>';
    uniqueCities.forEach(city => {
      html += `<option value="${this.escapeHTML(city)}">${this.escapeHTML(city)}</option>`;
    });
    this.dom.randomCityFilter.innerHTML = html;
    if (uniqueCities.includes(currentVal)) {
      this.dom.randomCityFilter.value = currentVal;
    } else {
      this.dom.randomCityFilter.value = 'all';
    }
  },

  renderMyPlaces(places, onEdit, onDelete) {
    if (!this.dom.accountMyPlacesList) return;

    if (!places || !places.length) {
      this.dom.accountMyPlacesList.innerHTML = `
        <div class="my-places-empty">
          <i data-lucide="inbox"></i>
          <div>Bạn chưa đóng góp địa điểm nào. Hãy vào tab "Thêm Quán" để chia sẻ nhé!</div>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    const html = places.map(p => {
      const isFood = p.category === 'food';
      const typeBadge = isFood 
        ? `<span class="my-place-badge-type food">QUÁN ĂN</span>` 
        : `<span class="my-place-badge-type cafe">QUÁN CAFE</span>`;
      const fallbackImg = isFood
        ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80';
      const imgSrc = p.image || fallbackImg;

      return `
        <div class="my-place-item" id="my-place-${p.id}">
          <div class="my-place-main-info">
            <img 
              src="${this.escapeHTML(imgSrc)}" 
              alt="${this.escapeHTML(p.name)}" 
              class="my-place-thumb"
              onerror="if (!this.dataset.fallbackTried) { this.dataset.fallbackTried = '1'; this.src = '${this.escapeHTML(fallbackImg)}'; }"
            >
            <div class="my-place-meta">
              <div class="my-place-name" title="${this.escapeHTML(p.name)}">${this.escapeHTML(p.name)}</div>
              <div class="my-place-sub">
                ${typeBadge}
                <span>${this.escapeHTML(p.city || '')}</span>
              </div>
            </div>
          </div>
          <div class="my-place-actions">
            <button type="button" class="btn-icon-action edit" data-id="${p.id}" title="Chỉnh sửa quán">
              <i data-lucide="edit-2"></i>
            </button>
            <button type="button" class="btn-icon-action delete" data-id="${p.id}" title="Xoá quán">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.dom.accountMyPlacesList.innerHTML = html;
    this.refreshIcons();

    // Gắn sự kiện cho các nút Sửa / Xoá
    this.dom.accountMyPlacesList.querySelectorAll('.btn-icon-action.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const place = places.find(item => String(item.id) === String(id));
        if (place) onEdit(place);
      });
    });

    this.dom.accountMyPlacesList.querySelectorAll('.btn-icon-action.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const place = places.find(item => String(item.id) === String(id));
        if (place) onDelete(place);
      });
    });
  },

  renderAuth(user, onOpenAccount, onLogout, onOpenLogin) {
    if (user) {
      const initials = this.getInitials(user.name);
      const avatarHTML = user.avatar
        ? `<img src="${this.escapeHTML(user.avatar)}" alt="${this.escapeHTML(user.name)}" class="user-avatar-img">`
        : initials;
      this.dom.authSection.innerHTML = `
        <div class="user-profile-badge" id="btnHeaderAccountBadge" title="Xem & quản lý thông tin tài khoản">
          <div class="user-avatar-circle">${avatarHTML}</div>
          <div class="user-info-text">
            <span class="user-greeting">Tài khoản</span>
            <span class="user-display-name">${this.escapeHTML(user.name)}</span>
          </div>
          <button class="btn-account-info-icon" id="btnHeaderAccountInfo" title="Thông tin tài khoản">
            <i data-lucide="user-cog"></i>
          </button>
          <button class="btn-logout" id="btnLogout" title="Đăng xuất">
            <i data-lucide="log-out"></i>
          </button>
        </div>
      `;

      document.getElementById('btnLogout')?.addEventListener('click', (e) => {
        e.stopPropagation();
        onLogout();
      });
      document.getElementById('btnHeaderAccountInfo')?.addEventListener('click', (e) => {
        e.stopPropagation();
        onOpenAccount();
      });
      document.getElementById('btnHeaderAccountBadge')?.addEventListener('click', () => {
        onOpenAccount();
      });

      this.dom.tabLockBadge.className = 'tab-auth-lock unlocked';
      this.dom.tabLockBadge.innerHTML = '<i data-lucide="unlock"></i>';
      this.dom.tabLockBadge.title = 'Đã đăng nhập - Sẵn sàng thêm quán';

      if (this.dom.planTabLockBadge) {
        this.dom.planTabLockBadge.className = 'tab-auth-lock unlocked';
        this.dom.planTabLockBadge.innerHTML = '<i data-lucide="unlock"></i>';
        this.dom.planTabLockBadge.title = 'Đã đăng nhập - Sẵn sàng lên kế hoạch';
      }
    } else {
      this.dom.authSection.innerHTML = `
        <div class="guest-auth-group">
          <button class="btn btn-secondary btn-sm" id="btnHeaderLogin">
            <i data-lucide="log-in"></i>
            <span>ĐĂNG NHẬP</span>
          </button>
        </div>
      `;
      document.getElementById('btnHeaderLogin')?.addEventListener('click', onOpenLogin);

      this.dom.tabLockBadge.className = 'tab-auth-lock';
      this.dom.tabLockBadge.innerHTML = '<i data-lucide="lock"></i>';
      this.dom.tabLockBadge.title = 'Yêu cầu đăng nhập để thêm quán';

      if (this.dom.planTabLockBadge) {
        this.dom.planTabLockBadge.className = 'tab-auth-lock';
        this.dom.planTabLockBadge.innerHTML = '<i data-lucide="lock"></i>';
        this.dom.planTabLockBadge.title = 'Yêu cầu đăng nhập để lên kế hoạch';
      }
    }
    this.refreshIcons();
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-circle';

    toast.innerHTML = `
      <i data-lucide="${icon}"></i>
      <span>${this.escapeHTML(message)}</span>
    `;

    this.dom.toastContainer.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ==========================================================================
  // TRIP PLANNER (LÊN KẾ HOẠCH ĐI CHƠI) RENDERING
  // ==========================================================================
  inferPeriodFromTime(timeStr) {
    if (!timeStr) return 'Chặng';
    const match = String(timeStr).match(/(\d{1,2})(?::|h|\s*:\s*|\b)/);
    if (!match) return 'Chặng';
    const hour = parseInt(match[1], 10);
    if (isNaN(hour)) return 'Chặng';
    if (hour >= 4 && hour < 11) return 'Sáng';
    if (hour >= 11 && hour < 14) return 'Trưa';
    if (hour >= 14 && hour < 18) return 'Chiều';
    if (hour >= 18 && hour < 22) return 'Tối';
    return 'Đêm';
  },

  getDateForDay(startDateStr, dayNumber) {
    if (!startDateStr) return '';
    try {
      const parts = startDateStr.split('-').map(Number);
      if (parts.length < 3) return '';
      const [y, m, d] = parts;
      const date = new Date(y, m - 1, d + (dayNumber - 1));
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}`;
    } catch (e) {
      return '';
    }
  },

  populateDaySelectOptions(selectElem, totalDays, startDate, selectedDay = 1) {
    if (!selectElem) return;
    let html = '';
    const count = Math.max(1, parseInt(totalDays, 10) || 1);
    for (let d = 1; d <= count; d++) {
      const dateStr = this.getDateForDay(startDate, d);
      const label = dateStr ? `Ngày ${d} (${dateStr})` : `Ngày ${d}`;
      html += `<option value="${d}" ${d === parseInt(selectedDay, 10) ? 'selected' : ''}>${label}</option>`;
    }
    selectElem.innerHTML = html;
  },

  renderTripPlan(plan, userPlans, activeDayFilter, onToggleComplete, onDeleteStop, onEditStop, onSelectDayFilter, activeReviewStopId, onSaveReview, onEditReview, onCancelReview) {
    if (!this.dom.planTimelineList) return;

    if (!plan) {
      if (this.dom.planHeroTitle) {
        this.dom.planHeroTitle.textContent = 'CHƯA CÓ KẾ HOẠCH NÀO';
      }
      const emptyCount = String(Array.isArray(userPlans) ? userPlans.length : 0);
      if (this.dom.savedTripsCount) this.dom.savedTripsCount.textContent = emptyCount;
      if (this.dom.savedTripsCountFull) this.dom.savedTripsCountFull.textContent = emptyCount;
      if (this.dom.statPlanStops) this.dom.statPlanStops.textContent = '0 địa điểm';
      if (this.dom.statPlanProgress) this.dom.statPlanProgress.textContent = '0/0';
      if (this.dom.statPlanDuration) this.dom.statPlanDuration.textContent = '0 ngày';
      if (this.dom.statPlanBudget) this.dom.statPlanBudget.textContent = '0đ';
      if (this.dom.planDaysTabs) this.dom.planDaysTabs.innerHTML = '';
      if (this.dom.planTimelineList) this.dom.planTimelineList.style.display = 'none';
      if (this.dom.planEmptyState) {
        this.dom.planEmptyState.style.display = 'block';
        this.dom.planEmptyState.innerHTML = `
          <div class="plan-empty-icon">
            <i data-lucide="calendar-plus"></i>
          </div>
          <h3>Bạn chưa có kế hoạch chuyến đi nào</h3>
          <p>Bắt đầu hành trình mới bằng cách bấm tạo chuyến đi và lên lịch trình!</p>
          <div class="plan-empty-actions">
            <button type="button" class="btn btn-primary" id="btnEmptyCreateTrip">
              <i data-lucide="plus-circle"></i> Tạo Kế Hoạch Chuyến Đi Mới
            </button>
          </div>
        `;
        document.getElementById('btnEmptyCreateTrip')?.addEventListener('click', () => {
          appController.openCreateTripModal();
        });
      }
      this.refreshIcons();
      return;
    }

    const items = Array.isArray(plan.items) ? plan.items : [];
    const total = items.length;
    const completedCount = items.filter(i => i.isCompleted).length;

    if (this.dom.planHeroTitle) {
      this.dom.planHeroTitle.textContent = (plan.title || 'KẾ HOẠCH ĐI CHƠI CỦA BẠN').toUpperCase();
    }

    const currentCount = String(Array.isArray(userPlans) ? userPlans.length : 0);
    if (this.dom.savedTripsCount) this.dom.savedTripsCount.textContent = currentCount;
    if (this.dom.savedTripsCountFull) this.dom.savedTripsCountFull.textContent = currentCount;

    // Cập nhật thống kê
    if (this.dom.statPlanStops) {
      this.dom.statPlanStops.textContent = `${total} địa điểm`;
    }
    if (this.dom.statPlanProgress) {
      this.dom.statPlanProgress.textContent = `${completedCount}/${total} đã ghé`;
    }
    if (this.dom.statPlanDuration) {
      this.dom.statPlanDuration.textContent = plan.tripType || (plan.totalDays ? `${plan.totalDays} ngày` : '1 ngày');
    }

    // Dự toán chi phí tự động từ các loại chi phí DB
    let minCost = 0;
    let maxCost = 0;
    let hasCost = false;
    items.forEach(it => {
      const p = it.priceRange || '';
      if (p === '0Đ' || p === '0đ') {
        // Miễn phí: không tính thêm chi phí
      }
      else if (p === '<100K') { minCost += 30; maxCost += 80; hasCost = true; }
      else if (p === '100K-200K') { minCost += 100; maxCost += 200; hasCost = true; }
      else if (p === '200K-300K') { minCost += 200; maxCost += 300; hasCost = true; }
      else if (p === '>300K') { minCost += 300; maxCost += 450; hasCost = true; }
    });
    if (this.dom.statPlanBudget) {
      this.dom.statPlanBudget.textContent = hasCost ? `~${minCost}K - ${maxCost}K / người` : '0đ';
    }

    // Render Day Filter Tabs Bar
    if (this.dom.planDaysTabs) {
      const totalDays = Math.max(1, parseInt(plan.totalDays, 10) || 1);
      let tabsHtml = `
        <button type="button" class="plan-day-tab ${activeDayFilter === 'all' ? 'active' : ''}" data-day="all">
          <i data-lucide="layers"></i>
          <span>Tất cả các ngày</span>
          <span class="day-count-badge">${total}</span>
        </button>
      `;

      for (let d = 1; d <= totalDays; d++) {
        const dayCount = items.filter(it => (parseInt(it.day, 10) || 1) === d).length;
        const dateStr = this.getDateForDay(plan.startDate, d);
        tabsHtml += `
          <button type="button" class="plan-day-tab ${activeDayFilter === d ? 'active' : ''}" data-day="${d}">
            <span>Ngày ${d}</span>
            ${dateStr ? `<small class="day-tab-date">(${dateStr})</small>` : ''}
            <span class="day-count-badge">${dayCount}</span>
          </button>
        `;
      }
      this.dom.planDaysTabs.innerHTML = tabsHtml;

      this.dom.planDaysTabs.querySelectorAll('.plan-day-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          const rawDay = btn.getAttribute('data-day');
          const dayVal = rawDay === 'all' ? 'all' : parseInt(rawDay, 10);
          if (onSelectDayFilter) onSelectDayFilter(dayVal);
        });
      });
    }

    if (total === 0) {
      this.dom.planTimelineList.style.display = 'none';
      if (this.dom.planEmptyState) {
        this.dom.planEmptyState.style.display = 'block';
        this.dom.planEmptyState.innerHTML = `
          <div class="plan-empty-icon">
            <i data-lucide="calendar-x"></i>
          </div>
          <h3>Chưa có địa điểm nào trong kế hoạch</h3>
          <p>Hãy thêm quán từ danh sách gợi ý bên phải hoặc bấm chọn từ kho quán để lên lịch trình ngay!</p>
          <div class="plan-empty-actions">
            <button type="button" class="btn btn-primary" id="btnEmptyPickPlace">
              <i data-lucide="plus-circle"></i> Chọn Quán Có Sẵn
            </button>
            <button type="button" class="btn btn-secondary" id="btnEmptyAddCustom">
              <i data-lucide="map-pin"></i> Thêm Điểm Tự Do
            </button>
          </div>
        `;
        document.getElementById('btnEmptyPickPlace')?.addEventListener('click', () => appController.openPlanPickPlaceModal());
        document.getElementById('btnEmptyAddCustom')?.addEventListener('click', () => appController.openPlanAddCustomModal());
      }
      this.refreshIcons();
      return;
    }

    this.dom.planTimelineList.style.display = 'block';
    if (this.dom.planEmptyState) this.dom.planEmptyState.style.display = 'none';

    // Lọc và sắp xếp các chặng hiển thị
    let displayItems = [...items];
    if (activeDayFilter !== 'all') {
      displayItems = items.filter(it => (parseInt(it.day, 10) || 1) === activeDayFilter);
    } else {
      displayItems.sort((a, b) => (parseInt(a.day, 10) || 1) - (parseInt(b.day, 10) || 1));
    }

    if (displayItems.length === 0) {
      this.dom.planTimelineList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: var(--bg-surface); border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-xl); margin: 20px 0;">
          <i data-lucide="calendar-plus" style="width: 38px; height: 38px; color: var(--primary); margin-bottom: 8px;"></i>
          <h4 style="font-size: 1rem; color: var(--secondary); margin-bottom: 6px;">Chưa có địa điểm nào trong Ngày ${activeDayFilter}</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Hãy bấm chọn quán bên phải hoặc "Thêm Điểm Tự Do" để xếp lịch cho ngày này!</p>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    // Hiển thị danh sách chặng
    let html = '';
    let lastRenderedDay = null;

    displayItems.forEach((item, index) => {
      const isDone = !!item.isCompleted;
      const itemDay = parseInt(item.day, 10) || 1;

      // Divider ngày khi đang xem Tất cả
      if (activeDayFilter === 'all' && itemDay !== lastRenderedDay) {
        lastRenderedDay = itemDay;
        const dateStr = this.getDateForDay(plan.startDate, itemDay);
        html += `
          <div class="timeline-day-divider">
            <div class="day-divider-pill">
              <i data-lucide="calendar"></i>
              <span>NGÀY ${itemDay}</span>
              ${dateStr ? `<small class="day-divider-date">(${dateStr})</small>` : ''}
            </div>
          </div>
        `;
      }
      
      // Tự động xác định Buổi từ giờ đã chọn
      const computedPeriod = this.inferPeriodFromTime(item.time) || item.period || 'Chặng';

      // Link Google Maps
      const mapsQuery = encodeURIComponent(`${item.placeName || item.title || ''} ${item.address || ''}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

      html += `
        <div class="timeline-stop-item ${isDone ? 'completed' : ''}" data-stop-id="${item.id}">
          <!-- Left Time Node -->
          <div class="timeline-time-node">
            <div class="timeline-marker-circle" title="Chặng ${index + 1}">
              ${isDone ? '<i data-lucide="check"></i>' : (index + 1)}
            </div>
            <span class="timeline-period-badge">${this.escapeHTML(computedPeriod)}</span>
          </div>

          <!-- Right Place Card (Không hiển thị ảnh) -->
          <div class="timeline-place-card">
            <div class="card-top-header">
              <div class="card-main-meta">
                <div class="card-time-row">
                  <div class="card-header-tags">
                    <span class="card-time-tag">
                      <i data-lucide="clock"></i> ${this.escapeHTML(item.time || 'Linh hoạt')}
                    </span>
                  </div>
                  ${isDone ? `
                    <span class="card-status-badge done">
                      <i data-lucide="check-circle-2"></i> Đã ghé
                    </span>
                  ` : ''}
                </div>

                <h4 class="card-place-title">${this.escapeHTML(item.placeName || item.title)}</h4>

                <div class="card-info-pills">
                  ${item.address ? `
                    <span class="card-info-pill" title="${this.escapeHTML(item.address)}">
                      <i data-lucide="map-pin"></i> ${this.escapeHTML(item.address)}
                    </span>
                  ` : ''}
                  ${item.priceRange ? `
                    <span class="card-info-pill" title="Mức giá">
                      <i data-lucide="banknote"></i> ${this.escapeHTML(item.priceRange)}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Khối hiển thị riêng: Món nên thử (1 hàng ngang) -->
            ${item.recommendedDish ? `
              <div class="card-detail-section dish-section">
                <i data-lucide="sparkles" class="detail-icon"></i>
                <div class="detail-inline-text">
                  <strong class="detail-inline-label">Món nên thử:</strong>
                  <span class="detail-inline-value">${this.escapeHTML(item.recommendedDish)}</span>
                </div>
              </div>
            ` : ''}

            <!-- Khối hiển thị riêng: Ghi chú (1 hàng ngang) -->
            ${(item.note && !item.note.startsWith('Gợi ý bởi')) ? `
              <div class="card-detail-section note-section">
                <i data-lucide="sticky-note" class="detail-icon"></i>
                <div class="detail-inline-text">
                  <strong class="detail-inline-label">Ghi chú:</strong>
                  <span class="detail-inline-value">${this.escapeHTML(item.note)}</span>
                </div>
              </div>
            ` : ''}

            <!-- Khối hiển thị riêng: Đánh giá của bạn khi đã ghé quán -->
            ${(isDone && item.review && String(activeReviewStopId) !== String(item.id)) ? `
              <div class="card-detail-section review-section">
                <i data-lucide="message-square" class="detail-icon"></i>
                <div class="detail-inline-text">
                  <strong class="detail-inline-label">Đánh giá:</strong>
                  <span class="detail-inline-value">${this.escapeHTML(item.review)}</span>
                </div>
                <button type="button" class="btn-review-edit" data-action="edit-review" data-id="${item.id}" title="Sửa đánh giá">
                  <i data-lucide="edit-3"></i>
                </button>
              </div>
            ` : ''}

            <!-- Hộp nhập đánh giá (textbox và button OK chung 1 dòng) -->
            ${(String(activeReviewStopId) === String(item.id)) ? `
              <div class="timeline-review-input-row" data-review-stop="${item.id}">
                <input type="text" class="timeline-review-input" data-id="${item.id}" placeholder="Nhập cảm nhận, đánh giá về quán..." value="${this.escapeHTML(item.review || '')}" maxlength="300" autocomplete="off" />
                <button type="button" class="btn-review-ok" data-action="submit-review" data-id="${item.id}">
                  OK
                </button>
              </div>
            ` : ''}

            <div class="card-actions-footer">
              <button type="button" class="btn-complete-toggle ${isDone ? 'checked' : ''}" data-action="toggle-complete" data-id="${item.id}">
                <i data-lucide="${isDone ? 'check-square' : 'square'}"></i>
                <span>${isDone ? 'Đã ghé quán' : 'Đánh dấu đã ghé'}</span>
              </button>

              <div class="card-action-btns-right">
                <button type="button" class="btn-card-action btn-edit-action" data-action="edit-stop" data-id="${item.id}" title="Chỉnh sửa chặng này">
                  <i data-lucide="edit-3"></i>
                </button>
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-action" title="Chỉ đường trên Google Maps">
                  <i data-lucide="navigation"></i>
                </a>
                <button type="button" class="btn-card-action btn-del-action" data-action="delete-stop" data-id="${item.id}" title="Xóa khỏi lịch trình">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    this.dom.planTimelineList.innerHTML = html;

    // Gắn sự kiện các nút trong timeline card
    this.dom.planTimelineList.querySelectorAll('[data-action="toggle-complete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        onToggleComplete(id);
      });
    });

    // Sự kiện nút OK lưu đánh giá
    this.dom.planTimelineList.querySelectorAll('[data-action="submit-review"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const input = this.dom.planTimelineList.querySelector(`.timeline-review-input[data-id="${id}"]`);
        const text = input ? input.value : '';
        if (onSaveReview) onSaveReview(id, text);
      });
    });

    // Sự kiện nhấn Enter / Escape trong ô đánh giá
    this.dom.planTimelineList.querySelectorAll('.timeline-review-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const id = input.getAttribute('data-id');
          if (onSaveReview) onSaveReview(id, input.value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          const id = input.getAttribute('data-id');
          if (onCancelReview) onCancelReview(id);
        }
      });
    });

    // Sự kiện nút chỉnh sửa đánh giá
    this.dom.planTimelineList.querySelectorAll('[data-action="edit-review"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (onEditReview) onEditReview(id);
      });
    });

    this.dom.planTimelineList.querySelectorAll('[data-action="edit-stop"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (onEditStop) onEditStop(id);
      });
    });

    this.dom.planTimelineList.querySelectorAll('[data-action="delete-stop"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        onDeleteStop(id);
      });
    });

    this.refreshIcons();

    // Tự động focus vào ô đánh giá khi vừa xuất hiện
    if (activeReviewStopId) {
      const activeInput = this.dom.planTimelineList.querySelector(`.timeline-review-input[data-id="${activeReviewStopId}"]`);
      if (activeInput) {
        activeInput.focus();
        activeInput.select();
      }
    }
  },

  renderSavedTrips(userPlans, activePlanId, onSwitch, onToggleStatus, onDelete, onEdit) {
    if (!this.dom.savedTripsList) return;
    if (!userPlans || userPlans.length === 0) {
      this.dom.savedTripsList.innerHTML = `
        <div style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
          <i data-lucide="folder-open" style="width: 36px; height: 36px; margin-bottom: 10px; color: #94a3b8;"></i>
          <p>Chưa có kế hoạch nào được lưu. Bấm nút bên dưới để tạo chuyến đi đầu tiên!</p>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    const formatVNDate = (dStr) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dStr;
    };

    let html = '';
    userPlans.forEach(p => {
      const isActive = String(p.id) === String(activePlanId);
      const isCompleted = p.status === 'completed';
      const stopCount = p.items ? p.items.length : 0;
      const completedStops = p.items ? p.items.filter(i => i.isCompleted).length : 0;
      const progressPercent = stopCount > 0 ? Math.round((completedStops / stopCount) * 100) : 0;
      const durationText = p.tripType || (p.totalDays ? `${p.totalDays} ngày` : '2N1Đ');

      let dateText = 'Chưa đặt ngày';
      if (p.startDate && p.endDate) {
        if (p.startDate === p.endDate) {
          dateText = `${formatVNDate(p.startDate)} (${durationText})`;
        } else {
          dateText = `${formatVNDate(p.startDate)} – ${formatVNDate(p.endDate)} (${durationText})`;
        }
      } else if (p.startDate) {
        dateText = `Khởi hành: ${formatVNDate(p.startDate)} (${durationText})`;
      } else if (durationText) {
        dateText = `Thời lượng: ${durationText}`;
      }

      html += `
        <div class="saved-trip-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-trip-id="${p.id}">
          <div class="saved-trip-header">
            <div class="saved-trip-icon-wrap" title="${isCompleted ? 'Chuyến đi hoàn thành' : 'Kế hoạch chuyến đi'}">
              <i data-lucide="${isCompleted ? 'award' : (isActive ? 'compass' : 'map-pin')}"></i>
            </div>
            <div class="saved-trip-title-group">
              <div class="saved-trip-title-row">
                <div class="saved-trip-title-left">
                  <h4 class="saved-trip-title">${this.escapeHTML(p.title)}</h4>
                  <span class="trip-status-pill ${isCompleted ? 'pill-completed' : 'pill-active'}">
                    <i data-lucide="${isCompleted ? 'check-circle-2' : 'clock-3'}"></i>
                    ${isCompleted ? 'Đã hoàn thành' : 'Đang lên kế hoạch'}
                  </span>
                </div>
                ${isActive ? `
                  <span class="trip-status-pill pill-current">
                    <span class="pulse-dot"></span> Đang xem
                  </span>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="saved-trip-details">
            <div class="trip-detail-item" title="Thời gian chuyến đi">
              <i data-lucide="calendar"></i>
              <span class="trip-detail-label">${dateText}</span>
            </div>
            <div class="trip-detail-item" title="Tiến độ ghé các điểm">
              <i data-lucide="map-pinned"></i>
              <span class="trip-detail-label"><strong>${completedStops}/${stopCount}</strong> địa điểm ${stopCount > 0 ? `(${progressPercent}%)` : ''}</span>
            </div>
          </div>

          <div class="saved-trip-actions">
            <div class="saved-trip-btns-left">
              ${!isActive ? `
                <button type="button" class="btn btn-sm btn-primary-soft" data-action="switch-trip" data-id="${p.id}">
                  <i data-lucide="arrow-right-circle"></i> Xem & Lên Lịch
                </button>
              ` : ''}
              ${!isCompleted ? `
                <button type="button" class="btn btn-sm btn-secondary-soft" data-action="toggle-status" data-id="${p.id}">
                  <i data-lucide="check"></i> Đánh dấu đã đi
                </button>
              ` : ''}
            </div>

            <div class="saved-trip-btns-right">
              <button type="button" class="btn-trip-edit" data-action="edit-trip" data-id="${p.id}" title="Chỉnh sửa thông tin chuyến đi">
                <i data-lucide="edit-3"></i>
              </button>
              <button type="button" class="btn-trip-delete" data-action="delete-trip" data-id="${p.id}" title="Xóa chuyến đi này">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    this.dom.savedTripsList.innerHTML = html;

    this.dom.savedTripsList.querySelectorAll('[data-action="switch-trip"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (onSwitch) onSwitch(id);
      });
    });

    this.dom.savedTripsList.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (onToggleStatus) onToggleStatus(id);
      });
    });

    this.dom.savedTripsList.querySelectorAll('[data-action="edit-trip"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (onEdit) onEdit(id);
      });
    });

    this.dom.savedTripsList.querySelectorAll('[data-action="delete-trip"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (onDelete) onDelete(id);
      });
    });

    this.refreshIcons();
  },

  renderPlanSidebarPlaces(places, onQuickAdd) {
    if (!this.dom.sidebarPlacesList) return;
    if (!places || places.length === 0) {
      this.dom.sidebarPlacesList.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.8rem;">
          Không tìm thấy quán phù hợp
        </div>
      `;
      return;
    }

    let html = '';
    places.slice(0, 15).forEach(p => {
      const thumb = (p.image && p.image.trim()) || this.getFallbackImage(p);
      const catLabel = p.category === 'cafe' ? 'Cafe' : 'Quán ăn';
      html += `
        <div class="sidebar-place-item">
          <img src="${this.escapeHTML(thumb)}" alt="${this.escapeHTML(p.name)}" class="sidebar-item-thumb" loading="lazy">
          <div class="sidebar-item-info">
            <div class="sidebar-item-name" title="${this.escapeHTML(p.name)}">${this.escapeHTML(p.name)}</div>
            <div class="sidebar-item-sub">${catLabel} • ${this.escapeHTML(p.city || 'Toàn quốc')}</div>
          </div>
          <button type="button" class="btn-sidebar-add" data-place-id="${p.id}" title="Thêm vào kế hoạch đi chơi">
            + Thêm
          </button>
        </div>
      `;
    });

    this.dom.sidebarPlacesList.innerHTML = html;

    this.dom.sidebarPlacesList.querySelectorAll('.btn-sidebar-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-place-id');
        const place = places.find(p => String(p.id) === String(id));
        if (place) onQuickAdd(place);
      });
    });
  },

  renderModalPickPlaces(places, onSelectPlace) {
    if (!this.dom.modalPlacesPickerGrid) return;
    if (!places || places.length === 0) {
      this.dom.modalPlacesPickerGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 36px; color: var(--text-muted);">
          Không có quán nào phù hợp với bộ lọc tìm kiếm
        </div>
      `;
      return;
    }

    let html = '';
    places.forEach(p => {
      const thumb = (p.image && p.image.trim()) || this.getFallbackImage(p);
      const catLabel = p.category === 'cafe' ? '☕ Quán Cafe' : '🍜 Quán Ăn';
      html += `
        <div class="picker-place-card" data-place-id="${p.id}">
          <img src="${this.escapeHTML(thumb)}" alt="${this.escapeHTML(p.name)}" class="picker-place-img" loading="lazy">
          <div class="picker-place-body">
            <h4 class="picker-place-name">${this.escapeHTML(p.name)}</h4>
            <div class="picker-place-addr">${this.escapeHTML(p.address || p.city || '')}</div>
            <div class="picker-place-footer">
              <span>${catLabel}</span>
              <span>+ Chọn quán</span>
            </div>
          </div>
        </div>
      `;
    });

    this.dom.modalPlacesPickerGrid.innerHTML = html;

    this.dom.modalPlacesPickerGrid.querySelectorAll('.picker-place-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-place-id');
        const place = places.find(p => String(p.id) === String(id));
        if (place) onSelectPlace(place);
      });
    });
  }
};
