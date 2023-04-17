'use strict'

const puppeteer	= require('puppeteer')
const { selectors } = require('./delutube.json')

class Delutuber {
  constructor () {
    this.browser = null
    this.page = null
  }

  async init (headless = true, slowMo = 0) {
    this.browser = await puppeteer.launch({ headless, slowMo })
    this.page = await this.browser.newPage()

    await this.page.setViewport({ width: 1080, height: 1024 })

    const waitForNavigation = this.page.waitForNavigation();
    await this.page.goto('https://www.youtube.com/')
    await waitForNavigation;

    await this.page.waitForNetworkIdle()

    try {
      await this.page.waitForSelector(selectors.cookiesWindow)
      const buttons = await this.page.$$(selectors.cookiesButtons)
      const acceptButton = await this.page.evaluate(el => el.ariaLabel, buttons[1])
      await this.page.waitForSelector(`button[aria-label="${acceptButton}"]`)
      await this.page.click(`button[aria-label="${acceptButton}"]`)
      await this.page.waitForNetworkIdle()
    } catch {
      console.log("No cookies window")
    }

  }

  async search(text) {
    await this.page.waitForSelector(selectors.searchInput)
    await this.page.type(selectors.searchInput, text, { delay: 10 })
    setTimeout(async () => { await this.page.keyboard.press('Enter') }, 1500)
    await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  }

  async getFirstResult() {
    await this.page.waitForSelector(selectors.results)
    const resultThumbnails = await this.page.$$(selectors.resultThumbnails)
    const firstResultLink = await this.page.evaluate(el => el.href, resultThumbnails[0])
    return firstResultLink
  }

  close () {
    this.browser.close()
  }

}

// Fonction de test
async function main () {
  const delutuber = new Delutuber()
  await delutuber.init(false, 0)

  await delutuber.search("Dogecoin to the moon")
  const result = await delutuber.getFirstResult()
  console.log(result)
  delutuber.close()
}

if (require.main === module) {
  main()
}

module.exports = Delutuber
