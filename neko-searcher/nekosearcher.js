'use strict'

const puppeteer	= require('puppeteer')
const { selectors } = require('./nekosearcher.json')

class NekoSearcher {
  constructor () {
    this.browser = null
    this.page = null
  }

  async init (headless = true, slowMo = 0, animeVersion = "anime") {
    this.browser = await puppeteer.launch({ headless, slowMo })
    this.page = await this.browser.newPage()

    await this.page.setViewport({ width: 1980, height: 1080 })

    const waitForNavigation = this.page.waitForNavigation();

    await this.page.goto(`https://www.neko-sama.fr/${animeVersion}/`)
    await waitForNavigation;

    await this.page.waitForNetworkIdle()

  }

  async search(text) {
    await this.page.waitForSelector(selectors.searchInput)
    await this.page.type(selectors.searchInput, text, { delay: 10 })
  }

  async getResults() {
    const infosArray = []
    await this.page.waitForSelector(selectors.animes, { timeout: 1500 }).catch(() => { return [] })
    const animes = await this.page.$$(selectors.animes)
      for (const anime of animes) {
        const link = await this.page.evaluate(el => el.children[1].children[0].href , anime)
        const cover = await this.page.evaluate(el => el.children[0].children[0].children[0].children[1].src , anime)
        const title = await this.page.evaluate(el => el.children[1].children[0].children[0].textContent , anime)
        const year = await this.page.evaluate(el => el.children[1].children[1].children[0].textContent , anime)
        const episodes = await this.page.evaluate(el => el.children[1].children[1].children[1].textContent , anime)
        const score = await this.page.evaluate(el => el.children[0].children[1].children[0].textContent , anime)
        infosArray.push({ link: link, cover: cover, title: title, year: year, episodes: episodes, score: score })
      }
    return infosArray
  }

  close () {
    this.browser.close()
  }

}

// Fonction de test
async function main () {
  const nekoSearcher = new NekoSearcher()
  await nekoSearcher.init(false, 0, "anime")
  await nekoSearcher.search("Sword art online")
  const result = await nekoSearcher.getResults()
  console.log(result)
  nekoSearcher.close()
}

if (require.main === module) {
  main()
}

module.exports = NekoSearcher
