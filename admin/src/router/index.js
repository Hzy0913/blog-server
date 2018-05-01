import Vue from 'vue'
import Router from 'vue-router'
import articleList from '../components/ArticleList.vue'
import articleEdit from '../components/ArticleEdit.vue'
import AtricleLabel from '../components/ArticleLabel.vue'
import articlePreview from '../components/ArticlePreview.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {path: '/admin', component: articleList,
      children: [
        {path: 'articleEdit', component: articleEdit},
        {path: 'articlePreview/:id', component: articlePreview},
      ]
    },
    {path: '/admin/atricleLabel', component: AtricleLabel},
    {path: '*', component: articleList,redirect: '/admin/articleEdit'}
  ]
});

export default router;
