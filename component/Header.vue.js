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
                    <input type="text" v-model="searchText" placeholder="搜索医院、医生、疾病..." @keyup.enter="handleSearch">
                    <button @click="handleSearch">搜索</button>
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
            isLoggedIn: false,
            userPhone: '',
            userAvatar: 'img/default-avatar.png'
        };
    },
    mounted() {
        // 检查登录状态（统一走 Auth）
        if (window.Auth && Auth.isLogin()) {
            const user = Auth.user() || {};
            this.isLoggedIn = true;
            this.userPhone = this.formatPhone(user.phone) || user.username || '用户';
            this.userAvatar = user.avatar || 'img/default-avatar.png';
        }
    },
    methods: {
        formatPhone(phone) {
            if (!phone) return '';
            return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
        },
        handleSearch() {
            if (this.searchText.trim()) {
                window.location.href = 'search-hospital.html?keyword=' + encodeURIComponent(this.searchText);
            }
        },
        handleLogout() {
            const done = () => { window.location.href = 'index.html'; };
            if (window.Auth) {
                Auth.logout().then(done, done);
            } else {
                done();
            }
        }
    }
});