import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'font-awesome/css/font-awesome.css'
import { postRequest } from "./utils/api";
import { putRequest } from "./utils/api";
import { getRequest } from "./utils/api";
import { deleteRequest } from "./utils/api";
import { initMenu } from './utils/menus'

Vue.config.productionTip = false
Vue.use(ElementUI)

Vue.prototype.postRequest = postRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.getRequest = getRequest;
Vue.prototype.deleteRequest = deleteRequest;

router.beforeEach((to, from, next) => {
  if (window.sessionStorage.getItem("token")) {
    initMenu(router, store);
    if (!window.sessionStorage.getItem("user")) {
      return getRequest("/sms/system/getUserInfoByToken").then(resp => {
        if (resp.code === 200) {
          window.sessionStorage.setItem("user", JSON.stringify(resp.data.user));
          next();
        }
      });
    }
    next();
  } else {
    if(to.path=='/'){
      next();
    }else {
      next('/?redirect='+to.path);
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
