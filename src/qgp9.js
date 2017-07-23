const nodepath = require('path')
// const fs = require('fs-extra')

const Item = require('./item.js')
const Store = require('./store.js')
const Config = require('./config.js')
const Train = require('night-train')
const configDefault = require('./config-default.js')
const FileLoader = require('./fileLoader.js')
const FrontMatter = require('./frontmatter.js')
const FilenameHandler = require('./filename-handler.js')
const Permalink = require('./permalink.js')
const ApiWriter = require('./api-writer.js')
const StaticHandler = require('./static-handler.js')
const {ERROR, DEBUG} = require('./error.js')

class QGP9 {
  constructor(config){
    this.config = new Config
    this.config.addObj(configDefault)
    this.trains = new Train([
      'processCollection',
      'processItem',
      'processInstall',
      'processAfterInstall'
    ])
  }

  /**
   * Add configuration file. 
   * * chinable
   * * dupllecated ivoking cause merging of config files
   * @param {string} path path of configuration file. Possible extensions are yml, yaml, tml, toml, js, json
   */
  configure (path) {
    this.config.addFile(path)
    return this
  }

  /**
   * Set configuration of source directory
   * * Chainable
   * * Final value depend on an order of source and configure
   * @param {string} path path of source directory from current directory
   */
  source (path) {
    this.config.set('sourc', path)
    return this
  }

  /**
   * Set backed db
   * @param {object} store 
   */
  useStore (store) {
    this.store = store
    return this
  }

  /**
   * Register plugin
   * @param {object} plugin
   */
  use (plugin) {
    this.trains.register(plugin)
    return this
  }

  /** 
   * Helper function to run each 'processItem' train
   * @private
   */ 
  async _processItems () {
    const pages = await this.store.table('page').catch(ERROR)
    const items =  pages.find({
      updated: true
    })
    const plist = []
    for (const item of items) {
      const itemObj = new Item(item)
      const promise = this.trains.run('processItem', {item: itemObj})
        .then(() => {
          // item.updated = false
          //pages.update(item)
        })
        .catch(ERROR)
      plist.push(promise)
    }
    await Promise.all(plist)
    this.store.save()
  }


  async run () {
    const qgp = this

    await this.store.load()
      .catch(ERROR)
    /*
    await new Promise((resolve, reject) => this.store.loadDatabase({}, err => {
      if (err) reject(err)
      else resolve()
    }))
    */
    // Finalize config
    this.config._normalize()

    // Add page table
    await this.store.getTableOrAdd('page', { 
      unique: ['src', 'url'],
      indices: ['collection']
    }).catch(ERROR)
    await this.store.getTableOrAdd('file', { 
      unique: ['src', 'url'],
      indices: ['collection']
    }).catch(ERROR)

    const checkpoint = this.checkpoint = Date.now()

    // register plugin
    await this.trains.runAsync('register', this)
      .catch(ERROR)

    await this.trains.run('processCollection', {qgp, checkpoint})
      .catch(ERROR)

    await this._processItems()
      .catch(ERROR)

    await this.trains.run('processInstall', {qgp, checkpoint})
      .catch(ERROR)

    /*

    plist = []
    for (const collection in this.config.collections) {
      plist.push(this.train.run('processCollection', {collname, store, qgp}))
    }
    await Promise.all(plist)

    await this.afterProcessInstall()
    */

    //this.store.table('page').then(c => c.findOne({collection:'posts'})).then(DEBUG).catch(ERROR)
    //this.store.table('page').then(c => c.findOne({collection:'pages'})).then(DEBUG).catch(ERROR)
    //this.store.table('file').then(c => c.find() ).then(DEBUG).catch(ERROR)

    //this.store.table('page').then(c => c.find()).then(item => { item.content = null }).catch(ERROR)
    await this.store.save().catch(ERROR)
  }
}

let qgp = new QGP9
qgp.configure('_config.yml')
  .useStore(new Store('store.json'))
  .use(new FileLoader)
  .use(new FrontMatter)
  .use(new FilenameHandler)
  .use(new Permalink)
//  .use(new Taxonomy)
  .use(new ApiWriter)
  .use(new StaticHandler)
//  .use(new SpaHandler)
  .run()
  .then(() => console.log('Well done'))
  .catch(err => { throw err })
// qgp.scanSource()
// qgp.readCollections()
//console.log(qgp.collections)
// console.log(qgp.updated)
