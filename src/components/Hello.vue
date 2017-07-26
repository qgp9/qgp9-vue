<template>
  <div class="hello">
    <div v-html="content"></div>
    <ul>
      <li v-for="collection in site.collections" 
      v-if="collection.type === 'page'">
        <router-link :to="collection.list">
          List of {{collection.name}}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import siteinfo from 'siteinfo'
import marked from 'marked'
import {mapGetters} from 'vuex'
export default {
  name: 'hello',
  computed: {
    path () { return this.$route.path },
    site () { return siteinfo },
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
