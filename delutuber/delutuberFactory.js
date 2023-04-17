'use strict'

const Delutuber = require('./delutuber')

class DelutuberFactory {
  create () {
    return new Delutuber()
  }
}

module.exports = new DelutuberFactory()
