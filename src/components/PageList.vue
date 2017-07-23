<template>
  <div class="page-list">
    <ul>
      <li v-for="item in data.data"> <router-link :to="{path:item.url}">{{item.matter.title}} - {{item.url}} </router-link></li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'PageList',
  data () {
    return {
      data: {}
    }
  },
  created () {
    this.update()
  },
  watch: {
    data () {
    }
  },
  methods: {
    update () {
      const collection = this.$route.params.collection
      axios.get('/api/url/' + collection + '/list.json')
        .then(res => { this.data = res.data; console.log(res) })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
