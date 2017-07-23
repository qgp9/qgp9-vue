<template>
  <div class="hello">
    HIHI
    <p>
    <div v-html="content"></div>
    </p>
  </div>
</template>

<script>
import axios from 'axios'
import marked from 'marked'
export default {
  name: 'hello',
  data () {
    return {
      content: '',
      msg: 'Welcome to Your Vue.js App'
    }
  },
  created () {
    this.update()
  },
  methods: {
    update () {
      const url = this.$route.params.url
      axios.get('/api/url/' + url + '.json')
        .then(res => { this.content = marked(res.data.content); console.log(res) })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
