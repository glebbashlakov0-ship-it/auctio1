(function () {
  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatCurrency(value) {
    return "EUR " + Number(value || 0).toLocaleString("en-US");
  }

  function getLotHref(item) {
    return "lot/index.html?slug=" + encodeURIComponent(item.slug || "");
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

  function renderCard(item) {
    return (
      '<a href="' + getLotHref(item) + '" class="block h-full"><div class="border border-border/50 bg-background rounded-lg overflow-hidden h-full flex flex-col group hover:border-foreground/30 transition-colors">' +
      '<div class="relative aspect-square overflow-hidden bg-muted/20 rounded-t-lg">' +
      '<img src="' +
      escapeHtml(item.image) +
      '" alt="' +
      escapeHtml(item.title) +
      '" class="w-full h-full object-cover pointer-events-none select-none" draggable="false"/>' +
      '<div class="absolute top-1 right-1 bg-background/95 backdrop-blur-sm rounded-full px-1 py-0.5 flex items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-2 w-2 sm:h-2.5 sm:w-2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span class="text-[8px] sm:text-[9px] font-medium" data-end-time="' +
      escapeHtml(item.endTime) +
      '">' +
      getCountdown(item.endTime) +
      "</span></div></div>" +
      '<div class="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 flex-1 flex flex-col">' +
      '<span class="text-[8px] sm:text-[9px] uppercase tracking-wider bg-muted/50 border border-border/50 px-1 py-0.5 w-fit rounded">' +
      escapeHtml(item.category || "General") +
      "</span>" +
      '<h3 class="font-serif text-[10px] sm:text-xs leading-tight line-clamp-2 h-[28px] sm:h-[32px]">' +
      escapeHtml(item.title) +
      '</h3><div class="flex items-center gap-0.5 sm:gap-1 py-0.5 sm:py-1 px-1 sm:px-1.5 bg-muted/30 rounded text-[9px] sm:text-[10px] font-medium"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span class="font-semibold" data-end-time="' +
      escapeHtml(item.endTime) +
      '">' +
      getCountdown(item.endTime) +
      '</span></div><div><p class="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wider">Current Bid</p><p class="text-xs sm:text-sm font-semibold tabular-nums">' +
      formatCurrency(item.currentBid) +
      '</p></div><span class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[9px] sm:text-[10px] font-medium transition-all border bg-transparent h-6 sm:h-7 mt-auto w-full hover:bg-foreground hover:text-background">View Auction</span></div></div></a>'
    );
  }

  function getStatus(item) {
    var diff = new Date(item.endTime).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) return "closed";
    if (diff <= 48 * 60 * 60 * 1000) return "ending-soon";
    return "active";
  }

  function getTopLevelCategory(item) {
    var rawCategory = String(item.category || "").toLowerCase();
    var haystack = (String(item.title || "") + " " + rawCategory).toLowerCase();

    if (
      rawCategory === "watches" ||
      rawCategory === "rolex" ||
      rawCategory === "patek philippe" ||
      rawCategory === "cartier" ||
      rawCategory === "audemars piguet" ||
      rawCategory === "vacheron constantin" ||
      haystack.includes("watch")
    ) {
      return "watches";
    }

    if (
      rawCategory === "handbag" ||
      rawCategory === "hermès" ||
      rawCategory === "chanel" ||
      rawCategory === "louis vuitton" ||
      rawCategory === "goyard" ||
      rawCategory === "apparel" ||
      rawCategory === "precious accessory" ||
      rawCategory === "sneaker" ||
      haystack.includes("bag") ||
      haystack.includes("birkin") ||
      haystack.includes("kelly") ||
      haystack.includes("handbag") ||
      haystack.includes("wallet") ||
      haystack.includes("sneaker")
    ) {
      return "bags-fashion";
    }

    if (
      rawCategory === "earring" ||
      rawCategory === "ring" ||
      rawCategory === "bracelet" ||
      rawCategory === "necklace" ||
      rawCategory === "brooch" ||
      rawCategory === "jewelry" ||
      haystack.includes("earring") ||
      haystack.includes("earclip") ||
      haystack.includes("ring") ||
      haystack.includes("bracelet") ||
      haystack.includes("necklace") ||
      haystack.includes("brooch") ||
      haystack.includes("diamond") ||
      haystack.includes("sapphire")
    ) {
      return "jewelry";
    }

    if (
      rawCategory === "spirits" ||
      rawCategory === "weller" ||
      rawCategory === "van winkle" ||
      rawCategory === "old fitzgerald" ||
      rawCategory === "george t. stagg" ||
      rawCategory === "four roses" ||
      rawCategory === "elijah craig" ||
      rawCategory === "elmer t." ||
      rawCategory === "sazerac" ||
      haystack.includes("whisky") ||
      haystack.includes("whiskey") ||
      haystack.includes("bourbon") ||
      haystack.includes("scotch")
    ) {
      return "spirits";
    }

    if (
      rawCategory === "books & manuscripts" ||
      rawCategory === "pen" ||
      haystack.includes("manuscript") ||
      haystack.includes("book") ||
      haystack.includes("edition") ||
      haystack.includes("harry potter") ||
      haystack.includes("bond")
    ) {
      return "collectibles-more";
    }

    if (
      rawCategory === "collectible" ||
      rawCategory === "vintage poster" ||
      rawCategory === "photographs" ||
      rawCategory === "decor" ||
      haystack.includes("poster") ||
      haystack.includes("collectible") ||
      haystack.includes("record") ||
      haystack.includes("t-shirt") ||
      haystack.includes("movie") ||
      haystack.includes("photograph")
    ) {
      return "collectibles-more";
    }

    if (
      rawCategory === "painting" ||
      rawCategory === "work on paper" ||
      rawCategory === "sculpture" ||
      haystack.includes("painting") ||
      haystack.includes("canvas") ||
      haystack.includes("oil on") ||
      haystack.includes("watercolor") ||
      haystack.includes("sculpture")
    ) {
      return "fine-art";
    }

    if (haystack.includes("abstract") || haystack.includes("contemporary")) {
      return "contemporary-art";
    }

    if (rawCategory === "decor" || haystack.includes("chair") || haystack.includes("furniture") || haystack.includes("lamp")) {
      return "furniture-decor";
    }

    return "collectibles-more";
  }

  function updateCountdowns(scope) {
    scope.querySelectorAll("[data-end-time]").forEach(function (node) {
      node.textContent = getCountdown(node.getAttribute("data-end-time"));
    });
  }

  function renderFeatured(items) {
    var main = document.querySelector("main.flex-1");
    if (!main) return;

    var howItWorksHeading = Array.from(main.querySelectorAll("h2")).find(function (node) {
      return node.textContent.trim() === "How It Works";
    });
    var howItWorksSection = howItWorksHeading && howItWorksHeading.closest("section");
    if (!howItWorksSection) return;

    var existingHeading = Array.from(main.querySelectorAll("h2")).find(function (node) {
      return node.textContent.trim() === "Featured Auctions";
    });
    var existingSection = existingHeading && existingHeading.closest("section");

    if (!existingSection) {
      howItWorksSection.insertAdjacentHTML(
        "beforebegin",
        '<section class="py-8 sm:py-12 lg:py-16 bg-background" data-featured-auctions-section="true">' +
          '<div class="container mx-auto px-4 sm:px-6 lg:px-8">' +
            '<div class="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">' +
              '<div class="w-full sm:w-auto">' +
                '<h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif mb-1 sm:mb-2 text-balance">Featured Auctions</h2>' +
                '<p class="text-xs sm:text-sm md:text-base text-muted-foreground">Curated Selection of Exceptional Pieces</p>' +
              "</div>" +
              '<a class="text-xs sm:text-sm font-medium hover:underline underline-offset-4 flex items-center gap-1 transition-all whitespace-nowrap" href="auctions.html">View All<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right h-3 w-3 sm:h-4 sm:w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>' +
            '</div>' +
            '<div class="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style="scrollbar-width:none;-ms-overflow-style:none"></div>' +
          "</div>" +
        "</section>"
      );
      existingSection = howItWorksSection.previousElementSibling;
    }

    existingSection.className = "py-8 sm:py-12 lg:py-16 bg-background";

    var row =
      existingSection &&
      existingSection.querySelector('.flex.gap-3.sm\\:gap-4.overflow-x-auto.pb-4.scrollbar-hide.snap-x.snap-mandatory');
    if (!row) return;

    row.innerHTML = items
      .slice(0, 8)
      .map(function (item) {
        return '<div class="flex-shrink-0 w-[240px] md:w-[260px] snap-start">' + renderCard(item) + "</div>";
      })
      .join("");

    updateCountdowns(row);
  }

  function takeUnique(items, limit) {
    var seen = new Set();
    return items.filter(function (item) {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).slice(0, limit);
  }

  function pickLandingSectionItems(items, headingText) {
    var normalizedHeading = headingText.toLowerCase();

    if (normalizedHeading === "watches") {
      return takeUnique(
        items.filter(function (item) {
          var haystack = (item.title + " " + item.category).toLowerCase();
          return haystack.includes("watch") || item.category === "Watches";
        }),
        10
      );
    }

    if (normalizedHeading === "handbag") {
      return takeUnique(
        items.filter(function (item) {
          var haystack = (item.title + " " + item.category).toLowerCase();
          return (
            haystack.includes("bag") ||
            haystack.includes("birkin") ||
            haystack.includes("kelly") ||
            haystack.includes("flap") ||
            haystack.includes("handbag") ||
            item.category === "Handbag" ||
            item.category === "Hermès" ||
            item.category === "Chanel" ||
            item.category === "Louis Vuitton"
          );
        }),
        10
      );
    }

    if (normalizedHeading === "earring") {
      return takeUnique(
        items.filter(function (item) {
          var haystack = (item.title + " " + item.category).toLowerCase();
          return haystack.includes("earring") || haystack.includes("earclip") || item.category === "Earring";
        }),
        10
      );
    }

    if (normalizedHeading === "books & manuscripts") {
      return takeUnique(
        items.filter(function (item) {
          return item.category === "Books & Manuscripts";
        }),
        10
      );
    }

    if (normalizedHeading === "collectible") {
      return takeUnique(
        items.filter(function (item) {
          return item.category === "Collectible";
        }),
        10
      );
    }

    return [];
  }

  function renderLandingCategorySections(items) {
    var headings = Array.from(document.querySelectorAll("h2"));

    headings.forEach(function (heading) {
      var headingText = heading.textContent.trim();
      var sectionItems = pickLandingSectionItems(items, headingText);
      if (!sectionItems.length) return;

      var section = heading.closest("section");
      var subtitle = section && section.querySelector("p");
      var row =
        section &&
        section.querySelector('.flex.gap-3.sm\\:gap-4.overflow-x-auto.pb-4.scrollbar-hide.snap-x.snap-mandatory');

      if (!section || !row || !subtitle) return;
      if (subtitle.textContent.trim() !== "Explore our curated collections") return;

      row.innerHTML = sectionItems
        .map(function (item) {
          return '<div class="flex-shrink-0 w-[240px] md:w-[260px] snap-start">' + renderCard(item) + "</div>";
        })
        .join("");
    });
  }

  function renderShopAll(items, meta, categoriesData) {
    var loadingText = Array.from(document.querySelectorAll("p")).find(function (node) {
      return node.textContent.trim() === "Loading auctions...";
    });
    if (!loadingText) return;

    var resultsSection = loadingText.closest("section");
    if (!resultsSection) return;

    var controlsSection = resultsSection.previousElementSibling;
    if (!controlsSection) return;

    var state = {
      category: "all",
      status: "active",
      sortBy: "newly-listed",
      page: 1,
      perPage: 24,
    };

    function getFilteredItems() {
      var filtered = items.slice();

      filtered = filtered.filter(function (item) {
        var status = getStatus(item);
        if (state.status === "ending-soon") return status === "ending-soon";
        if (state.status === "closed") return status === "closed";
        return status !== "closed";
      });

      if (state.category !== "all") {
        filtered = filtered.filter(function (item) {
          return getTopLevelCategory(item) === state.category;
        });
      }

      filtered.sort(function (a, b) {
        if (state.sortBy === "ending-soon") return new Date(a.endTime) - new Date(b.endTime);
        if (state.sortBy === "price-low") return a.currentBid - b.currentBid;
        if (state.sortBy === "price-high") return b.currentBid - a.currentBid;
        return new Date(b.endTime) - new Date(a.endTime);
      });

      return filtered;
    }

    function renderControls(filteredItems, totalPages) {
      var categories = (categoriesData || [])
        .filter(function (category) {
          return category && category.slug && category.name;
        })
        .map(function (category) {
          return { slug: category.slug, name: category.name };
        });

      var visibleCount = state.category === "all" && state.status === "active" ? meta.total : filteredItems.length;

      controlsSection.innerHTML =
        '<div class="container mx-auto px-4 lg:px-8 py-6">' +
        '<div class="flex flex-col gap-4">' +
        '<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">' +
        '<p class="text-sm text-muted-foreground"><span id="shop-count">' +
        visibleCount +
        "</span> active auctions</p>" +
        '<div class="flex flex-wrap gap-3">' +
        '<label class="sr-only" for="shop-status">Status</label>' +
        '<select id="shop-status" class="border-input bg-background ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm w-[160px]">' +
        '<option value="active">Active</option>' +
        '<option value="ending-soon">Ending Soon</option>' +
        '<option value="closed">Closed</option>' +
        "</select>" +
        '<label class="sr-only" for="shop-category">Category</label>' +
        '<select id="shop-category" class="border-input bg-background ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm w-[180px]">' +
        '<option value="all">All Categories</option>' +
        categories
          .map(function (category) {
            return '<option value="' + escapeHtml(category.slug) + '">' + escapeHtml(category.name) + "</option>";
          })
          .join("") +
        "</select>" +
        '<label class="sr-only" for="shop-sort">Sort</label>' +
        '<select id="shop-sort" class="border-input bg-background ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm w-[180px]">' +
        '<option value="ending-soon">Ending Soon</option>' +
        '<option value="newly-listed">Newest Snapshot</option>' +
        '<option value="price-low">Price: Low to High</option>' +
        '<option value="price-high">Price: High to Low</option>' +
        "</select>" +
        "</div></div>" +
        '<div class="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">' +
        "<span>Page</span>" +
        '<span class="inline-flex items-center rounded-md border px-2.5 py-1">' +
        state.page +
        " / " +
        totalPages +
        "</span></div></div></div>";

      controlsSection.querySelector("#shop-status").value = state.status;
      controlsSection.querySelector("#shop-category").value = state.category;
      controlsSection.querySelector("#shop-sort").value = state.sortBy;

      controlsSection.querySelector("#shop-status").addEventListener("change", function (event) {
        state.status = event.target.value;
        state.page = 1;
        render();
      });

      controlsSection.querySelector("#shop-category").addEventListener("change", function (event) {
        state.category = event.target.value;
        state.page = 1;
        render();
      });

      controlsSection.querySelector("#shop-sort").addEventListener("change", function (event) {
        state.sortBy = event.target.value;
        state.page = 1;
        render();
      });
    }

    function renderResults(filteredItems, totalPages) {
      var startIndex = (state.page - 1) * state.perPage;
      var pageItems = filteredItems.slice(startIndex, startIndex + state.perPage);
      var endIndex = Math.min(startIndex + state.perPage, filteredItems.length);

      resultsSection.innerHTML =
        '<div class="container mx-auto px-4 lg:px-8">' +
        '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">' +
        pageItems.map(renderCard).join("") +
        "</div>" +
        '<div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t">' +
        '<p class="text-sm text-muted-foreground">Showing ' +
        (filteredItems.length ? startIndex + 1 : 0) +
        "-" +
        endIndex +
        " of " +
        filteredItems.length +
        "</p>" +
        '<div class="flex items-center gap-2">' +
        '<button id="shop-prev" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-transparent h-9 px-3 disabled:opacity-40 disabled:pointer-events-none">Previous</button>' +
        '<span class="text-sm text-muted-foreground min-w-[100px] text-center">Page ' +
        state.page +
        " of " +
        totalPages +
        "</span>" +
        '<button id="shop-next" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-transparent h-9 px-3 disabled:opacity-40 disabled:pointer-events-none">Next</button>' +
        "</div></div></div>";

      resultsSection.querySelector("#shop-prev").disabled = state.page <= 1;
      resultsSection.querySelector("#shop-next").disabled = state.page >= totalPages;

      resultsSection.querySelector("#shop-prev").addEventListener("click", function () {
        if (state.page > 1) {
          state.page -= 1;
          render();
        }
      });

      resultsSection.querySelector("#shop-next").addEventListener("click", function () {
        if (state.page < totalPages) {
          state.page += 1;
          render();
        }
      });

      updateCountdowns(resultsSection);
    }

    function render() {
      var filteredItems = getFilteredItems();
      var totalPages = Math.max(1, Math.ceil(filteredItems.length / state.perPage));
      if (state.page > totalPages) state.page = totalPages;
      renderControls(filteredItems, totalPages);
      renderResults(filteredItems, totalPages);
    }

    render();
    setInterval(function () {
      updateCountdowns(resultsSection);
    }, 1000);
  }

  Promise.all([
    loadJson("data/featured-lots.json"),
    loadJson("data/all-shop-lots.json"),
    loadJson("data/shop-all-meta.json"),
    loadJson("data/categories.json"),
  ])
    .then(function (results) {
      renderFeatured(results[0]);
      renderLandingCategorySections(results[1]);
      renderShopAll(results[1], results[2], results[3]);
    })
    .catch(function (error) {
      console.error("Catalog render failed:", error);
    });
})();
