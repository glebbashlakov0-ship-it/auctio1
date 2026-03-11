(function () {
  var BASE_PATH = "../";
  var SUPABASE_URL = "https://pwihhhbomwxzznekueok.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWhoaGJvbXd4enpuZWt1ZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTgzNjMsImV4cCI6MjA4MTAzNDM2M30.S1aJOnJIdZY8WGVUUAbvMStxR4C5o2-3AkO6GgmkKYY";

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function requestSupabase(path) {
    return fetch(SUPABASE_URL + path, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
      },
      cache: "no-store",
    }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function stripHtml(value) {
    return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  function renderRichText(value) {
    if (!value) return "";
    return String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function getLanguage() {
    return (
      localStorage.getItem("site-language") ||
      localStorage.getItem("language") ||
      getCookie("language") ||
      "en"
    );
  }

  function formatCurrency(value) {
    return "EUR " + Number(value || 0).toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
  }

  function injectLotPageStyles() {
    if (document.getElementById("lot-page-inline-styles")) return;
    var style = document.createElement("style");
    style.id = "lot-page-inline-styles";
    style.textContent =
      ".lot-shell{max-width:1140px;margin:0 auto;}" +
      ".lot-two-col{display:grid;grid-template-columns:minmax(0,1fr);gap:2.5rem;align-items:start;justify-content:center;}" +
      ".lot-left-col,.lot-right-col{min-width:0;}" +
      ".lot-left-col{max-width:680px;}" +
      ".lot-right-col{max-width:400px;}" +
      ".lot-sticky-col{position:static;align-self:start;}" +
      ".lot-related-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;}" +
      "@media (min-width:768px){.lot-related-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}" +
      "@media (min-width:1024px){.lot-two-col{grid-template-columns:minmax(520px,680px) minmax(340px,400px);gap:2.75rem;}.lot-sticky-col{position:sticky;top:96px;}}" +
      "@media (min-width:1280px){.lot-related-grid{grid-template-columns:repeat(4,minmax(0,1fr));}}";
    document.head.appendChild(style);
  }

  function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getCountdown(endTime) {
    var diff = new Date(endTime).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) return "Ended";

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (days > 0) {
      return (
        days +
        "d " +
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
      );
    }

    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );
  }

  function getStatusLabel(item, strings) {
    var status = String(item.status || "").toLowerCase();
    if (status === "closed" || status === "sold") return strings.bid.auctionEnded;
    var diff = new Date(item.end_time || item.endTime).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) return strings.bid.auctionEnded;
    return strings.bid.timeRemaining;
  }

  function getPrimaryImage(images) {
    if (!images || !images.length) return BASE_PATH + "placeholder.svg";
    var primary = images.find(function (image) { return image.is_primary; }) || images[0];
    return primary.image_url || primary.image || BASE_PATH + "placeholder.svg";
  }

  function buildLotHref(item) {
    return BASE_PATH + "lot/index.html?slug=" + encodeURIComponent(item.slug || "");
  }

  function normalizeLotTranslation(item, language) {
    var translation = (item.lot_translations || []).find(function (entry) {
      return entry.language === language;
    });

    if (!translation && language !== "en") {
      translation = (item.lot_translations || []).find(function (entry) {
        return entry.language === "en";
      });
    }

    if (!translation) return item;

    return {
      id: item.id,
      slug: item.slug,
      title: translation.title || item.title,
      description: translation.description || item.description,
      condition: translation.condition || item.condition,
      provenance: translation.provenance || item.provenance,
      shipping_info: translation.shipping_info || item.shipping_info,
      artist_maker: translation.artist_maker || item.artist_maker,
      current_bid: item.current_bid,
      starting_bid: item.starting_bid,
      estimated_value_min: item.estimated_value_min,
      estimated_value_max: item.estimated_value_max,
      minimum_increment: item.minimum_increment,
      start_time: item.start_time,
      end_time: item.end_time,
      status: item.status,
      year: item.year,
      dimensions: item.dimensions,
      materials: translation.materials || item.materials,
      lot_number: item.lot_number,
      category_id: item.category_id,
      categories: item.categories,
      lot_images: item.lot_images || [],
      extra: item.extra || {},
      raw: item,
    };
  }

  function mapStrings(translations, language) {
    var lang = translations[language] || translations.en || {};
    var fallback = translations.en || {};

    function pick(path, fallbackText) {
      var cursor = lang;
      for (var i = 0; i < path.length; i += 1) cursor = cursor && cursor[path[i]];
      if (cursor != null) return cursor;
      cursor = fallback;
      for (var j = 0; j < path.length; j += 1) cursor = cursor && cursor[path[j]];
      return cursor != null ? cursor : fallbackText;
    }

    return {
      nav: {
        shopAll: pick(["nav", "shopAll"], "Shop All"),
      },
      productPage: {
        estimate: pick(["productPage", "estimate"], "Estimate"),
        currentBid: pick(["productPage", "currentBid"], "Current Bid"),
        placeBid: pick(["productPage", "placeBid"], "Place Bid"),
        conditionReport: pick(["productPage", "conditionReport"], "Condition Report"),
        additionalDetails: pick(["productPage", "additionalDetails"], "Additional Details"),
        viewBidHistory: pick(["productPage", "viewBidHistory"], "View Bid History"),
        bidHistory: pick(["productPage", "bidHistory"], "Bid History"),
        bidHistoryDesc: pick(["productPage", "bidHistoryDesc"], "Complete bidding history for this lot"),
        bidder: pick(["productPage", "bidder"], "Bidder"),
        bidAmount: pick(["productPage", "bidAmount"], "Bid Amount"),
        time: pick(["productPage", "time"], "Time"),
        increase: pick(["productPage", "increase"], "Increase"),
        shipping: pick(["productPage", "shipping"], "Shipping"),
        freeExpressDelivery: pick(["productPage", "freeExpressDelivery"], "Free express delivery"),
        shippingInfo: pick(["productPage", "shippingInfo"], "Shipping Information"),
        shippingDesc: pick(["productPage", "shippingDesc"], "Fast and secure shipping worldwide within 1-3 days, including weekends and holidays."),
        shippingInsurance: pick(["productPage", "shippingInsurance"], "Full insurance coverage included"),
        shippingPackaging: pick(["productPage", "shippingPackaging"], "Professional packaging and handling"),
        shippingTracking: pick(["productPage", "shippingTracking"], "Real-time tracking available"),
        lotDetails: pick(["productPage", "lotDetails"], "Lot Details"),
        description: pick(["productPage", "description"], "Description"),
        provenance: pick(["productPage", "provenance"], "Provenance"),
        shippingDetails: pick(["productPage", "shippingDetails"], "Shipping & Handling"),
        similarItems: pick(["productPage", "similarItems"], "Similar Items"),
        youMightLike: pick(["productPage", "youMightLike"], "You Might Also Like"),
        authenticity: pick(["productPage", "authenticity"], "Authenticity"),
        guaranteed: pick(["productPage", "guaranteed"], "Guaranteed"),
        securePayment: pick(["productPage", "securePayment"], "Secure Payment"),
        protected: pick(["productPage", "protected"], "Protected"),
        worldwideShipping: pick(["productPage", "worldwideShipping"], "Worldwide shipping available. Fully insured and tracked delivery."),
        expressDeliveryIncluded: pick(["productPage", "expressDeliveryIncluded"], "Express Delivery Included"),
        fullyInsured: pick(["productPage", "fullyInsured"], "Fully Insured"),
        securePackaging: pick(["productPage", "securePackaging"], "Secure Packaging"),
        relatedLots: pick(["productPage", "relatedLots"], "Related Lots"),
        loadMoreBids: pick(["productPage", "loadMoreBids"], "Load More Bids"),
        loading: pick(["productPage", "loading"], "Loading..."),
      },
      product: {
        noBidPaymentRequired: pick(["product", "noBidPaymentRequired"], "No payment required for bidding. Payment only upon winning."),
      },
      bid: {
        auctionEnded: pick(["bid", "auctionEnded"], "Auction ended"),
        timeRemaining: pick(["bid", "timeRemaining"], "Time Remaining"),
        minimumBid: pick(["bid", "minimumBid"], "Minimum Bid"),
        yourBid: pick(["bid", "yourBid"], "Your Bid"),
        enterBid: pick(["bid", "enterBid"], "Enter your bid amount"),
        confirmBid: pick(["bid", "confirmBid"], "Confirm Bid"),
      },
      bidding: {
        title: pick(["bidding", "title"], "Place Your Bid"),
        subtitle: pick(["bidding", "subtitle"], "Complete your bid in just a few steps"),
        thankYou: pick(["bidding", "thankYou"], "Your bid has been placed successfully!"),
        step1: pick(["bidding", "step1"], "Select Amount"),
        step2: pick(["bidding", "step2"], "Details"),
        step3: pick(["bidding", "step3"], "Payment"),
        bidSummary: pick(["bidding", "bidSummary"], "Bid Summary"),
        itemDetails: pick(["bidding", "itemDetails"], "Item Details"),
        currentBid: pick(["bidding", "currentBid"], "Current Bid"),
        yourBid: pick(["bidding", "yourBid"], "Your Bid"),
        authorizationHold: pick(["bidding", "authorizationHold"], "Authorization Hold"),
        dueNow: pick(["bidding", "dueNow"], "Temporary Hold"),
        authHoldDescription: pick(["bidding", "authHoldDescription"], "We will verify that your card has enough available balance. No funds will be withdrawn and will be released in a few minutes."),
        estimatedTotal: pick(["bidding", "estimatedTotal"], "Estimated Total"),
        selectBidAmount: pick(["bidding", "selectBidAmount"], "Select Bid Amount"),
        minimumBid: pick(["bidding", "minimumBid"], "Minimum Bid"),
        selectPreset: pick(["bidding", "selectPreset"], "Select a preset amount or enter a custom bid"),
        customAmount: pick(["bidding", "customAmount"], "Custom Amount"),
        enterCustomBid: pick(["bidding", "enterCustomBid"], "Enter custom bid"),
        loading: pick(["bidding", "loading"], "Loading..."),
        confirmBid: pick(["bidding", "confirmBid"], "Confirm Bid"),
        bidderInformation: pick(["bidding", "bidderInformation"], "Bidder Information"),
        firstName: pick(["bidding", "firstName"], "First Name"),
        lastName: pick(["bidding", "lastName"], "Last Name"),
        phone: pick(["bidding", "phone"], "Phone"),
        email: pick(["bidding", "email"], "Email"),
        emailPlaceholder: pick(["bidding", "emailPlaceholder"], "your@email.com"),
        password: pick(["bidding", "password"], "Password"),
        passwordPlaceholder: pick(["bidding", "passwordPlaceholder"], "Create a password"),
        address: pick(["bidding", "address"], "Address"),
        addressLine1: pick(["bidding", "addressLine1"], "Street Address"),
        addressLine2: pick(["bidding", "addressLine2"], "Address Line 2 (Optional)"),
        city: pick(["bidding", "city"], "City"),
        country: pick(["bidding", "country"], "Country"),
        processing: pick(["bidding", "processing"], "Processing..."),
        bidNow: pick(["bidding", "bidNow"], "Bid Now"),
        agreeToTerms: pick(["bidding", "agreeToTerms"], "By placing this bid, you agree to"),
        termsOfSale: pick(["bidding", "termsOfSale"], "Terms of Sale"),
        shippingAddress: pick(["bidding", "shippingAddress"], "Shipping Address"),
        continueToPayment: pick(["bidding", "continueToPayment"], "Continue to Payment"),
        selectPaymentMethod: pick(["bidding", "selectPaymentMethod"], "Select Payment Method"),
        paymentOptions: pick(["bidding", "paymentOptions"], "Payment Options"),
        creditOrDebitCard: pick(["bidding", "creditOrDebitCard"], "Credit or Debit Card"),
        visaMastercard: pick(["bidding", "visaMastercard"], "Visa, Mastercard"),
        fastAndSecure: pick(["bidding", "fastAndSecure"], "Fast and secure"),
        completePayment: pick(["bidding", "completePayment"], "Complete Payment"),
        securePayment: pick(["bidding", "securePayment"], "Secure Payment"),
        securePaymentDescription: pick(["bidding", "securePaymentDescription"], "Your payment information is encrypted securely. We never store your card details."),
      },
      common: {
        loadingLotDetails: pick(["common", "loadingLotDetails"], "Loading lot details..."),
        close: pick(["common", "close"], "Close"),
        back: pick(["common", "back"], "Back"),
      },
    };
  }

  function renderRelatedCard(item, strings) {
    var title = item.title || "Untitled Lot";
    var bid = item.current_bid || item.starting_bid || 0;
    var image = getPrimaryImage(item.lot_images || []);
    var category = (item.categories && item.categories.name) || "General";
    var isEnded = String(item.status || "").toLowerCase() === "closed" || new Date(item.end_time).getTime() <= Date.now();
    var badgeText = isEnded ? strings.bid.auctionEnded : getCountdown(item.end_time);
    return (
      '<a href="' + buildLotHref(item) + '" class="block shrink-0 min-w-[240px] w-[240px] md:min-w-[260px] md:w-[260px] snap-start h-full"><div class="border border-border/50 bg-background rounded-lg overflow-hidden h-full flex flex-col group hover:border-foreground/30 transition-colors">' +
      '<div class="relative aspect-square overflow-hidden bg-muted/20 rounded-t-lg">' +
      '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(title) + '" class="w-full h-full object-cover pointer-events-none select-none" draggable="false"/>' +
      '<div class="absolute top-1 right-1 bg-background/95 backdrop-blur-sm rounded-full px-1 py-0.5 flex items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-2.5 w-2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span class="text-[9px] font-medium">' + escapeHtml(badgeText) + '</span></div></div>' +
      '<div class="p-2 space-y-1.5 flex-1 flex flex-col">' +
      '<span class="text-[9px] uppercase tracking-wider bg-muted/50 border border-border/50 px-1 py-0.5 w-fit rounded">' + escapeHtml(category) + "</span>" +
      '<h3 class="font-serif text-xs leading-tight line-clamp-2 min-h-[32px]">' + escapeHtml(title) + '</h3>' +
      '<div class="flex items-center gap-1 py-1 px-1.5 bg-muted/30 rounded text-[10px] font-medium"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 text-primary"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span class="font-semibold">' + escapeHtml(badgeText) + '</span></div>' +
      '<div><p class="text-[9px] text-muted-foreground uppercase tracking-wider">' + escapeHtml(strings.productPage.currentBid) + '</p><p class="text-sm font-semibold tabular-nums">' + formatCurrency(bid) + '</p></div><span class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[10px] font-medium transition-all border bg-transparent h-7 mt-auto w-full hover:bg-foreground hover:text-background">View Auction</span></div></div></a>'
    );
  }

  function renderNotFound(main) {
    document.title = "Lot Not Found";
    main.innerHTML =
      '<section class="py-16 sm:py-24"><div class="container mx-auto px-4 sm:px-6 lg:px-8">' +
      '<div class="mx-auto max-w-2xl text-center space-y-6">' +
      '<p class="text-sm uppercase tracking-[0.25em] text-muted-foreground">Lot Not Found</p>' +
      '<h1 class="font-serif text-4xl sm:text-5xl">This lot is unavailable.</h1>' +
      '<p class="text-muted-foreground">The requested item could not be found.</p>' +
      '<a href="../auctions.html" class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">Back to Shop All</a>' +
      "</div></div></section>";
  }

  function renderBidRows(bids, lot) {
    if (!bids.length) {
      return '<tr><td colspan="4" class="py-6 text-center text-sm text-muted-foreground">No bids available.</td></tr>';
    }

    return bids.map(function (bid, index) {
      var previous = bids[index + 1];
      var increase = previous ? Number(bid.amount || 0) - Number(previous.amount || 0) : Number(bid.amount || 0) - Number(lot.starting_bid || 0);
      return (
        "<tr class=\"border-t border-border/40\">" +
        '<td class="py-4 pr-4 text-sm font-medium">' + escapeHtml((bid.email || "Private Bidder").replace(/(.{2}).+(@.*)/, "$1***$2")) + "</td>" +
        '<td class="py-4 pr-4 text-sm">' + formatCurrency(bid.amount || 0) + "</td>" +
        '<td class="py-4 pr-4 text-sm text-muted-foreground">' + formatDate(bid.created_at) + "</td>" +
        '<td class="py-4 text-sm text-muted-foreground">' + formatCurrency(increase) + "</td>" +
        "</tr>"
      );
    }).join("");
  }

  function renderLot(main, lot, relatedLots, bids, strings) {
    injectLotPageStyles();
    var images = lot.lot_images || [];
    var primaryImage = getPrimaryImage(images);
    var estimate = lot.estimated_value_min || lot.estimated_value_max
      ? formatCurrency(lot.estimated_value_min) + " - " + formatCurrency(lot.estimated_value_max)
      : "On Request";
    var minimumBid = Math.max(Number(lot.current_bid || 0) + Number(lot.minimum_increment || 0), Number(lot.starting_bid || 0));
    var categoryName = (lot.categories && lot.categories.name) || lot.artist_maker || "General";
    var artistMaker = lot.artist_maker || categoryName;
    var description = renderRichText(lot.description || "");
    var condition = renderRichText(lot.condition || "");
    var provenance = renderRichText(lot.provenance || "");
    var shippingInfo = renderRichText(lot.shipping_info || "");
    var shortDescription = stripHtml(lot.description || "").slice(0, 140) || "The Santos-Dumont is one of the most iconic lines of Cartier.";
    var closed = getStatusLabel(lot, strings) === strings.bid.auctionEnded;
    var additionalDetails = [
      ["Maker", artistMaker],
      ["Year", lot.year || "Not specified"],
      ["Lot", lot.lot_number || "Not assigned"],
      ["Materials", lot.materials || "Not specified"],
      ["Dimensions", lot.dimensions || "Not specified"],
      ["Closes", formatDate(lot.end_time) || "Not specified"],
    ].filter(function (entry) {
      return entry[1];
    });

    document.title = lot.title + " | Sotheby's";

    main.innerHTML =
      '<div id="lot-sticky-bar" class="pointer-events-none fixed inset-x-0 top-16 md:top-20 opacity-0 transition-all duration-200" style="z-index:140;transform:translateY(-14px);">' +
      '<div style="max-width:1320px;margin:0 auto;padding:10px 16px 0;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px 22px;border:1px solid rgba(0,0,0,0.08);border-radius:0 0 18px 18px;background:rgba(255,255,255,0.98);box-shadow:0 18px 34px rgba(15,15,15,0.08);backdrop-filter:blur(12px);">' +
      '<div class="min-w-0 flex items-center gap-4" style="flex:1 1 auto;min-width:0;">' +
      '<div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-muted/20"><img src="' + escapeHtml(primaryImage) + '" alt="' + escapeHtml(lot.title) + '" class="h-full w-full object-cover" /></div>' +
      '<div class="min-w-0">' +
      '<p class="truncate font-serif" style="font-size:1.15rem;line-height:1.15;">' + escapeHtml(lot.title) + "</p>" +
      '<p class="truncate text-sm text-muted-foreground" style="margin-top:4px;max-width:56rem;">' + escapeHtml(stripHtml(lot.description || "").slice(0, 140) || categoryName) + "</p>" +
      "</div>" +
      "</div>" +
      '<div class="hidden shrink-0 items-center gap-8 md:flex" style="flex:0 0 auto;">' +
      '<div class="text-right"><p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">' + escapeHtml(strings.productPage.currentBid) + '</p><p class="mt-1 text-[2rem] font-semibold leading-none tabular-nums">' + formatCurrency(lot.current_bid || 0) + "</p></div>" +
      '<a href="' + BASE_PATH + 'bidding/index.html?slug=' + encodeURIComponent(lot.slug || "") + '" class="inline-flex items-center justify-center rounded-xl bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90" style="min-width:132px;">' + escapeHtml(strings.productPage.placeBid) + "</a>" +
      "</div>" +
      "</div></div></div>" +

      '<section class="border-b bg-background"><div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4"><div class="flex items-center gap-2 text-sm text-muted-foreground">' +
      '<a class="hover:text-foreground transition-colors" href="../auctions.html">' + escapeHtml(strings.nav.shopAll) + "</a>" +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m9 18 6-6-6-6"></path></svg>' +
      '<span class="truncate text-foreground font-medium">' + escapeHtml(lot.title) + "</span>" +
      "</div></div></section>" +

      '<section class="py-8 sm:py-12 lg:py-16"><div class="container mx-auto px-4 sm:px-6 lg:px-8"><div class="lot-shell">' +
      '<div class="lot-two-col">' +

      '<div class="lot-left-col space-y-10">' +
      '<div class="space-y-6">' +
      '<div class="overflow-hidden rounded-xl border border-border/50 bg-muted/20">' +
      '<div class="aspect-[4/5] sm:aspect-square"><img id="lot-primary-image" src="' + escapeHtml(primaryImage) + '" alt="' + escapeHtml(lot.title) + '" class="h-full w-full object-cover" /></div>' +
      "</div>" +

      (images.length > 1
        ? '<div class="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-5">' +
          images.map(function (image, index) {
            return (
              '<button type="button" class="lot-thumb overflow-hidden rounded-md border border-border/50 bg-background transition-all hover:border-foreground/40" data-image-src="' + escapeHtml(image.image_url) + '">' +
              '<div class="aspect-square"><img src="' + escapeHtml(image.image_url) + '" alt="' + escapeHtml(lot.title + " " + (index + 1)) + '" class="h-full w-full object-cover" /></div>' +
              "</button>"
            );
          }).join("") +
          "</div>"
        : "") +
      "</div>" +

      '<div class="space-y-8 border-t border-border/40 pt-8">' +
      '<div><p class="text-xs uppercase tracking-[0.24em] text-muted-foreground">' + escapeHtml(strings.productPage.lotDetails) + '</p><h2 class="mt-2 font-serif text-3xl sm:text-4xl">' + escapeHtml(lot.title) + "</h2></div>" +
      '<div class="space-y-6">' +
      '<div class="rounded-xl border border-border/50 bg-background p-6 sm:p-8">' +
      '<h3 class="font-serif text-2xl mb-4">' + escapeHtml(strings.productPage.description) + "</h3>" +
      '<div class="prose prose-neutral max-w-none text-sm sm:text-base text-foreground">' + description + "</div>" +
      "</div>" +

      '<div class="rounded-xl border border-border/50 bg-background p-6 sm:p-8">' +
      '<h3 class="font-serif text-2xl mb-4">' + escapeHtml(strings.productPage.conditionReport) + "</h3>" +
      '<div class="prose prose-neutral max-w-none text-sm sm:text-base text-foreground">' + (condition || "<p>Condition details are not available.</p>") + "</div>" +
      "</div>" +

      '<div class="rounded-xl border border-border/50 bg-background p-6 sm:p-8">' +
      '<h3 class="font-serif text-2xl mb-4">' + escapeHtml(strings.productPage.provenance) + "</h3>" +
      '<div class="prose prose-neutral max-w-none text-sm sm:text-base text-foreground">' + (provenance || "<p>Provenance information is not available for this lot.</p>") + "</div>" +
      "</div>" +

      "</div>" +
      "</div>" +
      "</div>" +

      '<div class="lot-right-col lot-sticky-col">' +
      '<div class="space-y-5">' +
      '<div class="flex items-center gap-2">' +
      '<button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background text-foreground transition-all hover:bg-accent" aria-label="Save lot">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' +
      "</button>" +
      '<div class="inline-flex h-10 items-center gap-3 rounded-xl border border-border/60 bg-background px-4 text-sm text-foreground">' +
      '<span>' + escapeHtml(strings.productPage.freeExpressDelivery) + '</span>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><rect width="8" height="7" x="3" y="11" rx="1"></rect><path d="M11 12h4l3 3v3h-7"></path><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path><path d="M17 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path></svg>' +
      "</div>" +
      "</div>" +

      '<div class="space-y-3">' +
      '<h1 class="font-serif text-[3.25rem] leading-[1.08] tracking-[-0.03em]">' + escapeHtml(lot.title) + "</h1>" +
      '<p class="max-w-[34rem] text-[15px] leading-8 text-muted-foreground">' + escapeHtml(shortDescription) + "</p>" +
      "</div>" +

      '<div class="space-y-5 border-t border-border/50 pt-5">' +
      '<div class="flex items-start justify-between gap-4 text-sm text-muted-foreground">' +
      '<div class="space-y-1">' +
      '<div>Ending in: <span data-end-time="' + escapeHtml(lot.end_time) + '">' + getCountdown(lot.end_time) + "</span></div>" +
      '<div class="flex items-center gap-2 ' + (closed ? 'text-red-600' : 'text-foreground') + '">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>' +
      '<span class="font-medium">' + escapeHtml(getStatusLabel(lot, strings)) + "</span>" +
      "</div>" +
      "</div>" +
      '<div class="pt-1 text-right">' + escapeHtml(String(bids.length)) + " bids</div>" +
      "</div>" +

      '<div class="border-b border-border/50 pb-5">' +
      '<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">' + escapeHtml(strings.productPage.estimate) + '</p>' +
      '<p class="mt-2 text-[2.05rem] font-semibold tracking-[-0.02em]">' + escapeHtml(estimate) + "</p>" +
      "</div>" +

      '<div class="border-b border-border/50 pb-5">' +
      '<p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">' + escapeHtml(strings.productPage.currentBid) + "</p>" +
      '<p class="mt-2 text-[3.2rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">' + formatCurrency(lot.current_bid || 0) + "</p>" +
      '<p class="mt-4 max-w-[26rem] text-sm leading-7 text-muted-foreground">' + escapeHtml(strings.product.noBidPaymentRequired) + "</p>" +
      "</div>" +

      '<div class="grid gap-3 sm:grid-cols-2">' +
      '<a href="' + BASE_PATH + 'bidding/index.html?slug=' + encodeURIComponent(lot.slug || "") + '" class="inline-flex h-11 w-full items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition-all hover:opacity-90">' + escapeHtml(strings.productPage.placeBid) + "</a>" +
      '<button type="button" data-open-bid-history class="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 text-sm font-medium transition-all hover:bg-accent">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m7 7 10 10"></path><path d="M17 7v10H7"></path></svg>' +
      '<span>' + escapeHtml(strings.productPage.viewBidHistory) + "</span>" +
      "</button>" +
      "</div>" +

      '<button type="button" disabled class="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#9f9f9f] px-6 text-lg font-medium text-white cursor-default">' + escapeHtml(strings.bid.auctionEnded + " - Bidding Closed") + "</button>" +

      '<div class="grid grid-cols-2 gap-6 border-t border-border/50 pt-5">' +
      '<div class="flex items-start gap-3">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 text-muted-foreground"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path></svg>' +
      '<div><p class="text-sm font-medium">' + escapeHtml(strings.productPage.authenticity) + '</p><p class="text-sm text-muted-foreground">' + escapeHtml(strings.productPage.guaranteed) + "</p></div>" +
      "</div>" +
      '<div class="flex items-start gap-3">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 text-muted-foreground"><rect width="16" height="12" x="4" y="6" rx="2"></rect><path d="M4 10h16"></path></svg>' +
      '<div><p class="text-sm font-medium">' + escapeHtml(strings.productPage.securePayment) + '</p><p class="text-sm text-muted-foreground">' + escapeHtml(strings.productPage.protected) + "</p></div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div></div></div></section>" +

      '<section class="py-8 sm:py-12 lg:py-16 bg-background" data-no-translate="true"><div class="container mx-auto px-4 sm:px-6 lg:px-8">' +
      '<div class="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3"><div class="w-full sm:w-auto"><h2 id="lot-related-title" class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif mb-1 sm:mb-2 text-balance" data-no-translate="true">You May Also Like</h2><p id="lot-related-subtitle" class="text-xs sm:text-sm md:text-base text-muted-foreground" data-no-translate="true">Handpicked lots you may want to explore next</p></div><a class="text-xs sm:text-sm font-medium hover:underline underline-offset-4 flex items-center gap-1 transition-all whitespace-nowrap" href="../auctions.html" data-no-translate="true">View All<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 sm:h-4 sm:w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a></div>' +
      '<div class="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style="scrollbar-width:none;-ms-overflow-style:none">' + relatedLots.map(function (item) { return renderRelatedCard(item, strings); }).join("") + "</div>" +
      "</div></section>" +

      '<div id="lot-bid-history-modal" class="hidden fixed inset-0 z-[170]">' +
      '<div data-bid-history-backdrop class="absolute inset-0 bg-black/45"></div>' +
      '<div class="absolute inset-0 flex items-center justify-center p-4">' +
      '<div class="w-full max-w-4xl rounded-2xl border border-border/50 bg-background shadow-2xl">' +
      '<div class="flex items-start justify-between gap-4 border-b border-border/40 px-6 py-5 sm:px-8">' +
      '<div><h2 class="font-serif text-2xl">' + escapeHtml(strings.productPage.bidHistory) + '</h2><p class="mt-2 text-sm text-muted-foreground">' + escapeHtml(strings.productPage.bidHistoryDesc) + "</p></div>" +
      '<button type="button" data-close-bid-history class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-lg leading-none transition-all hover:bg-accent" aria-label="Close">×</button>' +
      "</div>" +
      '<div class="max-h-[70vh] overflow-auto px-6 py-5 sm:px-8">' +
      '<div class="overflow-x-auto"><table class="w-full min-w-[500px]"><thead><tr class="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground"><th class="pb-3 pr-4">' + escapeHtml(strings.productPage.bidder) + '</th><th class="pb-3 pr-4">' + escapeHtml(strings.productPage.bidAmount) + '</th><th class="pb-3 pr-4">' + escapeHtml(strings.productPage.time) + '</th><th class="pb-3">' + escapeHtml(strings.productPage.increase) + "</th></tr></thead><tbody>" + renderBidRows(bids, lot) + "</tbody></table></div>" +
      "</div></div></div></div>" +

      '<div id="lot-place-bid-modal" class="hidden fixed inset-0 z-[175]">' +
      '<div data-place-bid-backdrop class="absolute inset-0 bg-black/45"></div>' +
      '<div class="absolute inset-0 overflow-auto"><div class="min-h-full flex items-center justify-center p-4 sm:p-6">' +
      '<div class="w-full max-w-6xl rounded-2xl border border-border/50 bg-background shadow-2xl">' +
      '<div class="flex items-start justify-between gap-4 border-b border-border/40 px-6 py-5 sm:px-8">' +
      '<div><h2 class="font-serif text-2xl">' + escapeHtml(strings.bidding.title) + '</h2><p class="mt-2 text-sm text-muted-foreground">' + escapeHtml(strings.bidding.subtitle) + '</p></div>' +
      '<button type="button" data-close-place-bid class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-lg leading-none transition-all hover:bg-accent" aria-label="' + escapeHtml(strings.common.close) + '">×</button>' +
      "</div>" +
      '<div class="grid gap-0 lg:grid-cols-[1.1fr_0.72fr]">' +
      '<div class="border-b border-border/40 p-6 sm:p-8 lg:border-b-0 lg:border-r">' +
      '<div class="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">' +
      '<span data-place-bid-step-pill="1" class="rounded-full border border-border px-3 py-1 font-medium bg-foreground text-background">' + escapeHtml(strings.bidding.step1) + '</span>' +
      '<span data-place-bid-step-pill="2" class="rounded-full border border-border px-3 py-1">' + escapeHtml(strings.bidding.step2) + '</span>' +
      '<span data-place-bid-step-pill="3" class="rounded-full border border-border px-3 py-1">' + escapeHtml(strings.bidding.step3) + '</span>' +
      "</div>" +
      '<div class="mt-8" data-place-bid-step="1">' +
      '<h3 class="font-serif text-3xl">' + escapeHtml(strings.bidding.selectBidAmount) + '</h3>' +
      '<p class="mt-3 text-sm text-muted-foreground">' + escapeHtml(strings.bidding.selectPreset) + '</p>' +
      '<div class="mt-6 grid gap-3 sm:grid-cols-2">' +
      '<button type="button" data-bid-choice class="rounded-xl border border-border bg-background px-5 py-4 text-left transition-all hover:border-foreground/30" data-bid-amount="' + escapeHtml(String(minimumBid)) + '"><div class="text-xs uppercase tracking-[0.18em] text-muted-foreground">' + escapeHtml(strings.bidding.minimumBid) + '</div><div class="mt-2 text-2xl font-semibold tabular-nums">' + formatCurrency(minimumBid) + '</div></button>' +
      '<button type="button" data-bid-choice class="rounded-xl border border-border bg-background px-5 py-4 text-left transition-all hover:border-foreground/30" data-bid-amount="' + escapeHtml(String(minimumBid + 250)) + '"><div class="text-xs uppercase tracking-[0.18em] text-muted-foreground">+ 250 EUR</div><div class="mt-2 text-2xl font-semibold tabular-nums">' + formatCurrency(minimumBid + 250) + '</div></button>' +
      '<button type="button" data-bid-choice class="rounded-xl border border-border bg-background px-5 py-4 text-left transition-all hover:border-foreground/30" data-bid-amount="' + escapeHtml(String(minimumBid + 500)) + '"><div class="text-xs uppercase tracking-[0.18em] text-muted-foreground">+ 500 EUR</div><div class="mt-2 text-2xl font-semibold tabular-nums">' + formatCurrency(minimumBid + 500) + '</div></button>' +
      '<button type="button" data-bid-choice class="rounded-xl border border-border bg-background px-5 py-4 text-left transition-all hover:border-foreground/30" data-bid-amount="' + escapeHtml(String(minimumBid + 1000)) + '"><div class="text-xs uppercase tracking-[0.18em] text-muted-foreground">+ 1000 EUR</div><div class="mt-2 text-2xl font-semibold tabular-nums">' + formatCurrency(minimumBid + 1000) + '</div></button>' +
      "</div>" +
      '<div class="mt-6">' +
      '<label class="text-sm font-medium" for="place-bid-custom-amount">' + escapeHtml(strings.bidding.customAmount) + '</label>' +
      '<input id="place-bid-custom-amount" data-place-bid-custom-input type="number" min="' + escapeHtml(String(minimumBid)) + '" step="50" value="' + escapeHtml(String(minimumBid)) + '" class="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30" placeholder="' + escapeHtml(strings.bidding.enterCustomBid) + '"/>' +
      "</div>" +
      '<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">' +
      '<p class="text-sm text-muted-foreground">' + escapeHtml(strings.product.noBidPaymentRequired) + '</p>' +
      '<button type="button" data-place-bid-next class="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition-all hover:opacity-90">' + escapeHtml(strings.bidding.confirmBid) + "</button>" +
      "</div>" +
      "</div>" +
      '<div class="mt-8 hidden" data-place-bid-step="2">' +
      '<h3 class="font-serif text-3xl">' + escapeHtml(strings.bidding.bidderInformation) + '</h3>' +
      '<div class="mt-6 grid gap-4 sm:grid-cols-2">' +
      '<input data-place-bid-field type="text" placeholder="' + escapeHtml(strings.bidding.firstName) + '" class="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30"/>' +
      '<input data-place-bid-field type="text" placeholder="' + escapeHtml(strings.bidding.lastName) + '" class="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30"/>' +
      '<input data-place-bid-field type="email" placeholder="' + escapeHtml(strings.bidding.emailPlaceholder) + '" class="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30"/>' +
      '<input data-place-bid-field type="tel" placeholder="' + escapeHtml(strings.bidding.phone) + '" class="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30"/>' +
      '<input data-place-bid-field type="text" placeholder="' + escapeHtml(strings.bidding.addressLine1) + '" class="sm:col-span-2 h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30"/>' +
      '<input data-place-bid-field type="text" placeholder="' + escapeHtml(strings.bidding.city) + '" class="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30"/>' +
      '<input data-place-bid-field type="text" placeholder="' + escapeHtml(strings.bidding.country) + '" class="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none transition-all focus:border-foreground/30"/>' +
      "</div>" +
      '<div class="mt-8 flex items-center justify-between gap-3">' +
      '<button type="button" data-place-bid-back class="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium transition-all hover:bg-accent">' + escapeHtml(strings.common.back) + '</button>' +
      '<button type="button" data-place-bid-next class="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition-all hover:opacity-90">' + escapeHtml(strings.bidding.continueToPayment) + "</button>" +
      "</div>" +
      "</div>" +
      '<div class="mt-8 hidden" data-place-bid-step="3">' +
      '<h3 class="font-serif text-3xl">' + escapeHtml(strings.bidding.selectPaymentMethod) + '</h3>' +
      '<div class="mt-6 rounded-2xl border border-border/50 bg-muted/20 p-5">' +
      '<div class="flex items-start gap-4">' +
      '<div class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-background border border-border/50"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path></svg></div>' +
      '<div><p class="font-medium">' + escapeHtml(strings.bidding.creditOrDebitCard) + '</p><p class="mt-1 text-sm text-muted-foreground">' + escapeHtml(strings.bidding.visaMastercard) + " · " + escapeHtml(strings.bidding.fastAndSecure) + '</p></div>' +
      "</div>" +
      '<p class="mt-5 text-sm leading-6 text-muted-foreground">' + escapeHtml(strings.bidding.securePaymentDescription) + "</p>" +
      "</div>" +
      '<div class="mt-8 flex items-center justify-between gap-3">' +
      '<button type="button" data-place-bid-back class="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium transition-all hover:bg-accent">' + escapeHtml(strings.common.back) + '</button>' +
      '<button type="button" data-place-bid-submit class="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition-all hover:opacity-90">' + escapeHtml(strings.bidding.completePayment) + "</button>" +
      "</div>" +
      "</div>" +
      '<div class="mt-8 hidden text-center" data-place-bid-step="4">' +
      '<div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><path d="m9 12 2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg></div>' +
      '<h3 class="mt-6 font-serif text-3xl">' + escapeHtml(strings.bidding.thankYou) + '</h3>' +
      '<p class="mt-3 text-sm text-muted-foreground">' + escapeHtml(strings.product.noBidPaymentRequired) + '</p>' +
      '<button type="button" data-close-place-bid class="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white transition-all hover:opacity-90">' + escapeHtml(strings.common.close) + "</button>" +
      "</div>" +
      "</div>" +
      '<aside class="bg-secondary/20 p-6 sm:p-8">' +
      '<p class="text-xs uppercase tracking-[0.18em] text-muted-foreground">' + escapeHtml(strings.bidding.bidSummary) + '</p>' +
      '<div class="mt-5 overflow-hidden rounded-2xl border border-border/50 bg-background">' +
      '<div class="flex items-center gap-4 border-b border-border/40 p-4">' +
      '<div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted/20"><img src="' + escapeHtml(primaryImage) + '" alt="' + escapeHtml(lot.title) + '" class="h-full w-full object-cover"/></div>' +
      '<div class="min-w-0"><p class="line-clamp-2 font-serif text-lg leading-tight">' + escapeHtml(lot.title) + '</p><p class="mt-1 text-sm text-muted-foreground">' + escapeHtml(categoryName) + '</p></div>' +
      "</div>" +
      '<div class="space-y-4 p-4 text-sm">' +
      '<div class="flex items-center justify-between gap-4"><span class="text-muted-foreground">' + escapeHtml(strings.bidding.currentBid) + '</span><span class="font-medium tabular-nums">' + formatCurrency(lot.current_bid || 0) + '</span></div>' +
      '<div class="flex items-center justify-between gap-4"><span class="text-muted-foreground">' + escapeHtml(strings.bidding.minimumBid) + '</span><span class="font-medium tabular-nums">' + formatCurrency(minimumBid) + '</span></div>' +
      '<div class="flex items-center justify-between gap-4"><span class="text-muted-foreground">' + escapeHtml(strings.bidding.yourBid) + '</span><span data-place-bid-summary class="font-semibold tabular-nums">' + formatCurrency(minimumBid) + '</span></div>' +
      '<div class="rounded-xl bg-muted/30 p-4"><p class="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">' + escapeHtml(strings.bidding.authorizationHold) + '</p><p class="mt-2 font-medium">' + escapeHtml(strings.bidding.dueNow) + ': ' + formatCurrency(minimumBid) + '</p><p class="mt-2 text-xs leading-5 text-muted-foreground">' + escapeHtml(strings.bidding.authHoldDescription) + '</p></div>' +
      '<p class="text-xs leading-5 text-muted-foreground">' + escapeHtml(strings.bidding.agreeToTerms) + ' <span class="underline">' + escapeHtml(strings.bidding.termsOfSale) + '</span>.</p>' +
      "</div>" +
      "</div>" +
      "</aside>" +
      "</div></div></div></div></div>";

    updateCountdowns(main);
    wireGallery(main);
    wireStickySummary(main);
    wireBidHistoryModal(main);
    wirePlaceBidModal(main, lot, minimumBid, strings);
    var relatedTitle = document.getElementById("lot-related-title");
    var relatedSubtitle = document.getElementById("lot-related-subtitle");
    if (relatedTitle) relatedTitle.textContent = "You May Also Like";
    if (relatedSubtitle) relatedSubtitle.textContent = "Handpicked lots you may want to explore next";
  }

  function wireGallery(scope) {
    var primary = scope.querySelector("#lot-primary-image");
    if (!primary) return;
    scope.querySelectorAll(".lot-thumb").forEach(function (button) {
      button.addEventListener("click", function () {
        primary.src = button.getAttribute("data-image-src");
      });
    });
  }

  function updateCountdowns(scope) {
    scope.querySelectorAll("[data-end-time]").forEach(function (node) {
      node.textContent = getCountdown(node.getAttribute("data-end-time"));
    });
  }

  function wireStickySummary(scope) {
    var stickyBar = document.getElementById("lot-sticky-bar");
    var heroSection = scope.querySelector("section.py-8");
    if (!stickyBar || !heroSection) return;

    function updateStickyBar() {
      var rect = heroSection.getBoundingClientRect();
      var shouldShow = rect.bottom <= 140;
      stickyBar.style.opacity = shouldShow ? "1" : "0";
      stickyBar.style.transform = shouldShow ? "translateY(0)" : "translateY(-12px)";
      stickyBar.style.pointerEvents = shouldShow ? "auto" : "none";
    }

    updateStickyBar();
    window.addEventListener("scroll", updateStickyBar, { passive: true });
    window.addEventListener("resize", updateStickyBar);
  }

  function wireBidHistoryModal(scope) {
    var modal = document.getElementById("lot-bid-history-modal");
    if (!modal) return;

    var openButtons = scope.querySelectorAll("[data-open-bid-history]");
    var closeButton = modal.querySelector("[data-close-bid-history]");
    var backdrop = modal.querySelector("[data-bid-history-backdrop]");

    function openModal() {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openModal);
    });

    if (closeButton) closeButton.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
      }
    });
  }

  function wirePlaceBidModal(scope, lot, minimumBid, strings) {
    var modal = document.getElementById("lot-place-bid-modal");
    if (!modal) return;

    var selectedBid = minimumBid;
    var currentStep = 1;
    var openButtons = scope.querySelectorAll("[data-open-place-bid]");
    var closeButtons = modal.querySelectorAll("[data-close-place-bid]");
    var backdrop = modal.querySelector("[data-place-bid-backdrop]");
    var customInput = modal.querySelector("[data-place-bid-custom-input]");
    var summaryNodes = modal.querySelectorAll("[data-place-bid-summary]");
    var stepNodes = modal.querySelectorAll("[data-place-bid-step]");
    var pillNodes = modal.querySelectorAll("[data-place-bid-step-pill]");
    var nextButtons = modal.querySelectorAll("[data-place-bid-next]");
    var backButtons = modal.querySelectorAll("[data-place-bid-back]");
    var submitButton = modal.querySelector("[data-place-bid-submit]");

    function updateSummary() {
      summaryNodes.forEach(function (node) {
        node.textContent = formatCurrency(selectedBid);
      });
    }

    function renderStep() {
      stepNodes.forEach(function (node) {
        var step = Number(node.getAttribute("data-place-bid-step"));
        node.classList.toggle("hidden", step !== currentStep);
      });
      pillNodes.forEach(function (node) {
        var step = Number(node.getAttribute("data-place-bid-step-pill"));
        node.classList.toggle("bg-foreground", step === currentStep);
        node.classList.toggle("text-background", step === currentStep);
      });
    }

    function openModal() {
      currentStep = 1;
      selectedBid = Math.max(Number(customInput && customInput.value) || minimumBid, minimumBid);
      updateSummary();
      renderStep();
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openModal);
    });

    modal.querySelectorAll("[data-bid-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectedBid = Math.max(Number(button.getAttribute("data-bid-amount")) || minimumBid, minimumBid);
        if (customInput) customInput.value = String(selectedBid);
        updateSummary();
        modal.querySelectorAll("[data-bid-choice]").forEach(function (choice) {
          choice.classList.remove("border-foreground", "ring-1", "ring-foreground/20");
        });
        button.classList.add("border-foreground", "ring-1", "ring-foreground/20");
      });
    });

    if (customInput) {
      customInput.addEventListener("input", function () {
        selectedBid = Math.max(Number(customInput.value) || minimumBid, minimumBid);
        updateSummary();
      });
    }

    nextButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (currentStep < 3) {
          currentStep += 1;
          renderStep();
          return;
        }
      });
    });

    backButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentStep = Math.max(1, currentStep - 1);
        renderStep();
      });
    });

    if (submitButton) {
      submitButton.addEventListener("click", function () {
        currentStep = 4;
        renderStep();
      });
    }

    closeButtons.forEach(function (button) {
      button.addEventListener("click", closeModal);
    });
    if (backdrop) backdrop.addEventListener("click", closeModal);

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
      }
    });
  }

  function init() {
    var main = document.querySelector("main");
    if (!main) return;

    loadJson(BASE_PATH + "data/site-translations.json")
      .then(function (translations) {
        var language = getLanguage();
        var strings = mapStrings(translations, language);
        var slug = getQueryParam("slug");

        if (!slug) {
          renderNotFound(main);
          return;
        }

        main.innerHTML =
          '<section class="py-16 sm:py-24"><div class="container mx-auto px-4 sm:px-6 lg:px-8"><div class="text-center text-muted-foreground">' +
          escapeHtml(strings.common.loadingLotDetails) +
          "</div></div></section>";

        var lotSelect = encodeURIComponent("*,lot_images(*),categories(name,slug),lot_translations(*)");
        var lotFilter = encodeURIComponent("eq." + slug);

        return requestSupabase("/rest/v1/lots?select=" + lotSelect + "&slug=" + lotFilter + "&limit=1")
          .then(function (lots) {
            var rawLot = lots && lots[0];
            if (!rawLot) {
              renderNotFound(main);
              return null;
            }

            var lot = normalizeLotTranslation(rawLot, language);
            var bidsPath =
              "/rest/v1/bids?select=*&lot_id=eq." +
              encodeURIComponent(rawLot.id) +
              "&order=created_at.desc&limit=12";
            var relatedSelect = encodeURIComponent("id,slug,title,current_bid,starting_bid,end_time,category_id,lot_images(*),categories(name,slug),lot_translations(*)");
            var relatedPath =
              "/rest/v1/lots?select=" +
              relatedSelect +
              "&category_id=eq." +
              encodeURIComponent(rawLot.category_id) +
              "&id=neq." +
              encodeURIComponent(rawLot.id) +
              "&order=created_at.desc&limit=12";

            return Promise.all([requestSupabase(bidsPath), requestSupabase(relatedPath)]).then(function (results) {
              var bids = results[0] || [];
              var relatedLots = (results[1] || []).map(function (item) {
                return normalizeLotTranslation(item, language);
              });
              renderLot(main, lot, relatedLots, bids, strings);
              setInterval(function () {
                updateCountdowns(main);
              }, 1000);
            });
          })
          .catch(function () {
            renderNotFound(main);
            return null;
          });
      })
      .catch(function () {
        renderNotFound(main);
      });
  }

  init();
})();
