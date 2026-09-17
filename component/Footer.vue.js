// Vue2 Footer组件
Vue.component('footer-component', {
    template: `
        <div class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>关于我们</h4>
                    <ul>
                        <li><a href="#">公司简介</a></li>
                        <li><a href="#">联系我们</a></li>
                        <li><a href="#">加入我们</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>帮助中心</h4>
                    <ul>
                        <li><a href="#">常见问题</a></li>
                        <li><a href="#">预约指南</a></li>
                        <li><a href="#">用户协议</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>服务项目</h4>
                    <ul>
                        <li><a href="#">预约挂号</a></li>
                        <li><a href="#">在线问诊</a></li>
                        <li><a href="#">健康体检</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>联系方式</h4>
                    <ul>
                        <li>服务热线：400-888-8888</li>
                        <li>邮箱：service@hospital.com</li>
                        <li>地址：北京市朝阳区健康路100号</li>
                    </ul>
                </div>
            </div>
            <div class="copyright">
                © 2024 健康之路在线医疗平台 版权所有
            </div>
        </div>
    `
});