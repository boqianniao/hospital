 // 配置后端 API 基础地址
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.timeout = 10000;

// http request 拦截器
axios.interceptors.request.use(
  config => {
    if (null != localStorage.getItem("token")) { //判断token是否存在
		config.headers.token = localStorage.getItem("token");  //将token设置成请求头
    }
	console.log(config);
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);

// http response 拦截器
axios.interceptors.response.use(
  response => {
    if (response.data.code === 30001) {
      console.log("非法token或已过期");
	  // 获取当前页面URL，用于登录成功后跳转回来
	  const currentUrl = encodeURIComponent(window.location.href);
	  // 跳转到登录页面
	  window.location.href = 'login.html?redirect=' + currentUrl;
    }
	console.log(response);
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);