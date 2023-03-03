import puppeteer from 'puppeteer'

export async function generateTrafficMap(): Promise<Buffer> {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:6100/res/static/traffic.html')
  await page.setViewport({ width: 700, height: 700 })
  await page.waitForFunction('window.mapOK === true')
  const result = await page.screenshot()
  await browser.close()

  return result
}
