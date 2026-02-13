import chromium from "@sparticuz/chromium-min"
import puppeteer from "puppeteer-core"
// import puppeteer from "puppeteer"


// const extractHTMLFromUrl = async (url: string): Promise<string> => {
//   try {
//     const browser = await puppeteer.launch({ headless: true })
//     console.log(url, browser)
//     const page = await browser.newPage()
const extractHTMLFromUrl = async (url: string): Promise<string> => {
  let browser
  try {
    browser = await puppeteer.launch({
      executablePath: await chromium.executablePath(), // points to Vercel-compatible Chromium
      args: chromium.args,
      headless: true,
    })
    const page = await browser.newPage()

    try {
      await page.goto(url, { waitUntil: "networkidle2" })
    } catch (err) {
      console.error("Failed to navigate to URL:", err)
      await browser.close()
      throw new Error(
        `Unable to access the job posting URL. Please verify the URL is valid and accessible: ${url}`
      )
    }
    // Clean the HTML
    await page.evaluate(() => {
      // Remove unwanted tags
      const tagsToRemove = [
        "img",
        "script",
        "head",
        "style",
        "footer",
        "nav",
        "aside",
        "form",
        "input",
        "select",
        "textarea",
        "button",
      ]
      tagsToRemove.forEach((tag) => {
        document.querySelectorAll(tag).forEach((el) => el.remove())
      })

      // Remove elements with sidebar/navbar class or id
      const selectorsToRemove = [
        '[class*="sidebar"]',
        '[id*="sidebar"]',
        '[class*="navbar"]',
        '[id*="navbar"]',
        '[class*="menu"]',
        '[id*="menu"]',
        '[class*="nav"]',
        '[id*="nav"]',
      ]
      selectorsToRemove.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove())
      })

      // Remove HTML comments
      const removeComments = (node: Node | null) => {
        if (!node) return
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          const child = node.childNodes[i]
          if (!child) continue
          if (child.nodeType === 8) node.removeChild(child)
          else if (child.nodeType === 1) removeComments(child)
        }
      }
      removeComments(document.body)
      const flattenTextNodes = (node: Element | null) => {
        if (!node) return
        node.querySelectorAll("div, span").forEach((el) => {
          if (el.children.length === 0 && el.textContent?.trim()) {
            el.replaceWith(document.createTextNode(el.textContent))
          } else {
            flattenTextNodes(el as Element)
          }
        })
      }
      flattenTextNodes(document.body)

      // Remove inline event handlers and noisy attributes
      document.querySelectorAll("*").forEach((el) => {
        const attrs = Array.from(el.attributes)
        attrs.forEach((attr) => {
          if (
            attr.name.startsWith("on") ||
            attr.name === "style" ||
            attr.name.startsWith("data-")
          ) {
            el.removeAttribute(attr.name)
          }
        })
      })

      // Remove empty tags
      const removeEmptyTags = () => {
        let removed = false
        document.querySelectorAll("*").forEach((el) => {
          if (
            !el.textContent?.trim() &&
            !el.querySelector("img, video, iframe") &&
            el.tagName !== "BR"
          ) {
            el.remove()
            removed = true
          }
        })
        if (removed) removeEmptyTags() // Recursively remove newly empty parents
      }
      removeEmptyTags()

      // Flatten unnecessary divs/spans
      document.querySelectorAll("div, span").forEach((el) => {
        if (el.children.length === 0 && el.textContent?.trim()) {
          el.replaceWith(document.createTextNode(el.textContent))
        }
      })
      document.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el)
        if (
          style.display === "none" ||
          (el instanceof HTMLElement &&
            (el.offsetHeight === 0 || el.offsetWidth === 0))
        ) {
          el.remove()
        }
      })
    })

    // Extract main content if available, otherwise body
    const mainSelector = "main, [role='main'], #content, .main, .content"
    const bodyHtml = await page.evaluate((selector) => {
      const main = document.querySelector(selector)
      return main ? main.innerHTML : document.body?.innerHTML || ""
    }, mainSelector)

    if (browser) await browser.close()

    return bodyHtml
  } catch (error) {
    console.error("Error fetching URL:", error)
    throw new Error(
      `Failed to extract job posting content: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`
    )
  }
}

export default extractHTMLFromUrl
