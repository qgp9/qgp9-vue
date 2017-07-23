import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Page from '@/components/Page'
import PageList from '@/components/PageList'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/:collection/list',
      name: 'PageList',
      component: PageList
    },
    {
      path: '/:url+',
      name: 'page',
      component: Page
    }
  ]
})
