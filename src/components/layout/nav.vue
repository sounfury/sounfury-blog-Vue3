<template>
  <div class="nav-container">
    <transition name="fade">
      <nav class="nav" :class="{ show: isShow }" v-show="isShow || isTop">
        <!-- Site name/logo section -->
        <router-link :to="logoLink" class="site-name">{{ siteName }}</router-link>

        <!-- Mobile menu button -->
        <button class="mobile-menu-btn lg:hidden" @click="toggleMobileMenu">
          <font-awesome-icon :icon="['fas', isMobileMenuOpen ? 'times' : 'bars']" />
        </button>

        <!-- Navigation menu -->
        <div class="menus" :class="{ 'mobile-open': isMobileMenuOpen }">
          <template v-for="(menuItem, index) in menuItems" :key="index">
            <div class="menu-item" v-hasRole="menuItem.requireRole || []"
                 @mouseenter="!isMobileMenuOpen && openSubmenu(index)"
                 @mouseleave="!isMobileMenuOpen && closeSubmenu(index)"
                 @click="isMobileMenuOpen && menuItem.submenu && toggleSubmenu(index)">
              <!-- 一级菜单 -->
              <component :is="menuItem.type === 'router' ? 'router-link' : 'a'"
                         :to="menuItem.type === 'router' ? menuItem.link : undefined"
                         :href="menuItem.type === 'external' ? menuItem.link : undefined"
                         @click="!menuItem.submenu && closeMobileMenu()">
                <font-awesome-icon :icon="menuItem.icon" />
                <span>{{ menuItem.label }}</span>
                <i v-if="menuItem.submenu" class="fas fa-chevron-down mobile-chevron"
                   :class="{ 'rotated': isMobileMenuOpen && isSubmenuOpen[index] }"></i>
              </component>

              <!-- 桌面端二级菜单 -->
              <HovershowCard v-if="!isMobileMenuOpen && menuItem.submenu && isSubmenuOpen[index]"
                             :numberOfLi="menuItem.submenu.length">
                <template #item="{ index: subIndex }">
                  <component v-if="menuItem.submenu && subIndex <= menuItem.submenu.length && menuItem.submenu[subIndex - 1]"
                    :is="menuItem.submenu[subIndex - 1].type === 'router' ? 'router-link' : 'a'"
                    :to="menuItem.submenu[subIndex - 1].type === 'router' ? menuItem.submenu[subIndex - 1].link : undefined"
                    :href="menuItem.submenu[subIndex - 1].type === 'external' ? menuItem.submenu[subIndex - 1].link : undefined">
                    <font-awesome-icon :icon="menuItem.submenu[subIndex - 1].icon" />
                    {{ menuItem.submenu[subIndex - 1].label }}
                  </component>
                </template>
              </HovershowCard>

              <!-- 移动端二级菜单 -->
              <div v-if="isMobileMenuOpen && menuItem.submenu && isSubmenuOpen[index]" class="mobile-submenu">
                <component v-for="(subItem, subIndex) in menuItem.submenu" :key="subIndex"
                           :is="subItem.type === 'router' ? 'router-link' : 'a'"
                           :to="subItem.type === 'router' ? subItem.link : undefined"
                           :href="subItem.type === 'external' ? subItem.link : undefined"
                           class="mobile-submenu-item"
                           @click="closeMobileMenu()">
                  <font-awesome-icon :icon="subItem.icon" />
                  {{ subItem.label }}
                </component>
              </div>
            </div>
          </template>


        </div>

        <!-- Right side of navigation -->
        <div class="navright" :class="{ 'mobile-open': isMobileMenuOpen }">
          <font-awesome-icon v-if="showSearch" :icon="['fas', 'magnifying-glass']" class="search"
            @click="onSearchClick" />
          <div class="login-btn" v-if="showLogin" @click="openLoginDialog" @mouseover="isHovering = true"
            @mouseleave="isHovering = false">
            {{ displayUsername }}
          </div>
          <ThemeButton v-if="showThemeToggle" class="ThemeButton" />
        </div>
      </nav>
    </transition>

    <!-- Login dialog (optional) -->
    <loginDialog v-if="showLoginDialog" v-model="dialogVisible" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import HovershowCard from "@/components/card/BaseCard/HovershowCard.vue"
import ThemeButton from "@/components/buttons/ThemeButton.vue"
import loginDialog from "@/components/dialog/login-dialog.vue"
import useUserStore from "@/store/modules/user"
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  // Site configuration
  siteName: {
    type: String,
    default: 'sounfuryのBlog'
  },
  logoLink: {
    type: String,
    default: '/home'
  },

  menuItems: {
    type: Array,
    default: () => []
  },

  showSearch: {
    type: Boolean,
    default: true
  },
  showLogin: {      //是否显示登录按钮
    type: Boolean,
    default: true
  },
  showThemeToggle: {   //是否显示主题切换按钮
    type: Boolean,
    default: true
  },
  onSearchClick: {
    type: Function,
    default: () => { }
  }
})


// Emits
const emit = defineEmits(['login', 'search'])


const userStore = useUserStore()
const showLoginDialog = ref(false)
const isShow = ref(false)
const isTop = ref(true)
const dialogVisible = ref(false)
const isSubmenuOpen = ref([])
const isMobileMenuOpen = ref(false)
const isHovering = ref(false); // 是否 hover 的状态

// 根据 hover 状态动态显示用户名或 "Log Out"
const displayUsername = computed(() => {
  if (isHovering.value && userStore.name) {
    return 'Log Out';
  }
  return userStore.name || 'Login';
});

//二级菜单打开
const openSubmenu = (index) => {
  const newSubmenuState = new Array(props.menuItems.length).fill(false)
  newSubmenuState[index] = true
  isSubmenuOpen.value = newSubmenuState
}

const closeSubmenu = (index) => {
  isSubmenuOpen.value[index] = false
}

// 切换子菜单（移动端）
const toggleSubmenu = (index) => {
  const newSubmenuState = [...isSubmenuOpen.value]
  newSubmenuState[index] = !newSubmenuState[index]
  isSubmenuOpen.value = newSubmenuState
}

// 移动端菜单切换
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // 关闭所有子菜单
  if (!isMobileMenuOpen.value) {
    isSubmenuOpen.value = new Array(props.menuItems.length).fill(false)
  }
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  isSubmenuOpen.value = new Array(props.menuItems.length).fill(false)
}

//登录弹窗
const openLoginDialog = () => {
  const userStore = useUserStore(); // 引入 userStore
  if (userStore.name !== '') {
    // 弹窗提示是否退出登录
    ElMessageBox.confirm(
      '确定要退出登录吗？', // 弹窗内容
      '提示', // 弹窗标题
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        // 点击确定时执行
        userStore.logOut();
        ElMessage({
          type: 'success',
          message: '已成功退出登录',
        });
      })
      .catch(() => {
        // 点击取消时执行
        ElMessage({
          type: 'info',
          message: '已取消退出登录',
        });
      });
    return;
  } else if (showLoginDialog) {
    // 打开登录对话框
    dialogVisible.value = true;
    emit('login');
  }
};


//处理向上滚动时显示
const handleMouseWheel = (e) => {
  if (e.deltaY > 0) {
    isShow.value = false
  } else if (e.deltaY < 0) {
    isShow.value = true
  }

  if (isTop.value) {
    isShow.value = false
  }
}
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  isTop.value = scrollTop <= 40
}

onMounted(() => {
  window.addEventListener("wheel", handleMouseWheel)
  window.addEventListener("scroll", handleScroll)
  if (userStore.name !== '') {
    
    showLoginDialog.value = false
  } else {
    
    showLoginDialog.value = true
  }

})

onUnmounted(() => {
  window.removeEventListener("wheel", handleMouseWheel)
  window.removeEventListener("scroll", handleScroll)
})
</script>


<style scoped>
.login-btn {
  transition: all 1s ease;
  display: inline-block;
  cursor: pointer;
}

.login-btn:hover {
  transform: scale(1.05);
  color: #007bff;
  /* 鼠标悬停时的颜色变化 */
}

/* 文字变化动画 */
.login-btn {
  position: relative;
  overflow: hidden;
}

.login-btn span {
  display: inline-block;
  transition: transform 1s ease;
}

.login-btn:hover span {
  transform: translateY(-100%);
}



.search {
  font-size: 20px;
}

/*导航栏样式*/
.img_container {
  width: 35px;
  height: 35px;
  margin-left: 10px;
}

img {
  display: block;
  margin: 0 auto;
  border-radius: 50%;
  object-fit: cover;
}

/* .ThemeButton {
  position: absolute;
  right: 20px;
} */
.navright {
  display: flex;
  justify-content: space-around;
  position: relative;
  align-items: center;
  margin-left: 130px;
  font-size: 18px;
  width: 15%;
  flex-shrink: 0;
}

.nav {
  height: 60px;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  align-items: center;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
  color: #eee;
}

.show {
  color: #4c4948;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 5px 6px -5px rgba(133, 133, 133, 0.6);

  .menu-item:hover {
    color: var(--hover--color);
    transition: all 0.3s ease-in-out;
  }

  & a {
    color: #4c4948 !important;
  }

  .site-name:hover {
    color: var(--hover--color);
    transition: all 0.3s ease-in-out;
  }
}

@keyframes width {
  0% {
    opacity: 0;
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";
    filter: alpha(opacity=0);

    transform: translateY(-60px);
  }

  100% {
    opacity: 1;

    filter: none;

    transform: translateY(0);
  }
}

.site-name {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
  font-weight: bolder;
  font-size: 18px;
  width: 20%;
  padding-left: 20px;
  color: #eee;
  flex-shrink: 0;
}

.site-name:hover {
  color: #fff;
  text-shadow: none;
}

.menus {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60%;
}

.menu-item {
  /* font-family: Titillium Web, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft JhengHei', 'Microsoft YaHei', sans-serif; */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
  font-weight: 700;
  font-size: 16px;
  /* color: #eee; */
  padding: 3px;
  width: 90px;
  text-align: center;
  position: relative;

  & a {
    color: #eee;
  }
}

.menu-item {
  min-width: 66px;
}

.menu-item::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  /* 下划线的高度 */
  background-color: var(--hover--color);
  /* 下划线颜色 */
  bottom: 0px;
  /* 下划线位置 */
  left: 4px;
  /* 初始位置在最左侧 */
  transition: all 0.5s ease-in-out;
  text-shadow: none;
  /* 过渡效果，调整时间以控制填充速度 */
}

.menu-item:hover {
  color: #fff;
}

.menu-item:hover::after {
  width: 95%;
  /* 鼠标悬停时，宽度变为 100%，从左到右填充 */
}

.menu-item:hover .fa-chevron-down {
  transform: rotate(180deg);
  transition: transform 0.6s ease;
}

/* 移动端样式 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #eee;
  font-size: 20px;
  cursor: pointer;
  padding: 10px;
  z-index: 1001;
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: block;
    color: var(--font-color); /* 使用主题字体颜色 */
  }

  .nav {
    padding: 0 15px;
    background: var(--nav-mobile-bg);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    -moz-backdrop-filter: blur(15px);
    -ms-backdrop-filter: blur(15px);
    will-change: backdrop-filter;
    border-bottom: 1px solid var(--nav-mobile-border);
    color: var(--font-color); /* 使用主题字体颜色 */
  }

  .site-name {
    width: auto;
    padding-left: 0;
    font-size: 16px;
    color: var(--font-color); /* 使用主题字体颜色 */
  }

  .menus {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    background: var(--nav-mobile-bg);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    -moz-backdrop-filter: blur(15px);
    -ms-backdrop-filter: blur(15px);
    will-change: backdrop-filter, transform, opacity;

    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease-in-out;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 999;
    border: 1px solid var(--nav-mobile-border);
  }

  .menus.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .menu-item {
    width: 100%;
    padding: 15px 20px;
    text-align: left;
    border-bottom: 1px solid var(--nav-mobile-divider);
    min-width: auto;

    & a {
      color: var(--font-color) !important;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .menu-item::after {
    display: none;
  }

  .mobile-chevron.rotated {
    transform: rotate(180deg);
  }

  .mobile-submenu {
    margin: 0;
    padding: 0;
  }

  .mobile-submenu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 30px;
    color: var(--font-color) !important;
    font-size: 14px;
    border-bottom: 1px solid var(--nav-mobile-divider);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .show .menus,
  .show .navright {
    background: var(--nav-mobile-bg);
  }

  .navright {
    position: static;
    margin-left: 0;
    width: auto;
    padding: 15px 20px;
    justify-content: center;
    gap: 20px;
    border-top: 1px solid var(--nav-mobile-divider);
    display: none;
  }

  .navright.mobile-open {
    display: flex;
  }

  .show .menus,
  .show .navright {
    background: var(--nav-mobile-bg);
  }
}

/* 黑夜主题下的移动端导航优化 */
html[data-theme="dark"] {
  @media (max-width: 1024px) {
    .nav,
    .menus,
    .navright,
    .show .menus,
    .show .navright {
      background: var(--nav-mobile-bg) !important;
      border-color: var(--nav-mobile-border) !important;
    }

    .mobile-submenu {
      background: rgba(0, 0, 0, 0.4) !important;
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
    }
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
,
.fade-leave-active {
  opacity: 0;
  transform: translateY(-60px);
}
</style>
