// platforms/vinted/extractor.js
// Extraction d'une fiche produit Vinted vers le modèle universel. Reprend la
// technique de vinted2leboncoin- (JSON-LD en priorité, plus robuste que le
// parsing textuel de vinted2beebs), avec fusion des images DOM + JSON-LD.
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.VintedExtractor = (function () {
  function parseJsonLdProduct() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        const candidates = Array.isArray(data) ? data : [data];
        for (const c of candidates) {
          if (c && (c["@type"] === "Product" || c["@type"] === "Offer")) return c;
        }
      } catch (e) {
        // JSON-LD malformé, on ignore et on retombe sur le DOM
      }
    }
    return null;
  }

  function getImgUrl(img) {
    const candidate =
      img.currentSrc ||
      img.getAttribute("data-src") ||
      img.getAttribute("data-original") ||
      img.src ||
      (img.getAttribute("data-srcset") && img.getAttribute("data-srcset").split(",")[0].trim().split(" ")[0]);
    if (!candidate || candidate.startsWith("data:")) return null;
    return candidate;
  }

  function titleFromSlug(url) {
    const m = (url || "").match(/\/items\/\d+-([^/?]+)/);
    if (!m) return "";
    try {
      return decodeURIComponent(m[1]).replace(/-/g, " ").replace(/\s+/g, " ").trim().replace(/^./, (c) => c.toUpperCase());
    } catch (e) {
      return m[1].replace(/-/g, " ").trim();
    }
  }

  function isSingleItemPage() {
    return /^\/items\/\d+/.test(location.pathname);
  }

  function extractSingleItemData() {
    const ld = parseJsonLdProduct();

    let title = ld && ld.name;
    let description = ld && ld.description;
    let price = ld && ld.offers && (ld.offers.price || (Array.isArray(ld.offers) && ld.offers[0] && ld.offers[0].price));

    if (!title) {
      const titleEl = document.querySelector('h1, [itemprop="name"]');
      title = ((titleEl && titleEl.textContent) || "").trim() || titleFromSlug(location.href);
    }

    if (!description) {
      const descEl = document.querySelector('[data-testid="item-description-content"], [itemprop="description"], [class*="description"]');
      description = ((descEl && descEl.textContent) || "").trim();
    }

    if (!price) {
      const priceEl = document.querySelector('[data-testid$="price"], [itemprop="price"], [class*="price"]');
      price = ((priceEl && (priceEl.getAttribute("content") || priceEl.textContent)) || "").trim();
    }

    const exactImages = Array.from(document.querySelectorAll('img[data-testid^="item-photo-"]')).map(getImgUrl).filter(Boolean);
    const domImages = Array.from(
      document.querySelectorAll(
        '[data-testid*="gallery"] img, [data-testid*="photo"] img, [class*="gallery"] img, [class*="carousel"] img, [class*="thumbnail"] img, li img, img[srcset], img[data-src]'
      )
    ).map(getImgUrl).filter(Boolean);
    const ldImages = ld && ld.image ? (Array.isArray(ld.image) ? ld.image : [ld.image]) : [];
    const images = Array.from(new Set([...exactImages, ...domImages, ...ldImages])).slice(0, 20);

    const listing = MultiSell.Listing.createEmpty();
    listing.title = String(title || "").trim().slice(0, 200);
    listing.description = String(description || "").trim().slice(0, 4000);
    listing.price = String(price || "").replace(/[^\d,.\s€]/g, "").trim();
    listing.photos = images;
    listing.sourcePlatform = "vinted";
    listing.sourceUrl = location.href;
    listing.sourceId = MultiSell.Listing.extractSourceId(location.href);

    return listing;
  }

  return { isSingleItemPage, extractSingleItemData };
})();
