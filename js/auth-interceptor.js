// 统一后端请求层 + 登录态管理
// 依赖：需在本文件之前引入 js/axios-0.18.0.js
// 约定：后端统一响应 { code, message, data }，成功 code=200，token 失效 code=30001。

// 后端 API 基础地址
axios.defaults.baseURL = 'http://localhost:8080';
// 首次访问时后端可能需要建立数据库连接，给冷启动请求留出完整响应时间。
axios.defaults.timeout = 20000;

// ---- 请求拦截器：自动携带 token ----
axios.interceptors.request.use(
  function (config) {
    var token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token; // 与后端 hospital.jwt.header 约定一致
    }
    return config;
  },
  function (err) {
    return Promise.reject(err);
  }
);

// ---- 响应拦截器：token 失效跳登录 ----
axios.interceptors.response.use(
  function (response) {
    // 30000=未登录，30001=token 非法/过期，均跳登录
    if (response.data && (response.data.code === 30001 || response.data.code === 30000)) {
      // 清理失效登录态
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      var currentUrl = encodeURIComponent(window.location.href);
      // 避免在登录页重复跳转
      if (!/login\.html/.test(window.location.pathname)) {
        window.location.href = 'login.html?redirect=' + currentUrl;
      }
    }
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// ---- 统一响应解包：成功返回 data，失败抛出带 message/code 的错误 ----
function __unwrap(res) {
  var d = res && res.data;
  if (d && d.code === 200) {
    return d.data;
  }
  var err = new Error((d && d.message) || '请求失败');
  err.code = d ? d.code : -1;
  throw err;
}

// 全局 HTTP 助手：返回 Promise<data>（已解包）
window.http = {
  get: function (url, params) {
    return axios.get(url, { params: params || {} }).then(__unwrap);
  },
  post: function (url, data, config) {
    return axios.post(url, data, config || {}).then(__unwrap);
  },
  put: function (url, data, config) {
    return axios.put(url, data, config || {}).then(__unwrap);
  },
  del: function (url, params) {
    return axios.delete(url, { params: params || {} }).then(__unwrap);
  }
};

// 全局登录态管理
window.Auth = {
  token: function () {
    return localStorage.getItem('token');
  },
  user: function () {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch (e) {
      return null;
    }
  },
  isLogin: function () {
    return !!this.token();
  },
  setLogin: function (loginVo) {
    if (loginVo && loginVo.token) {
      localStorage.setItem('token', loginVo.token);
    }
    localStorage.setItem('userInfo', JSON.stringify((loginVo && loginVo.user) || {}));
  },
  updateUser: function (user) {
    localStorage.setItem('userInfo', JSON.stringify(user || {}));
  },
  logout: function () {
    var hadToken = !!this.token();
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    if (hadToken) {
      return axios.post('/api/auth/logout').catch(function () {});
    }
    return Promise.resolve();
  },
  // 需要登录才能访问的页面调用：未登录则跳转登录页，返回 false
  requireLogin: function () {
    if (!this.isLogin()) {
      var currentUrl = encodeURIComponent(window.location.href);
      window.location.href = 'login.html?redirect=' + currentUrl;
      return false;
    }
    return true;
  }
};
