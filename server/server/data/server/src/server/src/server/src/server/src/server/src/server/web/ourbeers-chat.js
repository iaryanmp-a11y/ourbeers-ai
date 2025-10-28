/* OurBeers chat widget (drop-in) */
(function () {
  // ===== EDIT THESE IF NEEDED =====
  const CONFIG = {
    backend: (window.OURBEERS_BACKEND || "https://YOUR-VERCEL-URL.vercel.app").replace(/\/$/, ""),
    brandName: "Beverage World",
    theme: "#111827",
    linkTarget: "_blank",
  };
  // =================================

  const css = `
  .ob-bubble{position:fixed;right:20px;bottom:20px;background:${CONFIG.theme};color:#fff;border-radius:999px;padding:12px 14px;font:600 14px system-ui;cursor:pointer;z-index:999999}
  .ob-panel{position:fixed;right:20px;bottom:80px;width:360px;max-height:70vh;background:#fff;border-radius:16px;box-shadow:0 12px 30px rgba(0,0,0,.2);display:none;flex-direction:column;overflow:hidden;z-index:999999}
  .ob-head{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f3f4f6;border-bottom:1px solid #e5e7eb;font:600 14px system-ui}
  .ob-body{padding:10px;height:320px;overflow:auto;background:#fafafa}
  .ob-row{margin:8px 0;display:flex}
  .ob-row.you{justify-content:flex-end}
  .ob-msg{max-width:80%;padding:8px 10px;border-radius:12px;font:500 13px system-ui;line-height:1.35}
  .ob-msg.bot{background:#e5e7eb}
  .ob-msg.you{background:${CONFIG.theme};color:#fff}
  .ob-foot{display:flex;gap:8px;padding:10px;border-top:1px solid #e5e7eb;background:#fff}
  .ob-foot input{flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:10px;font:500 13px system-ui}
  .ob-foot button{padding:10px 12px;border:none;border-radius:10px;background:${CONFIG.theme};color:#fff;font:600 13px system-ui;cursor:pointer}
  .ob-link{color:#2563eb;text-decoration:none}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const bubble = document.createElement("div");
  bubble.className = "ob-bubble";
  bubble.textContent = "💬 Ask " + CONFIG.brandName;

  const panel = document.createElement("div");
  panel.className = "ob-panel";
  panel.innerHTML = `
    <div class="ob-head">${CONFIG.brandName} — Assistant <span id="ob-x" style="cursor:pointer">✕</span></div>
    <div class="ob-body" id="ob-body"></div>
    <div class="ob-foot">
      <input id="ob-in" placeholder="Ask about availability, styles, prices…" />
      <button id="ob-send">Send</button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);
  const body = panel.querySelector("#ob-body");
  const input = panel.querySelector("#ob-in");
  const send = panel.querySelector("#ob-send");
  panel.querySelector("#ob-x").onclick = () => (panel.style.display = "none");
  bubble.onclick = () => {
    panel.style.display = panel.style.display === "flex" ? "none" : "flex";
    panel.style.flexDirection = "column";
    if (!panel.dataset.seeded) {
      bot(`Hi! I can check availability and suggest alternatives. Try: <br>
           • Do you have Buffalo Trace 750ml?<br>
           • Hazy IPAs under $15<br>
           • Cabernet for steak, $20–$30`);
      panel.dataset.seeded = "1";
    }
  };

  function add(text, who) {
    const row = document.createElement("div");
    row.className = "ob-row " + (who || "bot");
    const msg = document.createElement("div");
    msg.className = "ob-msg " + (who || "bot");
    msg.innerHTML = text;
    row.appendChild(msg);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }
  const bot = (t) => add(t, "bot");
  const you = (t) => add(t, "you");

  async function ask(q) {
    you(q);
    try {
      const r = await fetch(`${CONFIG.backend}/search?q=` + encodeURIComponent(q));
      const items = await r.json();

      if (!items.length) {
        bot("I didn't find a match. Want to leave your email for a back-in-stock alert?");
        return;
      }

      const top = items[0];
      const inv = await fetch(`${CONFIG.backend}/inventory/` + encodeURIComponent(top.sku)).then((x) => x.json()).catch(() => ({}));
      const inStock = Number(inv.inventory) > 0;

      const link = `<a class="ob-link" href="/search?q=${encodeURIComponent(top.title)}" target="${CONFIG.linkTarget}">${top.title}</a>`;
      bot(`${inStock ? "✅ In stock" : "❌ Out of stock"} — ${link} — $${Number(top.price).toFixed(2)}
          <br><img src="${top.imageUrl}" alt="${top.title}" style="max-width:100%;border-radius:10px;margin-top:6px" />`);
    } catch (e) {
      console.error(e);
      bot("Oops, something went wrong. Try again.");
    }
  }

  send.onclick = () => {
    const q = input.value.trim();
    if (q) {
      ask(q);
      input.value = "";
    }
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      ask(input.value.trim());
      input.value = "";
    }
  });
})();
