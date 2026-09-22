// platforms/beebs/platform.js
var MultiSell = window.MultiSell || (window.MultiSell = {});

MultiSell.BeebsPlatform = (function () {
  async function init() {
    const res = await chrome.runtime.sendMessage({ type: "MS_GET_PENDING_TRANSFER", payload: { destination: "beebs" } });
    const pending = res && res.success ? res.data : null;
    if (!pending) return;
    if (document.getElementById("ms-panel")) return;

    const box = document.createElement("div");
    box.id = "ms-panel";
    box.style.width = "340px";
    document.body.appendChild(box);
    box.innerHTML = `
      <b>⚡ MultiSell — Import Vinted</b>
      <div class="ms-line" style="word-break:break-word">${pending.title}</div>
      <div class="ms-line" style="max-height:100px;overflow:auto;background:#1f2937;padding:6px;border-radius:6px">${pending.description}</div>
      <div class="ms-line">Prix brut : <b>${pending.price}</b></div>
      <div id="ms-thumbs" style="display:flex;gap:4px;flex-wrap:wrap;margin:6px 0"></div>
      <button class="ms-dest-btn" id="ms-fill-btn">1. Remplir + ${(pending.images || []).length} photos auto</button>
      <div class="ms-diag" id="ms-status"></div>
    `;

    const thumbs = box.querySelector("#ms-thumbs");
    (pending.images || []).forEach((img) => {
      const im = document.createElement("img");
      im.src = img.dataUrl;
      im.style.cssText = "width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #fbbf24";
      thumbs.appendChild(im);
    });

    box.querySelector("#ms-fill-btn").addEventListener("click", async () => {
      const state = await MultiSell.BeebsForm.fillForm(pending);
      box.querySelector("#ms-status").textContent = MultiSell.Diagnostics
        ? MultiSell.Diagnostics.buildFormFillReport("beebs", state)
        : JSON.stringify(state);
      if (state.filledTitle && state.filledDescription) {
        await chrome.runtime.sendMessage({ type: "MS_CLEAR_PENDING_TRANSFER", payload: { destination: "beebs" } });
      }
    });
  }

  return { init };
})();
