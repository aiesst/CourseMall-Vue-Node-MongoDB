// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import Vuex from 'vuex'
Vue.use(infiniteScroll)

Vue.config.productionTip = false;
Vue.use(Vuex);
Vue.use(VueLazyLoad, {
  loading: "./../../static/loading-svg/loading-bars.svg"
});
const store = new Vuex.Store({
  state: {
    nickName: '',
    cartCount: 0
  },
  mutations: {
    //vuex的使用
    //更新用户信息
    updateUserInfo(state, nickName) {
      state.nickName = nickName;
    },
    updateCartCount(state,cartCount){
      state.cartCount += cartCount;
    },
    initCartCount(state,cartCount){
      state.cartCount = cartCount;
    }
  }
});

/* eslint-disable no-new */

//注册store
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: {App}
})


