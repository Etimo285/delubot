'use strict'

const puppeteer = require('puppeteer')
const { selectors, genres } = require('./nekosearcher.json')

class NekoSearcher {
  constructor () {
    this.browser = null
    this.page = null
  }

  async init (headless = true, slowMo = 0, animeVersion = 'anime') {
    this.browser = await puppeteer.launch({ headless, slowMo })
    this.page = await this.browser.newPage()

    await this.page.setViewport({ width: 1980, height: 1080 })

    const waitForNavigation = this.page.waitForNavigation()

    await this.page.goto(`https://www.neko-sama.fr/${animeVersion}/`)
    await waitForNavigation

    await this.page.waitForNetworkIdle()
  }

  async search (text) {
    await this.page.waitForSelector(selectors.searchInput)
    await this.page.type(selectors.searchInput, text, { delay: 10 })
  }

  async setGenre (genre) {
    await this.page.click(selectors.genresBtn)
    await this.page.waitForSelector(selectors.genresPopUp)
    await this.page.click(`.genres-pop-out div[data-value=${genre}]`)
  }

  async getResults ({ isSearched = true }) {
    const infosArray = []
    const animeList = isSearched ? selectors.searchedAnimes : selectors.sortedAnimes
    await this.page.waitForSelector(animeList,
      { timeout: 1500 }).catch(() => { return [] }
    )
    const animes = await this.page.$$(animeList)
    for (const anime of animes) {
      const link = await this.page.evaluate(el => el.children[1].children[0].href, anime)
      const cover = await this.page.evaluate(el => el.children[0].children[0].children[0].children[1].src, anime)
      const title = await this.page.evaluate(el => el.children[1].children[0].children[0].textContent, anime)
      const year = isSearched
        ? await this.page.evaluate(el => el.children[1].children[1].children[0].textContent, anime)
        : (await this.page.evaluate(el => el.children[1].children[1].textContent, anime)).slice(0, 4)
      const episodes = isSearched
        ? await this.page.evaluate(el => el.children[1].children[1].children[1].textContent, anime)
        : (await this.page.evaluate(el => el.children[1].children[1].textContent, anime)).slice(7)
      const score = isSearched
        ? await this.page.evaluate(el => el.children[0].children[1].children[0].textContent, anime)
        : (await this.page.evaluate(el => el.children[0].children[1].textContent, anime)).slice(1, 5)
      infosArray.push({ link, cover, title, year, episodes, score })
    }
    return infosArray
  }

  async getGenres () {
    await this.page.click(selectors.genresBtn)
    await this.page.waitForSelector(selectors.genresPopUp)
    const genres = await this.page.$$(selectors.genresPopUpItems)
    const genresArray = []
    for (const genre of genres) {
      const name = await this.page.evaluate(el => el.textContent, genre)
      const value = await this.page.evaluate(el => el.getAttribute('data-value'), genre)
      genresArray.push({ name, value })
    }
    return genresArray
  }

  close () {
    this.browser.close()
  }
}

// Fonction de test
async function main () {
  const nekoSearcher = new NekoSearcher()
  await nekoSearcher.init(false, 0, 'anime')
  // await nekoSearcher.setGenre(genres[5].dataValue)
  // const results = await nekoSearcher.getResults({ isSearched: false })
  const genres = await nekoSearcher.getGenres()
  console.log(genres)
  nekoSearcher.close()
}

if (require.main === module) {
  main()
}

module.exports = NekoSearcher
