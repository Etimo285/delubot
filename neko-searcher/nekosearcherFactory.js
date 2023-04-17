'use strict'

const NekoSearcher = require('./nekosearcher')

class NekoSearcherFactory {
  create () {
    return new NekoSearcher()
  }
}

module.exports = new NekoSearcherFactory()
