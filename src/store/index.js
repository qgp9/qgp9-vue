import Vue from 'vue'
import Vuex from 'vuex'
import qgp from './modules/qgp9'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    qgp
  }
})
