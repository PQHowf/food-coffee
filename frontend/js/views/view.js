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
      tabFood: document.getElementById('tabFood'),
      tabCafe: document.getElementById('tabCafe'),
      tabAdd: document.getElementById('tabAdd'),
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
      accAvatarLarge: document.getElementById('accAvatarLarge'),
      accNameDisplay: document.getElementById('accNameDisplay'),
      accRoleDisplay: document.getElementById('accRoleDisplay'),
      accPlacesCount: document.getElementById('accPlacesCount'),
      accFavsCount: document.getElementById('accFavsCount'),
      accountUpdateForm: document.getElementById('accountUpdateForm'),
      accEditName: document.getElementById('accEditName'),
      accEditRole: document.getElementById('accEditRole'),
      btnSaveAccount: document.getElementById('btnSaveAccount'),
      btnModalLogout: document.getElementById('btnModalLogout'),
      accTabProfile: document.getElementById('accTabProfile'),
      accTabMyPlaces: document.getElementById('accTabMyPlaces'),
      accPlacesCountTab: document.getElementById('accPlacesCountTab'),
      accountMyPlacesSection: document.getElementById('accountMyPlacesSection'),
      accountMyPlacesList: document.getElementById('accountMyPlacesList'),

      // Edit Place Modal
      editPlaceModal: document.getElementById('editPlaceModal'),
      editPlaceModalClose: document.getElementById('editPlaceModalClose'),
      editPlaceForm: document.getElementById('editPlaceForm'),
      editPlaceId: document.getElementById('editPlaceId'),
      editCategoryFood: document.getElementById('editCategoryFood'),
      editCategoryCafe: document.getElementById('editCategoryCafe'),
      editPlaceName: document.getElementById('editPlaceName'),
      editPlaceCity: document.getElementById('editPlaceCity'),
      editPlaceAddress: document.getElementById('editPlaceAddress'),
      editPlaceDish: document.getElementById('editPlaceDish'),
      editPlaceImage: document.getElementById('editPlaceImage'),
      btnCancelEditPlace: document.getElementById('btnCancelEditPlace'),
      btnSaveEditPlace: document.getElementById('btnSaveEditPlace'),

      // Random Mystery Modal
      randomModal: document.getElementById('randomModal'),
      randomModalClose: document.getElementById('randomModalClose'),
      randomModalTitle: document.getElementById('randomModalTitle'),
      randomModalSubtitle: document.getElementById('randomModalSubtitle'),
      randomWheelBox: document.getElementById('randomWheelBox'),
      slotPreview: document.getElementById('slotPreview'),
      winnerCard: document.getElementById('winnerCard'),
      winnerImage: document.getElementById('winnerImage'),
      winnerCategory: document.getElementById('winnerCategory'),
      winnerName: document.getElementById('winnerName'),
      winnerAddress: document.getElementById('winnerAddress'),
      winnerPrice: document.getElementById('winnerPrice'),
      winnerDish: document.getElementById('winnerDish'),
      winnerSuggested: document.getElementById('winnerSuggested'),
      reRollBtn: document.getElementById('reRollBtn'),
      acceptPickBtn: document.getElementById('acceptPickBtn'),

      toastContainer: document.getElementById('toastContainer')
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

    const html = places.map(place => {
      const isFav = favorites.includes(place.id);
      const catBadgeClass = place.category === 'food' ? 'badge-food' : 'badge-cafe';
      const catLabel = place.category === 'food' ? 'QUÁN ĂN' : 'QUÁN CAFE';
      const catIcon = place.category === 'food' ? 'utensils' : 'coffee';
      const initials = this.getInitials(place.suggestedBy);
      const imgSrc = place.image || (place.category === 'food'
        ? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80');

      return `
        <article class="place-card" id="card-${place.id}">
          <div class="card-image-wrap">
            <img 
              src="${this.escapeHTML(imgSrc)}" 
              alt="${this.escapeHTML(place.name)}" 
              class="card-image"
              loading="lazy"
            >
            <span class="card-category-badge ${catBadgeClass}">
              <i data-lucide="${catIcon}"></i> ${catLabel}
            </span>
          </div>

          <div class="card-body">
            <div class="card-title-row">
              <h3 class="card-title">${this.escapeHTML(place.name)}</h3>
            </div>

            <div class="card-info-item address">
              <i data-lucide="map-pin"></i>
              <span>${this.escapeHTML(place.address)}</span>
            </div>

            ${place.recommendedDish ? `
              <div class="card-highlight-dish">
                <strong>Món nên thử:</strong> ${this.escapeHTML(place.recommendedDish)}
              </div>
            ` : ''}

            <div class="card-footer">
              <div class="suggested-by-badge" title="Người đã đề xuất địa điểm này">
                <div class="suggested-avatar">${initials}</div>
                <div class="suggested-text">
                  <span class="suggested-label">Gợi ý từ:</span>
                  <strong class="suggested-name">${this.escapeHTML(place.suggestedBy || 'Ẩn danh')}</strong>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    this.dom.placesGrid.innerHTML = html;
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
            <img src="${this.escapeHTML(imgSrc)}" alt="${this.escapeHTML(p.name)}" class="my-place-thumb">
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
      this.dom.authSection.innerHTML = `
        <div class="user-profile-badge" id="btnHeaderAccountBadge" title="Xem & quản lý thông tin tài khoản">
          <div class="user-avatar-circle">${initials}</div>
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
  }
};
