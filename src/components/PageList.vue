<template>
  <div class="page-list">
    <ul>
      <li v-for="item in currentList.data"> <router-link :to="{path:item.url}">{{item.title}} - {{item.url}} </router-link></li>
    </ul>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  name: 'PageList',
  data () {
    return {
      data: {}
    }
  },
  computed: {
    ...mapGetters('qgp', [
      'currentList'
    ])
  },
  created () {
    this.update()
  },
  watch: {
  },
  methods: {
    update () {
      let path = this.$route.path
      if (!path) return
      this.$store.dispatch('qgp/useListAsCurrent', path)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
