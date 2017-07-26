import Vue from 'vue'
import siteinfo from 'siteinfo'
import qgp9Api from '@/api/qgp'
// BEGIN-INJECT-TYPES
import {CURRENT, CURRENT_LIST, NEXT, PREVIOUS, ADD_OR_UPDATE_PAGE, ADD_OR_UPDATE_LIST, REMOVE_PAGE, REMOVE_LIST, SET_CURRENT_PAGE, SET_CURRENT_LIST, FETCH_URL, USE_PAGE, USE_LIST, USE_COLLECTION, USE_PAGE_AS_CURRENT, USE_LIST_AS_CURRENT, USE_COLLECTION_AS_CURRENT} from './types-qgp9.js'
// END

function ERROR (err) {
  throw Error(err)
}

const emptyItem = {
  url: ''
}

const state = {
  siteinfo,
  pages: {},
  lists: {},
  listsByUrl: {},
  pageMap: {},
  currentPage: null,
  currentList: null
}

const getters = {
  [CURRENT]: ({currentPage, pages}) => currentPage ? pages[currentPage] : {},
  [CURRENT_LIST]: ({currentList, lists}) => currentList ? lists[currentList] : emptyItem,

  [NEXT]: state => {
    const loc = state.pageMap[state.currentPage]
    if (loc) return state.lists[loc[0]].data[loc[1] + 1] || emptyItem
    return emptyItem
  },
  [PREVIOUS]: state => {
    const loc = state.pageMap[state.currentPage]
    if (loc) return state.lists[loc[0]].data[loc[1] - 1] || emptyItem
    return emptyItem
  }
}

const mutations = {
  [ADD_OR_UPDATE_PAGE] (state, page) {
    Vue.set(state.pages, page.url, page)
  },
  [ADD_OR_UPDATE_LIST] (state, list) {
    Vue.set(state.lists, list.name, list)
    Vue.set(state.listsByUrl, list.url, list.name)
    for (const index in list.data) {
      const url = list.data[index].url
      Vue.set(state.pageMap, url, [list.name, parseInt(index)])
    }
  },
  [REMOVE_PAGE] (state, url) {
    Vue.delete(state.pages, url)
    Vue.delete(state.pageMap, url)
  },
  [REMOVE_LIST] (state, name) {
    const url = state.lists[name].url
    Vue.delete(state.lists, name)
    Vue.delete(state.listsByUrl, url)
  },
  [SET_CURRENT_PAGE] (state, url) {
    state.currentPage = url
  },
  [SET_CURRENT_LIST] (state, name) {
    state.currentList = name
  }
}

const actions = {
  async [FETCH_URL] ({state, commit}, url) {
    const data = await qgp9Api.fetch(url).catch(ERROR)
    if (data.type === 'page') {
      commit(ADD_OR_UPDATE_PAGE, data)
    } else if (data.type === 'list') {
      commit(ADD_OR_UPDATE_LIST, data)
    }
    return data
  },

  async [USE_PAGE] ({state, dispatch}, url) {
    if (state.pages[url]) return state.pages[url]
    else {
      return await dispatch(FETCH_URL, url).catch(ERROR)
    }
  },

  async [USE_LIST] ({state, dispatch}, url) {
    const name = state.listsByUrl[url]
    if (name) return state.lists[name]
    return await dispatch(FETCH_URL, url).catch(ERROR)
  },

  async [USE_COLLECTION] ({state, dispatch}, collection) {
    const list = state.lists[collection]
    if (list) return list
    const _collection = state.siteinfo.collections[collection]
    return await dispatch(FETCH_URL, _collection.list)
      .catch(ERROR)
  },

  async [USE_PAGE_AS_CURRENT] ({state, commit, dispatch}, url) {
    const page = await dispatch(USE_PAGE, url)
    if (!page) return
    commit(SET_CURRENT_PAGE, url)
    // Call "use collection as current" automatically
    await dispatch(USE_COLLECTION_AS_CURRENT, page.collection)
    return page
  },

  async [USE_LIST_AS_CURRENT] ({state, commit, dispatch}, url) {
    const list = await dispatch(USE_LIST, url)
    if (list) commit(SET_CURRENT_LIST, list.name)
    return list
  },

  async [USE_COLLECTION_AS_CURRENT] ({commit, dispatch}, name) {
    const list = await dispatch(USE_COLLECTION, name)
    if (list) commit(SET_CURRENT_LIST, name)
    return list
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
