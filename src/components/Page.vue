<template>
  <div class="qgp-page">
    <router-link :to="currentList.url">List</router-link>
    <router-link :to="next.url">Next</router-link>
    <router-link :to="previous.url">Previous</router-link>
    <div v-html="content"></div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import marked from 'marked'
export default {
  name: 'Page',
  computed: {
    path () { return this.$route.path },
    content () {
      if (this.current.ext === 'md') return marked(this.current.data)
      return this.current.data
    },
    ...mapGetters('qgp', [
      'current',
      'currentList',
      'next',
      'previous'
    ])
  },
  created () {
    this.update()
  },
  watch: {
    $route () { this.update() }
  },
  methods: {
    update () {
      console.log(this.$route)
      this.$store.dispatch('qgp/usePageAsCurrent', this.path)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
