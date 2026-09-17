Vue.component('sidebar-component', {
    props: {
        activeMenu: {
            type: String,
            default: 'myAppointment'
        }
    },
    template: `
        <div class="sidebar">
            <!-- 订单中心 -->
            <div class="menu-group">
                <div class="menu-title">订单中心</div>
                <ul class="menu-list">
                    <li 
                        :class="['menu-item', {active: activeMenu === 'myAppointment'}]"
                        @click="$emit('menu-change', 'myAppointment')"
                    >我的挂号</li>
                    <li 
                        :class="['menu-item', {active: activeMenu === 'myConsult'}]"
                        @click="$emit('menu-change', 'myConsult')"
                    >我的咨询</li>
                    <li 
                        :class="['menu-item', {active: activeMenu === 'myReviews'}]"
                        @click="$emit('menu-change', 'myReviews')"
                    >我的评价</li>
                </ul>
            </div>
            <!-- 关注中心 -->
            <div class="menu-group">
                <div class="menu-title">关注中心</div>
                <ul class="menu-list">
                    <li 
                        :class="['menu-item', {active: activeMenu === 'followHospital'}]"
                        @click="$emit('menu-change', 'followHospital')"
                    >关注的医院</li>
                    <li 
                        :class="['menu-item', {active: activeMenu === 'followDoctor'}]"
                        @click="$emit('menu-change', 'followDoctor')"
                    >关注的医生</li>
                    <li 
                        :class="['menu-item', {active: activeMenu === 'followDisease'}]"
                        @click="$emit('menu-change', 'followDisease')"
                    >关注的疾病</li>
                </ul>
            </div>
            <!-- 账户中心 -->
            <div class="menu-group">
                <div class="menu-title">账户中心</div>
                <ul class="menu-list">
                    <li 
                        :class="['menu-item', {active: activeMenu === 'personalInfo'}]"
                        @click="$emit('menu-change', 'personalInfo')"
                    >个人资料</li>
                    <li 
                        :class="['menu-item', {active: activeMenu === 'familyMembers'}]"
                        @click="$emit('menu-change', 'familyMembers')"
                    >就诊成员</li>
                    <li 
                        :class="['menu-item', {active: activeMenu === 'changePassword'}]"
                        @click="$emit('menu-change', 'changePassword')"
                    >密码修改</li>
                </ul>
            </div>
            <!-- 消息中心 -->
            <div class="menu-group">
                <div class="menu-title">消息中心</div>
                <ul class="menu-list">
                    <li 
                        :class="['menu-item', {active: activeMenu === 'myMessages'}]"
                        @click="$emit('menu-change', 'myMessages')"
                    >我的消息</li>
                    <li 
                        :class="['menu-item', {active: activeMenu === 'myFeedback'}]"
                        @click="$emit('menu-change', 'myFeedback')"
                    >我的反馈</li>
                </ul>
            </div>
        </div>
    `
});