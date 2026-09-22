// platforms/vinted/grid.js
// Scraping des grilles (dressing, favoris, recherche) — repris de
// vinted2leboncoin-, la plus mature des deux implémentations d'origine.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.VintedGrid = (function () {
  function extractId(url) {
    const m = (url || "").match(/\/items\/(\d+)/);
    return m ? m[1] : (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
  }

  function titleFromSlug(url) {
    const m = (url || "").match(/\/items\/\d+-([^/?]+)/);
    if (!m) return "";
    try {
      return decodeURIComponent(m[1]).replace(/-/g, " ").trim().replace(/^./, (c) => c.toUpperCase());
    } catch (e) {
      return m[1].replace(/-/g, " ").trim();
    }
  }

  function extractItemFromArticle(article) {
    const link = article.querySelector('a[href*="/items/"]') || (article.tagName === "A" && article.href ? article : null);
    if (!link) return null;

    const rawHref = link.getAttribute("href") || link.href;
    const url = rawHref.startsWith("http") ? rawHref : new URL(rawHref, location.origin).href;
    const id = extractId(url);

    const titleEl = article.querySelector('[data-testid$="--description-title"]') || article.querySelector("h3, h2");
    let title = ((titleEl && titleEl.textContent) || "").trim() || titleFromSlug(url);
    title = title.slice(0, 200);

    const priceEl = article.querySelector('[data-testid$="--price-text"]') || article.querySelector('[class*="price"]');
    const price = ((priceEl && priceEl.textContent) || "").trim().slice(0, 20);

    return { id, sourceUrl: url, sourcePlatform: "vinted", sourceId: id, title, price, ts: Date.now() };
  }

  function scrapeArticles() {
    const nodes = document.querySelectorAll('article[data-testid], a[href*="/items/"], div[data-testid*="item-box"]');
    const pairs = [];
    const seen = new Set();
    nodes.forEach((node) => {
      const item = extractItemFromArticle(node);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        pairs.push({ item, node });
      }
    });
    return pairs;
  }

  async function syncScrapedItems() {
    const pairs = scrapeArticles();
    if (pairs.length === 0) return;

    for (const { item } of pairs) {
      try {
        await chrome.runtime.sendMessage({ type: "MS_SAVE_LISTING", payload: item });
      } catch (e) {
        console.error("[MultiSell] Échec sauvegarde item", item.id, e);
      }
    }
  }

  return { scrapeArticles, syncScrapedItems };
})();
