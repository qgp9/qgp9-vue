const path = require('path')
const fs = require('fs-extra')
const {DEBUG, ERROR} = require('./error.js')
const Item = require('./item.js')


class ApiWriter {
  constructor () {
    this.name = 'ApiWriter'
  }
  
  async register (qgp) {
    this.config = qgp.config
    this.store = qgp.store
    this.api_point = this.config.get(null, 'api_point')
  }

  async processInstall ({checkpoint}) {
    const pages = await this.store.table('page').catch(ERROR)
    const items = pages.find()
    const collections = this.config.get('', 'collections')
    const collData = {}
    for (const collname in collections) {
      collData[collname] = {
        list: []
      }
    }
    let plist = []
    for (const itemRaw of items) {
      const item = new Item(itemRaw)
      const collname = item.collection()
      const apiPath = path.join(
        this.config.get(collname, 'target_dir'),
        this.config.get(collname, 'api_point')
      )
      const fullpath = path.join(
        apiPath,
        'url',
        item.url() + '.json'
      )
      if (item.lastChecked() < checkpoint) {
        DEBUG('item deleted' , item.path())
        const promise = fs.remove(fullpath)
          .then(() => { pages.remove(item.item) })
          .catch(ERROR)
        plist.push(promise)
        continue
      }
      collData[collname].list.push({
        url: item.url(),
        mtime: item.mtime(),
        matter: item.matter(),
      })
      if (!item.updated()) continue
      const promise = fs.outputJson(fullpath, item.item)
        .then(() => { item.setUpdated(false); pages.update(item.item) })
        .catch(ERROR)
      plist.push(promise)
    }
    await Promise.all(plist).catch(ERROR)

    plist = []
    for (const collname in collections) {
      const data = collData[collname]
      data.size = data.list.length
      data.updatedAt = new Date(checkpoint)
      const promise = fs.outputJson(path.join(this._apiPath(collname), collname, 'list.json'), collData[collname])
        .catch(ERROR)
      plist.push(promise)
    }
    await Promise.all(plist)
      .catch(ERROR)

  }

  _apiPath (collname) {
    return  path.join(
      this.config.get(collname, 'target_dir'),
      this.config.get(collname, 'api_point')
    )
  }
}

module.exports = ApiWriter
