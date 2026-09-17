// Vue2 Header组件
Vue.component('header-component', {
    template: `
        <div class="header">
            <div class="header-content">
                <div class="logo">
                    <span>东软在线医疗云医院</span>
                </div>
                <div class="nav">
                    <a href="index.html" :class="{active: activeNav === 'home'}">首页</a>
                    <a href="hospital.html" :class="{active: activeNav === 'hospital'}">找医院</a>
                    <a href="doctor.html" :class="{active: activeNav === 'doctor'}">找医生</a>
                    <a href="disease.html" :class="{active: activeNav === 'disease'}">查疾病</a>
                    <a href="article.html" :class="{active: activeNav === 'article'}">健康科普</a>
                </div>
                <div class="search-box">
                    <input
                        type="search"
                        v-model="searchText"
                        placeholder="搜索医院、医生、疾病、科普"
                        aria-label="全站搜索"
                        autocomplete="off"
                        @input="handleInput"
                        @focus="handleFocus"
                        @blur="handleBlur"
                        @keydown.down.prevent="moveActive(1)"
                        @keydown.up.prevent="moveActive(-1)"
                        @keydown.enter.prevent="handleEnter"
                    >
                    <button type="button" @click="handleSearch">搜索</button>
                    <div v-if="panelOpen && panelItems.length" class="search-suggestion-panel" @mousedown.prevent>
                        <div class="suggestion-title">{{ searchText.trim() ? '搜索联想' : '热门搜索' }}</div>
                        <button
                            v-for="(item, index) in panelItems"
                            :key="item.type + '-' + item.keyword"
                            type="button"
                            :class="['suggestion-item', { active: activeSuggestion === index }]"
                            @click="selectSuggestion(item)"
                        >
                            <span>{{ item.keyword }}</span>
                            <span class="suggestion-type">{{ item.typeName }}</span>
                        </button>
                    </div>
                </div>
                <div class="auth">
                    <template v-if="isLoggedIn">
                        <a href="personal-info.html" class="user-info" style="display:inline-flex;align-items:center;gap:6px;">
                            <img :src="userAvatar" alt="头像" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,.6);vertical-align:middle;">
                            你好, {{ userPhone }}
                        </a>
                        <a href="javascript:;" class="logout-btn" @click="handleLogout">退出</a>
                    </template>
                    <template v-else>
                        <a href="login.html" class="login-btn">登录</a>
                        <a href="register.html" class="register-btn">注册</a>
                    </template>
                </div>
            </div>
        </div>
    `,
    props: {
        activeNav: {
            type: String,
            default: 'home'
        }
    },
    data() {
        return {
            searchText: '',
            suggestions: [],
            hotKeywords: [],
            panelOpen: false,
            activeSuggestion: -1,
            suggestionTimer: null,
            suggestionRequest: 0,
            isLoggedIn: false,
            userPhone: '',
            userAvatar: 'img/default-avatar.png'
        };
    },
    mounted() {
        const params = new URLSearchParams(window.location.search);
        if (/search(?:-[a-z]+)?\.html$/.test(window.location.pathname)) {
            this.searchText = params.get('keyword') || '';
        }
        // 检查登录状态（统一走 Auth）
        if (window.Auth && Auth.isLogin()) {
            const user = Auth.user() || {};
            this.isLoggedIn = true;
            this.userPhone = this.formatPhone(user.phone) || user.username || '用户';
            this.userAvatar = user.avatar || 'img/default-avatar.png';
        }
    },
    methods: {
        handleFocus() {
            this.panelOpen = true;
            this.activeSuggestion = -1;
            if (this.searchText.trim()) {
                this.fetchSuggestions();
            } else {
                this.loadHotKeywords();
            }
        },
        handleBlur() {
            window.setTimeout(() => { this.panelOpen = false; }, 120);
        },
        handleInput() {
            this.panelOpen = true;
            this.activeSuggestion = -1;
            window.clearTimeout(this.suggestionTimer);
            if (!this.searchText.trim()) {
                this.suggestions = [];
                this.loadHotKeywords();
                return;
            }
            this.suggestionTimer = window.setTimeout(this.fetchSuggestions, 220);
        },
        fetchSuggestions() {
            const keyword = this.searchText.trim();
            if (!keyword || !window.http) return;
            const requestId = ++this.suggestionRequest;
            http.get('/api/search/suggestions', { keyword: keyword, limit: 8 }).then((items) => {
                if (requestId === this.suggestionRequest) {
                    this.suggestions = items || [];
                }
            }).catch(() => {
                if (requestId === this.suggestionRequest) this.suggestions = [];
            });
        },
        loadHotKeywords() {
            if (this.hotKeywords.length || !window.http) return;
            http.get('/api/search/hot', { limit: 8 }).then((items) => {
                this.hotKeywords = (items || []).map((keyword) => ({ keyword: keyword, type: 'all', typeName: '热门' }));
            }).catch(() => { this.hotKeywords = []; });
        },
        moveActive(step) {
            if (!this.panelOpen || !this.panelItems.length) return;
            const size = this.panelItems.length;
            this.activeSuggestion = (this.activeSuggestion + step + size) % size;
        },
        handleEnter() {
            if (this.activeSuggestion >= 0 && this.panelItems[this.activeSuggestion]) {
                this.selectSuggestion(this.panelItems[this.activeSuggestion]);
            } else {
                this.handleSearch();
            }
        },
        selectSuggestion(item) {
            this.searchText = item.keyword;
            this.panelOpen = false;
            this.goToSearch(item.type === 'all' ? '' : item.type);
        },
        formatPhone(phone) {
            if (!phone) return '';
            return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
        },
        handleSearch() {
            if (this.searchText.trim()) {
                this.goToSearch('');
            }
        },
        goToSearch(type) {
            const query = new URLSearchParams({ keyword: this.searchText.trim() });
            if (type) query.set('type', type);
            window.location.href = 'search.html?' + query.toString();
        },
        handleLogout() {
            const done = () => { window.location.href = 'index.html'; };
            if (window.Auth) {
                Auth.logout().then(done, done);
            } else {
                done();
            }
        }
    },
    computed: {
        panelItems() {
            return this.searchText.trim() ? this.suggestions : this.hotKeywords;
        }
    }
});
