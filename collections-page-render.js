(function () {
  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function getCountdown(endTime) {
    var diff = new Date(endTime).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) return "Ended";
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return days + "d " + hours + "h";
    if (hours > 0) return hours + "h " + minutes + "m";
    return minutes + "m";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function buildCard(item) {
    var countdown = "";
    if (item.expires_at && item.show_countdown) {
      countdown =
        '<div class="absolute top-3 right-3">' +
        '<span class="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 bg-blue-500 text-white border-0">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 mr-1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
        "Ends in " +
        escapeHtml(getCountdown(item.expires_at)) +
        "</span></div>";
    }

    return (
      '<a href="collections/' +
      escapeHtml(item.slug) +
      '.html" class="group">' +
      '<div class="bg-card text-card-foreground flex flex-col rounded-xl border overflow-hidden h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary">' +
      '<div class="relative aspect-[16/9] overflow-hidden">' +
      '<img src="' +
      escapeHtml(item.local_cover_image || item.cover_image) +
      '" alt="' +
      escapeHtml(item.title) +
      '" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>' +
      (item.cover_text
        ? '<div class="absolute inset-0 bg-black/40 flex items-center justify-center p-4"><h3 class="text-white text-xl md:text-2xl font-bold text-center text-balance">' +
          escapeHtml(item.cover_text) +
          "</h3></div>"
        : "") +
      countdown +
      "</div>" +
      '<div class="px-6 py-6">' +
      '<h2 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">' +
      escapeHtml(item.title) +
      "</h2>" +
      '<p class="text-muted-foreground text-sm line-clamp-3">' +
      escapeHtml(item.description || "") +
      "</p></div></div></a>"
    );
  }

  function mountStaticShell() {
    Array.from(document.body.children).forEach(function (node) {
      if (node.tagName !== "SCRIPT") node.remove();
    });

    var app = document.createElement("div");
    app.className = "flex min-h-screen flex-col";
    app.innerHTML =
      '<main class="flex-1">' +
      '<div class="min-h-screen bg-background">' +
      '<div class="bg-gradient-to-b from-muted/50 to-background py-12 md:py-20">' +
      '<div class="container mx-auto px-4">' +
      '<h1 class="text-3xl md:text-5xl font-bold text-center mb-4">Collections</h1>' +
      '<p class="text-center text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">Discover our curated collections of exceptional items</p>' +
      "</div></div>" +
      '<div class="container mx-auto px-4 py-8 md:py-12">' +
      '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="collections-grid"></div>' +
      "</div></div></main>" +
      '<footer class="border-t border-border/40 bg-secondary/30"><div class="container mx-auto px-4 lg:px-8 py-16"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"><div><div class="mb-6"><img alt="Sotheby&#39;s" width="160" height="33" class="block h-8 w-auto max-w-none" src="logo1.svg"/></div><p class="text-sm text-muted-foreground leading-relaxed">A distinguished auction house specializing in rare collectibles, fine art, and luxury items. Experience the pinnacle of curated auctions.</p></div><div><h3 class="font-medium mb-4">Quick Links</h3><ul class="space-y-3"><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="auctions.html">Current Auctions</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="auctions.html">Shop All</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="collections.html">Collections</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="sell.html">Sell With Us</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="about.html">About Us</a></li></ul></div><div><h3 class="font-medium mb-4">Support</h3><ul class="space-y-3"><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="how-to-bid.html">How to Bid</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="shipping.html">Shipping &amp; Delivery</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="faq.html">FAQ</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="contact.html">Contact Us</a></li></ul></div><div><h3 class="font-medium mb-4">Stay Updated</h3><p class="text-sm text-muted-foreground mb-4 leading-relaxed">Subscribe to receive updates on new auctions and exclusive offers.</p><form class="flex gap-2 mb-6"><input type="email" class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-sm h-10" placeholder="Enter your email" required="" value=""/><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground px-4 py-2 shrink-0 bg-transparent h-10" type="submit">Subscribe</button></form></div></div><div class="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-sm text-muted-foreground">© 2026 Sotheby&#39;s. All rights reserved</p><div class="flex flex-wrap justify-center gap-4 md:gap-6"><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="privacy.html">Privacy Policy</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="terms.html">Terms of Service</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="cookie-policy.html">Cookie Policy</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="accessibility.html">Accessibility</a></div></div></div></footer>';

    document.body.insertBefore(app, document.body.firstChild);
    return app;
  }

  var app = mountStaticShell();
  var grid = app.querySelector("#collections-grid");

  loadJson("data/collections.json")
    .then(function (items) {
      if (!grid) return;
      items.sort(function (a, b) {
        var orderDiff = Number(a.display_order || 0) - Number(b.display_order || 0);
        if (orderDiff !== 0) return orderDiff;
        return String(a.title || "").localeCompare(String(b.title || ""));
      });
      grid.innerHTML = items.map(buildCard).join("");
    })
    .catch(function (error) {
      console.error("Collections page render failed:", error);
      if (grid) {
        grid.innerHTML =
          '<div class="col-span-full text-center py-20"><p class="text-muted-foreground text-lg">No active collections at the moment</p></div>';
      }
    });
})();
