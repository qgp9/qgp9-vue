class Permalink {
  constructor () {
    this.name = 'Permalink'
  }
  async register (qgp) {
    this.config = qgp.config
  }

  async processItem ({item}) {
    if (item.type() !== 'page') return
    let permalink = item.permalink()
    if (!permalink) {
      const collname = item.collection()
      const template = this.config.get(collname, 'permalink')
      const matter = item.matter()
      permalink = template
        .replace(':slug', item.slug() || '')
        .replace(':title', item.slug() || '')
        // FIXME: ugly
        .replace(':dirname', item.src().replace(/(\/index)?\.[^.]+$/,'').split('/').slice(2).join('/'))
        .replace(':path', item.src().replace(/(\/index)?\.[^.]+$/,'').split('/').slice(2).join('/'))

      const date = new Date(item.date())
      if (date) {
        permalink = permalink
          .replace(':year', date.getFullYear())
          .replace(':month', ('0' + date.getMonth()).slice(-2))
          .replace(':day', ('0' + date.getDay()).slice(-2))
      }
    }
    item.setPermalink(permalink)
    let url = '/' + permalink // TODO include baseurl?
    url = url.replace(/\/+/g, '/')
    item.setUrl(url)
  }
}

module.exports = Permalink
