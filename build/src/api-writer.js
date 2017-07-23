const path = require('path')
const fs = require('fs-extra')
const {DEBUG, ERROR} = require('./error.js')
const Item = require('./item.js')
const _ = require('lodash')


class ApiWriter {
  constructor () {
    this.name = 'ApiWriter'
  }
  
  async register (qgp) {
    this.config = qgp.config
    this.store = qgp.store
    this.api_point = this.config.get(null, 'api_point')
    this.root = qgp.root
  }

  async processInstall ({checkpoint}) {
    const pages = await this.store.table('page').catch(ERROR)
    const items = pages.find()
    const collections = this.config.get('', 'collections')
    const collData = {}
    for (const collname in collections) {
      collData[collname] = {
        data: []
      }
    }
    let plist = []
    for (const itemRaw of items) {
      const item = new Item(itemRaw)
      const collname = item.collection()
      const apiPath = path.join(
        this.root,
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
      collData[collname].data.push({
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

    //
    // Write list
    //
    plist = []
    for (const collname in collections) {
      const data = collData[collname]
      const listPath = this.config.get(collname, 'list')
      if (listPath) {
        data.size = data.data.length
        data.updatedAt = new Date(checkpoint)
        const promise = fs.outputJson(path.join(this._apiPath(collname), 'url', listPath + '.json'), data)
          .catch(ERROR)
        plist.push(promise)
        //
        // Pagenation
        const pagenation = this.config.get(collname, 'pagenation')
        if (pagenation) {
          let page = 0
          let size = data.data.length
          let copy = []
          copy.concat(data.data)
          while (copy.length > 0){
            page++
            const list = copy.splice(0, pagenation)
            const paged = {
              collection: collname,
              type: 'list',
              size: list.length,
              page: page,
              size_all: size,
              updatedAt: new Date(checkpoint),
              data: list
            }
            const promise = fs.outputJson(path.join(this._apiPath(collname), 'url', listPath, page + '.json'), paged)
            plist.push(promise)
          }
        }
      }

      //
      // Archive
      // TODO
    }
    await Promise.all(plist)
      .catch(ERROR)

    await this._write_siteinfo().catch(ERROR)
  }

  async _write_siteinfo () {
    const omitList = [
      'source_dir',
      'target_dir',
      'extensions',
      'excludes',
      'internal',
      'path',
      'secrets'
    ]

    const siteinfo = _.cloneDeep(_.omit(this.config.config, omitList))
    for (let collname in siteinfo.collections){
      siteinfo.collections[collname] = _.omit(siteinfo.collections[collname], omitList)
    }
    await fs.outputJson(path.join(this._apiPath(''),'site.json'), siteinfo).catch(ERROR)

    const siteinfoJs = _.cloneDeep(this.config.config)
    siteinfoJs.root = this.root
    await fs.outputFile(path.join(this.root, '.config.js'), 'module.exports = ' + JSON.stringify(siteinfoJs, null, 2))
  }

  _apiPath (collname) {
    return  path.join(
      this.root,
      this.config.get(collname, 'target_dir'),
      this.config.get(collname, 'api_point')
    )
  }
}

module.exports = ApiWriter
