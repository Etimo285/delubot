'use strict'

const { ActionRowBuilder, ButtonBuilder } = require('discord.js')
const { getStringWidth, padStringToWidth, Align } = require('discord-button-width')
const { uid } = require('uid')

class Gigapaginator {
  constructor () {
    this.buttonBuilders = []
    this.rowBuilders = []
  }

  setButtons (buttons) {
    for (const button of buttons) {
      this.buttonBuilders.push(
        new ButtonBuilder()
          .setCustomId(uid())
          .setLabel(button.label)
          .setStyle(button.style)
      )
    }
  }

  generateRows (rows) {
    for (let i = 0; i < rows; i++) {
      const filteredButtonBuilders = this.buttonBuilders.slice(i * 5, (i * 5) + 5)
      this.rowBuilders.push(
        new ActionRowBuilder()
          .addComponents(...filteredButtonBuilders)
      )
    }

    return this.rowBuilders
  }
}

module.exports = new Gigapaginator()
