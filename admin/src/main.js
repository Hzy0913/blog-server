import Vue from 'vue'
import App from './App'
import axios from 'axios'
import router from './router'
import 'iview/dist/styles/iview.css'
import './assets/iconfont'


import { Button, Table, Poptip, Tag, Message, DropdownMenu, Dropdown, DropdownItem, Upload, Modal, Icon, Input } from 'iview';
Vue.component('Button', Button);
Vue.component('Table', Table);
Vue.component('Poptip', Poptip);
Vue.component('DropdownMenu', DropdownMenu);
Vue.component('Dropdown', Dropdown);
Vue.component('Tag', Tag);
Vue.component('DropdownItem', DropdownItem);
Vue.component('Upload', Upload);
Vue.component('Modal', Modal);
Vue.component('Input', Input);
Vue.component('Icon', Icon);

Vue.prototype.$Message = Message;


Vue.config.productionTip = false
Vue.prototype.$http = axios
const lid = localStorage.getItem('lid');
axios.defaults.headers.lid = lid || ''; // 全局axios 设置请求头token
axios.interceptors.response.use(
  res => res,
  err => {
    const {data: {error}} = (err || {}).response;
    if (err.response.status === 401) {
      Message.info('您的登录已过期，请重新登录');
      setTimeout(() => {
        router.push({path: '/admin'});
        localStorage.removeItem('lid');
        window.location.reload();
      }, 600);
      return Promise.reject(err);
    }
    if (error) {
      Message.error(error);
      return Promise.reject(err);
    }
  }
);

const vm = new Vue({
  el: '#app',
  router,
  render: h => h(App),
  data: {
    eventbus: new Vue()
  }
});
