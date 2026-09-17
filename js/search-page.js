(function () {
    var ENDPOINTS = {
        hospital: '/api/search/hospitals',
        doctor: '/api/search/doctors',
        disease: '/api/search/diseases',
        article: '/api/search/articles'
    };

    function emptyPageState() {
        return { pageNum: 1, pageSize: 10, pages: 0, total: 0 };
    }

    new Vue({
        el: '#app',
        data: {
            keyword: '',
            searchInput: '',
            activeTab: 'hospital',
            tabs: [
                { key: 'hospital', name: '医院' },
                { key: 'doctor', name: '医生' },
                { key: 'disease', name: '疾病' },
                { key: 'article', name: '健康科普' }
            ],
            hospitals: [],
            doctors: [],
            diseases: [],
            articles: [],
            pageState: {
                hospital: emptyPageState(),
                doctor: emptyPageState(),
                disease: emptyPageState(),
                article: emptyPageState()
            },
            pageSize: 10,
            hotKeywords: [],
            suggestions: [],
            suggestionOpen: false,
            activeSuggestion: -1,
            suggestionTimer: null,
            suggestionRequest: 0,
            searchRequest: 0,
            loading: false,
            errorMessage: ''
        },
        computed: {
            hasSearched: function () {
                return !!this.keyword;
            },
            allTotal: function () {
                var state = this.pageState;
                return state.hospital.total + state.doctor.total + state.disease.total + state.article.total;
            },
            activeItems: function () {
                if (this.activeTab === 'hospital') return this.hospitals;
                if (this.activeTab === 'doctor') return this.doctors;
                if (this.activeTab === 'disease') return this.diseases;
                return this.articles;
            },
            activePageState: function () {
                return this.pageState[this.activeTab];
            },
            visiblePages: function () {
                var current = this.activePageState.pageNum;
                var total = this.activePageState.pages;
                var start = Math.max(1, Math.min(current - 2, total - 4));
                var end = Math.min(total, start + 4);
                var pages = [];
                for (var page = start; page <= end; page++) pages.push(page);
                return pages;
            }
        },
        methods: {
            submitSearch: function () {
                this.runSearch(this.searchInput, this.activeTab);
            },
            runSearch: function (value, preferredType) {
                var nextKeyword = (value || '').trim();
                if (!nextKeyword) {
                    this.$refs.searchInput.focus();
                    return;
                }
                this.keyword = nextKeyword;
                this.searchInput = nextKeyword;
                if (ENDPOINTS[preferredType]) this.activeTab = preferredType;
                this.suggestionOpen = false;
                this.resetPages();
                this.updateUrl();
                this.loadOverview();
                this.recordHistory(nextKeyword);
            },
            loadOverview: function () {
                var vm = this;
                if (!this.keyword) return;
                var requestId = ++this.searchRequest;
                this.loading = true;
                this.errorMessage = '';
                http.get('/api/search/all', { keyword: this.keyword, pageNum: 1, pageSize: this.pageSize })
                    .then(function (data) {
                        if (requestId !== vm.searchRequest) return;
                        vm.applyPage('hospital', data && data.hospitals);
                        vm.applyPage('doctor', data && data.doctors);
                        vm.applyPage('disease', data && data.diseases);
                        vm.applyPage('article', data && data.articles);
                    })
                    .catch(function (err) {
                        if (requestId === vm.searchRequest) vm.errorMessage = err.message || '搜索服务暂不可用，请稍后重试。';
                    })
                    .then(function () {
                        if (requestId === vm.searchRequest) vm.loading = false;
                    });
            },
            loadCategory: function (type, pageNum) {
                var vm = this;
                if (!ENDPOINTS[type]) return;
                var requestId = ++this.searchRequest;
                this.loading = true;
                this.errorMessage = '';
                http.get(ENDPOINTS[type], { keyword: this.keyword, pageNum: pageNum, pageSize: this.pageSize, track: false })
                    .then(function (page) {
                        if (requestId === vm.searchRequest) vm.applyPage(type, page);
                    })
                    .catch(function (err) {
                        if (requestId === vm.searchRequest) vm.errorMessage = err.message || '搜索服务暂不可用，请稍后重试。';
                    })
                    .then(function () {
                        if (requestId === vm.searchRequest) vm.loading = false;
                    });
            },
            applyPage: function (type, page) {
                var data = page || {};
                this[type + 's'] = data.list || [];
                this.$set(this.pageState, type, {
                    pageNum: Number(data.pageNum) || 1,
                    pageSize: Number(data.pageSize) || this.pageSize,
                    pages: Number(data.pages) || 0,
                    total: Number(data.total) || 0
                });
            },
            resetPages: function () {
                this.hospitals = [];
                this.doctors = [];
                this.diseases = [];
                this.articles = [];
                this.pageState.hospital = emptyPageState();
                this.pageState.doctor = emptyPageState();
                this.pageState.disease = emptyPageState();
                this.pageState.article = emptyPageState();
            },
            switchTab: function (type) {
                this.activeTab = type;
                this.updateUrl(true);
            },
            changePage: function (page) {
                if (page < 1 || page > this.activePageState.pages || page === this.activePageState.pageNum) return;
                this.loadCategory(this.activeTab, page);
                window.scrollTo({ top: 250, behavior: 'smooth' });
            },
            loadHotKeywords: function () {
                var vm = this;
                http.get('/api/search/hot', { limit: 8 }).then(function (items) {
                    vm.hotKeywords = items || [];
                }).catch(function () { vm.hotKeywords = []; });
            },
            searchHot: function (keyword) {
                this.runSearch(keyword, this.activeTab);
            },
            handleSuggestionInput: function () {
                var vm = this;
                window.clearTimeout(this.suggestionTimer);
                this.activeSuggestion = -1;
                this.suggestionOpen = true;
                if (!this.searchInput.trim()) {
                    this.suggestions = [];
                    return;
                }
                this.suggestionTimer = window.setTimeout(function () { vm.fetchSuggestions(); }, 220);
            },
            fetchSuggestions: function () {
                var vm = this;
                var value = this.searchInput.trim();
                if (!value) return;
                var requestId = ++this.suggestionRequest;
                http.get('/api/search/suggestions', { keyword: value, limit: 8 })
                    .then(function (items) {
                        if (requestId === vm.suggestionRequest) vm.suggestions = items || [];
                    })
                    .catch(function () {
                        if (requestId === vm.suggestionRequest) vm.suggestions = [];
                    });
            },
            moveSuggestion: function (step) {
                if (!this.suggestions.length) return;
                this.suggestionOpen = true;
                this.activeSuggestion = (this.activeSuggestion + step + this.suggestions.length) % this.suggestions.length;
            },
            handleSuggestionEnter: function () {
                if (this.activeSuggestion >= 0 && this.suggestions[this.activeSuggestion]) {
                    this.selectSuggestion(this.suggestions[this.activeSuggestion]);
                } else {
                    this.submitSearch();
                }
            },
            selectSuggestion: function (item) {
                this.runSearch(item.keyword, item.type === 'all' ? this.activeTab : item.type);
            },
            closeSuggestionPanel: function () {
                var vm = this;
                window.setTimeout(function () { vm.suggestionOpen = false; }, 120);
            },
            recordHistory: function (keyword) {
                if (window.Auth && Auth.isLogin()) {
                    http.post('/api/search/history?keyword=' + encodeURIComponent(keyword)).catch(function () {});
                }
            },
            updateUrl: function (replace) {
                var params = new URLSearchParams();
                if (this.keyword) params.set('keyword', this.keyword);
                if (this.activeTab !== 'hospital') params.set('type', this.activeTab);
                var url = 'search.html' + (params.toString() ? '?' + params.toString() : '');
                window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
            },
            goToDetail: function (type, id) {
                var urls = {
                    hospital: 'hospital-detail.html?hospitalId=',
                    doctor: 'doctor-detail.html?id=',
                    disease: 'disease-detail.html?id=',
                    article: 'article-detail.html?id='
                };
                window.location.href = urls[type] + encodeURIComponent(id);
            },
            formatDate: function (value) {
                return value ? String(value).replace('T', ' ').slice(0, 16) : '';
            }
        },
        mounted: function () {
            var params = new URLSearchParams(window.location.search);
            this.keyword = (params.get('keyword') || '').trim();
            this.searchInput = this.keyword;
            var type = params.get('type');
            if (ENDPOINTS[type]) this.activeTab = type;
            this.loadHotKeywords();
            if (this.keyword) this.loadOverview();
        }
    });
}());
