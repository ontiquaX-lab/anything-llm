const { CollectorApi } = require("../../collectorApi");

/**
 * Execute a web scraping flow step
 * @param {Object} config Flow step configuration
 * @param {Object} context Execution context with introspect function
 * @returns {Promise<string>} Scraped content
 */
async function executeWebScraping(config, context) {
  const { url, captureAs = "text" } = config;
  const { introspect, logger } = context;
  logger(
    `\x1b[43m[AgentFlowToolExecutor]\x1b[0m - executing Web Scraping block`
  );

  if (!url) {
    throw new Error("URL is required for web scraping");
  }

  const captureMode = captureAs === "querySelector" ? "html" : captureAs;
  introspect(`Scraping the content of ${url} as ${captureAs}`);
  const { success, content } = await new CollectorApi()
    .getLinkContent(url, captureMode)
    .then((res) => {
      if (captureAs !== "querySelector") return res;
      return parseHTMLwithSelector(res.content, config.querySelector, context);
    });

  if (!success) {
    introspect(`Could not scrape ${url}. Cannot use this page's content.`);
    throw new Error("URL could not be scraped and no content was found.");
  }

  introspect(`Successfully scraped content from ${url}`);
  if (!content || content?.length === 0) {
    introspect("There was no content to be collected or read.");
    throw new Error("There was no content to be collected or read.");
  }

  return content;
}

/**
 * Parse HTML with a CSS selector
 * @param {string} html - The HTML to parse
 * @param {string|null} selector - The CSS selector to use (as text string)
 * @param {{introspect: Function}} context - The context object
 * @returns {Object} The parsed content
 */
function parseHTMLwithSelector(html, selector = null, context) {
  if (!selector || selector.length === 0) {
    context.introspect("No selector provided. Returning the entire HTML.");
    return { success: true, content: html };
  }

  const Cheerio = require("cheerio");
  const $ = Cheerio.load(html);
  const selectedElements = $(selector);

  let content;
  if (selectedElements.length === 0) {
    return { success: false, content: null };
  } else if (selectedElements.length === 1) {
    content = selectedElements.html();
  } else {
    context.introspect(
      `Found ${selectedElements.length} elements matching selector: ${selector}`
    );
    content = selectedElements
      .map((_, element) => $(element).html())
      .get()
      .join("\n");
  }
  return { success: true, content };
}

module.exports = executeWebScraping;
