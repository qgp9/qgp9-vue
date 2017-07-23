const configDefault = {
  source_dir: 'src',
  target_dir: 'dist',
  api_point: 'api',
  basename: '/',
  permalink: '/:year/:month/:day/:slug',
  extensions: ['.md', '.markdown', '.json', '.html'],
  excludes: ['.git', '.gitignore'],
  taxonomy: {
    category: ['category', 'categories'],
    tag: ['tag', 'tags']
  },
  collections: {
    pages: {
      type: 'page',
      path: '.',
      permalink: '/:path'
    },
    posts: {
      type: 'page',
      path: '_posts'
    },
    static: {
      type: 'file',
      extensions: '*',
      path: '_static',
      permalink:  '/:path'
    }
  }
}

module.exports = configDefault
