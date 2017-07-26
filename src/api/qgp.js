import axios from 'axios'
// import siteinfo from 'siteinfo'

const ERROR = err => { throw Error(err) }

class QGP9 {
  async fetch (path) {
    console.log(path)
    let url = path !== '/' ? path : '/index'
    url = url.replace(/\/+$/, '')
    const api = `/api/url/${url}.json`.replace(/\/+/g, '/')
    const res = await axios.get(api).catch(ERROR)
    return res.data
  }
}

export default new QGP9()
