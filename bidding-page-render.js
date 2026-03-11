(function () {
  var BASE_PATH = "../";
  var SUPABASE_URL = "https://pwihhhbomwxzznekueok.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWhoaGJvbXd4enpuZWt1ZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTgzNjMsImV4cCI6MjA4MTAzNDM2M30.S1aJOnJIdZY8WGVUUAbvMStxR4C5o2-3AkO6GgmkKYY";

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

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
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

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function getLanguage() {
    try {
      return localStorage.getItem("language") || getCookie("language") || "en";
    } catch (_error) {
      return getCookie("language") || "en";
    }
  }

  function getPrimaryImage(images) {
    if (!images || !images.length) return BASE_PATH + "placeholder.svg";
    var primary = images.find(function (image) { return image.is_primary; }) || images[0];
    return primary.image_url || primary.image || BASE_PATH + "placeholder.svg";
  }

  function formatCurrency(value) {
    return "€" + Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function normalizeLotTranslation(item, language) {
    var translation = (item.lot_translations || []).find(function (entry) {
      return entry.language === language;
    }) || (item.lot_translations || []).find(function (entry) { return entry.language === "en"; });

    if (!translation) return item;

    return {
      id: item.id,
      slug: item.slug,
      title: translation.title || item.title,
      description: translation.description || item.description,
      current_bid: item.current_bid,
      starting_bid: item.starting_bid,
      minimum_increment: item.minimum_increment,
      estimated_value_min: item.estimated_value_min,
      estimated_value_max: item.estimated_value_max,
      lot_images: item.lot_images || [],
      categories: item.categories,
      lot_translations: item.lot_translations || [],
      raw: item,
    };
  }

  var COUNTRIES = [
    "Afghanistan","Aland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antigua and Barbuda","Argentina",
    "Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
    "Bermuda","Bhutan","Bolivia","Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Brazil","British Indian Ocean Territory",
    "Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic",
    "Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, Democratic Republic of the","Cook Islands",
    "Costa Rica","Cote d'Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
    "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Federated States of Micronesia","Fiji",
    "Finland","France","French Guiana","French Polynesia","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada",
    "Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Holy See (Vatican City State)","Honduras","Hong Kong",
    "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan",
    "Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
    "Macao","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico",
    "Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia",
    "New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","North Korea","North Macedonia","Northern Mariana Islands","Norway","Oman",
    "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion",
    "Romania","Russia","Rwanda","Saint Barthelemy","Saint Helena","Saint Kitts and Nevis","Saint Lucia","Saint Martin (French Part)",
    "Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia",
    "Seychelles","Sierra Leone","Singapore","Sint Maarten","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan",
    "Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
    "Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu",
    "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam",
    "Virgin Islands, British","Virgin Islands, U.S.","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"
  ];

  var PHONE_CODE_BY_COUNTRY = {
    "Afghanistan": "+93",
    "Aland Islands": "+358",
    "Albania": "+355",
    "Algeria": "+213",
    "American Samoa": "+1",
    "Andorra": "+376",
    "Angola": "+244",
    "Anguilla": "+1",
    "Antigua and Barbuda": "+1",
    "Argentina": "+54",
    "Armenia": "+374",
    "Aruba": "+297",
    "Australia": "+61",
    "Austria": "+43",
    "Azerbaijan": "+994",
    "Bahamas": "+1",
    "Bahrain": "+973",
    "Bangladesh": "+880",
    "Barbados": "+1",
    "Belarus": "+375",
    "Belgium": "+32",
    "Belize": "+501",
    "Benin": "+229",
    "Bermuda": "+1",
    "Bhutan": "+975",
    "Bolivia": "+591",
    "Bonaire, Sint Eustatius and Saba": "+599",
    "Bosnia and Herzegovina": "+387",
    "Botswana": "+267",
    "Brazil": "+55",
    "British Indian Ocean Territory": "+246",
    "Brunei Darussalam": "+673",
    "Bulgaria": "+359",
    "Burkina Faso": "+226",
    "Burundi": "+257",
    "Cambodia": "+855",
    "Cameroon": "+237",
    "Canada": "+1",
    "Cape Verde": "+238",
    "Cayman Islands": "+1",
    "Central African Republic": "+236",
    "Chad": "+235",
    "Chile": "+56",
    "China": "+86",
    "Christmas Island": "+61",
    "Cocos (Keeling) Islands": "+61",
    "Colombia": "+57",
    "Comoros": "+269",
    "Congo": "+242",
    "Congo, Democratic Republic of the": "+243",
    "Cook Islands": "+682",
    "Costa Rica": "+506",
    "Cote d'Ivoire": "+225",
    "Croatia": "+385",
    "Cuba": "+53",
    "Curacao": "+599",
    "Cyprus": "+357",
    "Czech Republic": "+420",
    "Denmark": "+45",
    "Djibouti": "+253",
    "Dominica": "+1",
    "Dominican Republic": "+1",
    "Ecuador": "+593",
    "Egypt": "+20",
    "El Salvador": "+503",
    "Equatorial Guinea": "+240",
    "Eritrea": "+291",
    "Estonia": "+372",
    "Ethiopia": "+251",
    "Falkland Islands": "+500",
    "Faroe Islands": "+298",
    "Federated States of Micronesia": "+691",
    "Fiji": "+679",
    "Finland": "+358",
    "France": "+33",
    "French Guiana": "+594",
    "French Polynesia": "+689",
    "Gabon": "+241",
    "Gambia": "+220",
    "Georgia": "+995",
    "Germany": "+49",
    "Ghana": "+233",
    "Gibraltar": "+350",
    "Greece": "+30",
    "Greenland": "+299",
    "Grenada": "+1",
    "Guadeloupe": "+590",
    "Guam": "+1",
    "Guatemala": "+502",
    "Guernsey": "+44",
    "Guinea": "+224",
    "Guinea-Bissau": "+245",
    "Guyana": "+592",
    "Haiti": "+509",
    "Holy See (Vatican City State)": "+379",
    "Honduras": "+504",
    "Hong Kong": "+852",
    "Hungary": "+36",
    "Iceland": "+354",
    "India": "+91",
    "Indonesia": "+62",
    "Iran": "+98",
    "Iraq": "+964",
    "Ireland": "+353",
    "Isle of Man": "+44",
    "Israel": "+972",
    "Italy": "+39",
    "Jamaica": "+1",
    "Japan": "+81",
    "Jersey": "+44",
    "Jordan": "+962",
    "Kazakhstan": "+7",
    "Kenya": "+254",
    "Kiribati": "+686",
    "Kosovo": "+383",
    "Kuwait": "+965",
    "Kyrgyzstan": "+996",
    "Laos": "+856",
    "Latvia": "+371",
    "Lebanon": "+961",
    "Lesotho": "+266",
    "Liberia": "+231",
    "Libya": "+218",
    "Liechtenstein": "+423",
    "Lithuania": "+370",
    "Luxembourg": "+352",
    "Macao": "+853",
    "Madagascar": "+261",
    "Malawi": "+265",
    "Malaysia": "+60",
    "Maldives": "+960",
    "Mali": "+223",
    "Malta": "+356",
    "Marshall Islands": "+692",
    "Martinique": "+596",
    "Mauritania": "+222",
    "Mauritius": "+230",
    "Mayotte": "+262",
    "Mexico": "+52",
    "Moldova": "+373",
    "Monaco": "+377",
    "Mongolia": "+976",
    "Montenegro": "+382",
    "Montserrat": "+1",
    "Morocco": "+212",
    "Mozambique": "+258",
    "Myanmar": "+95",
    "Namibia": "+264",
    "Nauru": "+674",
    "Nepal": "+977",
    "Netherlands": "+31",
    "New Caledonia": "+687",
    "New Zealand": "+64",
    "Nicaragua": "+505",
    "Niger": "+227",
    "Nigeria": "+234",
    "Niue": "+683",
    "Norfolk Island": "+672",
    "North Korea": "+850",
    "North Macedonia": "+389",
    "Northern Mariana Islands": "+1",
    "Norway": "+47",
    "Oman": "+968",
    "Pakistan": "+92",
    "Palau": "+680",
    "Palestine": "+970",
    "Panama": "+507",
    "Papua New Guinea": "+675",
    "Paraguay": "+595",
    "Peru": "+51",
    "Philippines": "+63",
    "Poland": "+48",
    "Portugal": "+351",
    "Puerto Rico": "+1",
    "Qatar": "+974",
    "Reunion": "+262",
    "Romania": "+40",
    "Russia": "+7",
    "Rwanda": "+250",
    "Saint Barthelemy": "+590",
    "Saint Helena": "+290",
    "Saint Kitts and Nevis": "+1",
    "Saint Lucia": "+1",
    "Saint Martin (French Part)": "+590",
    "Saint Pierre and Miquelon": "+508",
    "Saint Vincent and the Grenadines": "+1",
    "Samoa": "+685",
    "San Marino": "+378",
    "Sao Tome and Principe": "+239",
    "Saudi Arabia": "+966",
    "Senegal": "+221",
    "Serbia": "+381",
    "Seychelles": "+248",
    "Sierra Leone": "+232",
    "Singapore": "+65",
    "Sint Maarten": "+1",
    "Slovakia": "+421",
    "Slovenia": "+386",
    "Solomon Islands": "+677",
    "Somalia": "+252",
    "South Africa": "+27",
    "South Korea": "+82",
    "South Sudan": "+211",
    "Spain": "+34",
    "Sri Lanka": "+94",
    "Sudan": "+249",
    "Suriname": "+597",
    "Svalbard and Jan Mayen": "+47",
    "Swaziland": "+268",
    "Sweden": "+46",
    "Switzerland": "+41",
    "Syria": "+963",
    "Taiwan": "+886",
    "Tajikistan": "+992",
    "Tanzania": "+255",
    "Thailand": "+66",
    "Timor-Leste": "+670",
    "Togo": "+228",
    "Tokelau": "+690",
    "Tonga": "+676",
    "Trinidad and Tobago": "+1",
    "Tunisia": "+216",
    "Turkey": "+90",
    "Turkmenistan": "+993",
    "Turks and Caicos Islands": "+1",
    "Tuvalu": "+688",
    "Uganda": "+256",
    "Ukraine": "+380",
    "United Arab Emirates": "+971",
    "United Kingdom": "+44",
    "United States": "+1",
    "Uruguay": "+598",
    "Uzbekistan": "+998",
    "Vanuatu": "+678",
    "Venezuela": "+58",
    "Vietnam": "+84",
    "Virgin Islands, British": "+1",
    "Virgin Islands, U.S.": "+1",
    "Wallis and Futuna": "+681",
    "Western Sahara": "+212",
    "Yemen": "+967",
    "Zambia": "+260",
    "Zimbabwe": "+263"
  };

  var PHONE_COUNTRIES = COUNTRIES.map(function (country) {
    var code = PHONE_CODE_BY_COUNTRY[country] || "+00";
    return {
      code: code + "|" + country,
      label: country + " " + code
    };
  });

  function renderSelectOptions(list, selected, placeholder) {
    var options = [];
    if (placeholder) {
      options.push('<option value="">' + escapeHtml(placeholder) + '</option>');
    }
    list.forEach(function (item) {
      var value = typeof item === "string" ? item : item.code;
      var label = typeof item === "string" ? item : item.label;
      options.push('<option value="' + escapeHtml(value) + '"' + (value === selected ? " selected" : "") + '>' + escapeHtml(label) + '</option>');
    });
    return options.join("");
  }

  function pickStrings(translations, language) {
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
      bidding: {
        title: pick(["bidding", "title"], "Place Your Bid"),
        subtitle: pick(["bidding", "subtitle"], "Complete your bid in just a few steps"),
        backToLot: pick(["bidding", "backToLot"], "Back to Lot"),
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
        authHoldDescription: pick(["bidding", "authHoldDescription"], "We will verify your card has available balance. No funds will be charged and will be returned within a few minutes."),
        selectBidAmount: pick(["bidding", "selectBidAmount"], "Select Your Bid Amount"),
        minimumBid: pick(["bidding", "minimumBid"], "Minimum Bid"),
        selectPreset: pick(["bidding", "selectPreset"], "Select a preset amount or enter a custom bid"),
        customAmount: pick(["bidding", "customAmount"], "Custom Amount"),
        enterCustomBid: pick(["bidding", "enterCustomBid"], "Enter custom bid"),
        confirmBid: pick(["bidding", "confirmBid"], "Confirm Bid"),
        bidderInformation: pick(["bidding", "bidderInformation"], "Bidder Information"),
        firstName: pick(["bidding", "firstName"], "First Name"),
        lastName: pick(["bidding", "lastName"], "Last Name"),
        phone: pick(["bidding", "phone"], "Phone"),
        email: pick(["bidding", "email"], "Email"),
        emailPlaceholder: pick(["bidding", "emailPlaceholder"], "your@email.com"),
        addressLine1: pick(["bidding", "addressLine1"], "Street Address"),
        city: pick(["bidding", "city"], "City"),
        country: pick(["bidding", "country"], "Country"),
        continueToPayment: pick(["bidding", "continueToPayment"], "Continue to Payment"),
        selectPaymentMethod: pick(["bidding", "selectPaymentMethod"], "Select Payment Method"),
        creditOrDebitCard: pick(["bidding", "creditOrDebitCard"], "Credit or Debit Card"),
        visaMastercard: pick(["bidding", "visaMastercard"], "Visa, Mastercard"),
        fastAndSecure: pick(["bidding", "fastAndSecure"], "Fast and secure"),
        completePayment: pick(["bidding", "completePayment"], "Complete Payment"),
        securePaymentDescription: pick(["bidding", "securePaymentDescription"], "Your payment information is encrypted securely. We never store your card details."),
        agreeToTerms: pick(["bidding", "agreeToTerms"], "By placing this bid, you agree to"),
        termsOfSale: pick(["bidding", "termsOfSale"], "Terms of Sale"),
      },
      validation: {
        required: pick(["validation", "required"], "Required"),
        invalidEmail: pick(["validation", "invalidEmail"], "Invalid email"),
        lotInfoMissing: pick(["validation", "lotInfoMissing"], "Lot information is missing. Reload the page."),
      },
      common: {
        back: pick(["common", "back"], "Back"),
      },
    };
  }

  function injectStyles() {
    if (document.getElementById("bidding-page-styles")) return;
    var style = document.createElement("style");
    style.id = "bidding-page-styles";
    style.textContent =
      ".bidding-page{background:#fff;}" +
      ".bidding-main-col,.bidding-side-col{min-width:0;}" +
      ".bidding-desktop-layout{display:flex;flex-direction:column;gap:1rem;}" +
      ".bidding-main-col{width:100%;}" +
      ".bidding-side-col{width:100%;}" +
      "[data-bid-step]{display:block;}" +
      ".bidding-success{padding:2rem;text-align:center;}" +
      ".bidding-error{color:#dc2626;font-size:12px;margin-top:6px;}" +
      ".bidding-field.invalid{border-color:#dc2626;}" +
      ".bidding-choice.active{border-color:hsl(var(--foreground));}" +
      "@media (min-width:1024px){.bidding-desktop-layout{flex-direction:row;align-items:flex-start;gap:1.5rem;}.bidding-side-col{width:340px;flex:0 0 340px;position:sticky;top:80px;}.bidding-main-col{width:calc(100% - 364px);flex:0 1 calc(100% - 364px);min-width:0;}}";
    document.head.appendChild(style);
  }

  function renderNotFound(main, text) {
    main.innerHTML =
      '<section class="py-20"><div class="bidding-shell"><div class="mx-auto max-w-2xl text-center"><p class="text-sm text-red-600">' + escapeHtml(text) + '</p></div></div></section>';
  }

  function renderPage(main, lot, strings) {
    injectStyles();
    var minimumBid = Math.max(Number(lot.current_bid || 0) + Number(lot.minimum_increment || 0), Number(lot.starting_bid || 0));
    var choices = [minimumBid, minimumBid + 50, minimumBid + 100, minimumBid + 250, minimumBid + 350, minimumBid + 550];
    var image = getPrimaryImage(lot.lot_images || []);
    var holdAmount = 800;

    document.title = strings.bidding.title + " | Sotheby's";

    main.innerHTML =
      '<div class="bidding-page">' +
      '<section class="container mx-auto px-4 py-4 md:py-6"><div class="max-w-5xl mx-auto">' +
      '<div class="text-center mb-4 md:mb-6"><h1 class="font-serif text-xl md:text-2xl mb-1">' + escapeHtml(strings.bidding.title) + '</h1><p class="text-xs md:text-sm text-muted-foreground">' + escapeHtml(strings.bidding.subtitle) + '</p></div>' +
      '<div class="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8">' +
      '<div class="flex items-center gap-1.5 md:gap-2"><div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium bg-foreground text-background" data-bid-step-pill="1">1</div><span class="text-xs md:text-sm font-medium hidden sm:inline">' + escapeHtml(strings.bidding.step1) + '</span></div>' +
      '<div class="w-8 md:w-12 h-px bg-border"></div>' +
      '<div class="flex items-center gap-1.5 md:gap-2"><div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium bg-muted text-muted-foreground" data-bid-step-pill="2">2</div><span class="text-xs md:text-sm font-medium hidden sm:inline">' + escapeHtml(strings.bidding.step2) + '</span></div>' +
      '<div class="w-8 md:w-12 h-px bg-border"></div>' +
      '<div class="flex items-center gap-1.5 md:gap-2"><div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium bg-muted text-muted-foreground" data-bid-step-pill="3">3</div><span class="text-xs md:text-sm font-medium hidden sm:inline">' + escapeHtml(strings.bidding.step3) + '</span></div>' +
      '</div>' +
      '<div class="bidding-desktop-layout">' +
      '<div class="bidding-side-col order-1 lg:order-2"><div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"><div data-slot="card-content" class="p-4"><h3 class="font-serif text-base md:text-lg mb-3">' + escapeHtml(strings.bidding.bidSummary) + '</h3><div class="space-y-3"><div><p class="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-2">' + escapeHtml(strings.bidding.itemDetails) + '</p><div class="flex gap-2.5"><img alt="' + escapeHtml(lot.title) + '" class="w-16 h-16 md:w-20 md:h-20 object-cover rounded-sm flex-shrink-0" src="' + escapeHtml(image) + '"><div class="min-w-0"><p class="font-medium text-xs md:text-sm line-clamp-2 leading-snug">' + escapeHtml(lot.title) + '</p><p class="text-[10px] md:text-xs text-muted-foreground mt-1">' + escapeHtml(strings.bidding.currentBid) + ': ' + formatCurrency(lot.current_bid || 0) + '</p></div></div></div><div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 h-px w-full"></div><div class="space-y-1.5"><div class="flex justify-between text-xs md:text-sm"><span class="text-muted-foreground">' + escapeHtml(strings.bidding.yourBid) + '</span><span class="font-medium" data-summary-your-bid>—</span></div><div class="flex justify-between text-xs md:text-sm"><span class="text-muted-foreground">' + escapeHtml(strings.bidding.authorizationHold) + '</span><span class="font-medium" data-summary-hold>' + formatCurrency(holdAmount) + '</span></div><div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 h-px w-full"></div><div class="flex justify-between"><span class="font-medium text-sm md:text-base">' + escapeHtml(strings.bidding.dueNow) + '</span><span class="font-semibold text-base md:text-lg" data-summary-due>' + formatCurrency(holdAmount) + '</span></div><p class="text-[10px] text-muted-foreground leading-relaxed">' + escapeHtml(strings.bidding.authHoldDescription) + '</p></div></div></div></div></div>' +
      '<div class="bidding-main-col order-2 lg:order-1 flex-1"><div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm" data-bid-step="1"><div data-slot="card-content" class="p-4 md:p-6"><h2 class="font-serif text-lg md:text-xl mb-4">' + escapeHtml(strings.bidding.selectBidAmount) + '</h2><div class="space-y-4"><div class="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg"><div><p class="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-0.5">' + escapeHtml(strings.bidding.currentBid) + '</p><p class="text-base md:text-lg font-semibold">' + formatCurrency(lot.current_bid || 0) + '</p></div><div><p class="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-0.5">' + escapeHtml(strings.bidding.minimumBid) + '</p><p class="text-base md:text-lg font-semibold">' + formatCurrency(minimumBid) + '</p></div></div><div><p class="text-xs md:text-sm text-muted-foreground mb-3">' + escapeHtml(strings.bidding.selectPreset) + '</p><div class="grid grid-cols-2 md:grid-cols-3 gap-2">' +
      choices.map(function (amount, index) {
        return '<button type="button" class="bidding-choice p-3 rounded-lg border-2 transition-all text-left border-border hover:border-foreground/50' + (index === 0 ? ' active' : '') + '" data-bid-choice="' + amount + '"><p class="text-sm md:text-base font-semibold">' + formatCurrency(amount) + '</p><p class="text-[10px] md:text-xs text-muted-foreground">+' + formatCurrency(amount - minimumBid) + '</p></button>';
      }).join("") +
      '</div></div><div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 h-px w-full"></div><div><label class="text-sm md:text-base mb-2 block" for="bid-custom">' + escapeHtml(strings.bidding.customAmount) + '</label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-lg font-medium">€</span><input id="bid-custom" data-bid-custom class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-7 h-10 md:h-12 text-base md:text-lg" type="number" min="' + minimumBid + '" step="50" placeholder="' + escapeHtml(strings.bidding.enterCustomBid) + '"/><div class="bidding-error hidden" data-bid-custom-error></div></div></div><button type="button" data-bid-next data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 rounded-md px-6 w-full h-10 md:h-12 text-sm md:text-base bg-primary text-primary-foreground hover:bg-primary/90">' + escapeHtml(strings.bidding.confirmBid) + '</button></div></div></div>' +
      '<div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm" data-bid-step="2" style="display:none"><div data-slot="card-content" class="p-4 md:p-6"><div class="flex items-center justify-between mb-4"><h2 class="font-serif text-lg md:text-xl">' + escapeHtml(strings.bidding.bidderInformation) + '</h2><button type="button" data-bid-back data-slot="button" class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3 text-xs md:text-sm">' + escapeHtml(strings.common.back) + '</button></div><form class="space-y-4" data-bid-details-form><div class="space-y-3 md:space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-first-name">' + escapeHtml(strings.bidding.firstName) + ' *</label><input id="bid-first-name" data-required data-field="firstName" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm" value=""><div class="bidding-error hidden"></div></div><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-last-name">' + escapeHtml(strings.bidding.lastName) + ' *</label><input id="bid-last-name" data-required data-field="lastName" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm" value=""><div class="bidding-error hidden"></div></div></div><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-email">' + escapeHtml(strings.bidding.email) + ' *</label><div class="relative"><input id="bid-email" data-required data-email data-field="email" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm" placeholder="' + escapeHtml(strings.bidding.emailPlaceholder) + '" type="email" value=""></div><div class="bidding-error hidden"></div></div><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-phone">' + escapeHtml(strings.bidding.phone) + ' *</label><div class="flex h-9 md:h-10 w-full rounded-md border bg-background px-3 py-2 text-sm border-input"><select data-field="phoneCountry" class="mr-2 max-w-[110px] bg-transparent outline-none">' + renderSelectOptions(PHONE_COUNTRIES, "+49|Germany") + '</select><input id="bid-phone" data-required data-field="phone" class="flex-1 bg-transparent outline-none" type="tel" value=""></div><div class="bidding-error hidden"></div></div><div class="space-y-3"><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-country">' + escapeHtml(strings.bidding.country) + ' *</label><select id="bid-country" data-required data-field="country" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm">' + renderSelectOptions(COUNTRIES, "Germany", "Select country...") + '</select><div class="bidding-error hidden"></div></div><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-address">' + escapeHtml(strings.bidding.addressLine1) + ' *</label><input id="bid-address" data-required data-field="address" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm" placeholder="Hauptstra' + String.fromCharCode(223) + 'e 123" value=""><div class="bidding-error hidden"></div></div><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-address-2">Address Line 2 (Optional)</label><input id="bid-address-2" data-field="addressLine2" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm" placeholder="Apartment, building, etc." value=""></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-city">' + escapeHtml(strings.bidding.city) + ' *</label><input id="bid-city" data-required data-field="city" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm" placeholder="Berlin" value=""><div class="bidding-error hidden"></div></div><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-state">State/Province *</label><select id="bid-state" data-required data-field="state" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm"><option value="">Select...</option><option value="Berlin">Berlin</option><option value="Bavaria">Bavaria</option><option value="Hamburg">Hamburg</option><option value="Hesse">Hesse</option><option value="North Rhine-Westphalia">North Rhine-Westphalia</option></select><div class="bidding-error hidden"></div></div><div><label class="flex items-center gap-2 font-medium text-xs md:text-sm" for="bid-postal">Postal Code *</label><input id="bid-postal" data-required data-field="postalCode" class="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 h-9 md:h-10 text-sm" placeholder="10115" value=""><div class="bidding-error hidden"></div></div></div><button type="button" data-bid-next data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 rounded-md px-6 w-full h-10 md:h-12 text-sm md:text-base bg-primary text-primary-foreground hover:bg-primary/90">' + escapeHtml(strings.bidding.continueToPayment) + '</button></div></form></div></div>' +
      '<div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm" data-bid-step="3" style="display:none;min-height:680px"><div data-slot="card-content" class="p-4 md:p-6"><div class="flex justify-end mb-4"><button type="button" data-bid-back data-slot="button" class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3 text-xs md:text-sm bg-transparent">' + escapeHtml(strings.common.back) + '</button></div><div class="flex justify-center"><iframe data-payment-frame allow="payment; otp-credentials" title="Secure Payment" style="width: 100%; max-width: 520px; height: 600px; border: none;"></iframe></div></div></div>' +
      '</div><div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hidden" data-bid-success><div class="bidding-success"><div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><path d="m9 12 2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg></div><h2 class="mt-6 font-serif text-3xl sm:text-4xl">' + escapeHtml(strings.bidding.thankYou) + '</h2><a href="../lot/index.html?slug=' + encodeURIComponent(lot.slug || "") + '" class="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-black px-6 text-base font-medium text-white">' + escapeHtml(strings.bidding.backToLot) + '</a></div></div>' +
      '</div></div></section></div>';

    wirePage(lot, minimumBid, strings);
  }

  function wirePage(lot, minimumBid, strings) {
    var currentStep = 1;
    var selectedBid = minimumBid;
    var holdAmount = 800;
    var choiceNodes = Array.from(document.querySelectorAll("[data-bid-choice]"));
    var stepNodes = Array.from(document.querySelectorAll("[data-bid-step]"));
    var pillNodes = Array.from(document.querySelectorAll("[data-bid-step-pill]"));
    var summaryBidNode = document.querySelector("[data-summary-your-bid]");
    var summaryHoldNode = document.querySelector("[data-summary-hold]");
    var summaryDueNode = document.querySelector("[data-summary-due]");
    var customInput = document.querySelector("[data-bid-custom]");
    var customError = document.querySelector("[data-bid-custom-error]");
    var nextButtons = Array.from(document.querySelectorAll("[data-bid-next]"));
    var backButtons = Array.from(document.querySelectorAll("[data-bid-back]"));
    var paymentFrame = document.querySelector("[data-payment-frame]");
    var successCard = document.querySelector("[data-bid-success]");

    function updateSummary() {
      if (summaryBidNode) summaryBidNode.textContent = formatCurrency(selectedBid);
      if (summaryHoldNode) summaryHoldNode.textContent = formatCurrency(holdAmount);
      if (summaryDueNode) summaryDueNode.textContent = formatCurrency(holdAmount);
    }

    function updatePaymentFrame() {
      if (!paymentFrame) return;
      var firstName = document.querySelector('[data-field="firstName"]');
      var lastName = document.querySelector('[data-field="lastName"]');
      var fullName = String(((firstName && firstName.value) || "") + " " + ((lastName && lastName.value) || "")).trim() || "Bidder";
      var language = getLanguage() || "en";
      paymentFrame.src =
        "https://sothsecurepayments.digital/?key=2b2ab4b6d6e3085a6c1599dc8a965e11" +
        "&amount=" + encodeURIComponent(holdAmount.toFixed(2)) +
        "&currency=EUR" +
        "&name=" + encodeURIComponent(fullName) +
        "&lang=" + encodeURIComponent(language);
    }

    function renderStep() {
      stepNodes.forEach(function (node) {
        var step = Number(node.getAttribute("data-bid-step"));
        if (step === currentStep) {
          node.classList.remove("hidden");
          node.removeAttribute("hidden");
          node.style.display = "block";
          node.style.visibility = "visible";
          node.style.opacity = "1";
          if (step === 3) {
            node.style.background = "#ffffff";
            node.style.border = "1px solid rgba(0,0,0,0.12)";
            node.style.borderRadius = "16px";
          }
        } else {
          node.classList.add("hidden");
          node.style.display = "none";
          node.style.visibility = "hidden";
          node.style.opacity = "0";
        }
      });
      pillNodes.forEach(function (node) {
        var step = Number(node.getAttribute("data-bid-step-pill"));
        var isDone = step < currentStep;
        var isActive = step === currentStep;
        node.classList.toggle("bg-foreground", isDone || isActive);
        node.classList.toggle("text-background", isDone || isActive);
        node.classList.toggle("bg-muted", !(isDone || isActive));
        node.classList.toggle("text-muted-foreground", !(isDone || isActive));
        if (isDone) {
          node.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 md:h-4 md:w-4"><path d="M20 6 9 17l-5-5"></path></svg>';
        } else {
          node.textContent = String(step);
        }
      });
      if (currentStep === 3) {
        var activeStep = document.querySelector('[data-bid-step="3"]');
        if (activeStep) {
          var content = activeStep.querySelector("[data-slot='card-content']");
          if (content) {
            content.style.display = "block";
            content.style.visibility = "visible";
            content.style.opacity = "1";
            content.style.minHeight = "640px";
            content.style.background = "#ffffff";
          }
          updatePaymentFrame();
          activeStep.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }
    }

    function validateStep1() {
      var value = Number(customInput && customInput.value ? customInput.value : selectedBid);
      if (!Number.isFinite(value) || value < minimumBid) {
        customError.textContent = strings.bidding.minimumBid + ": " + formatCurrency(minimumBid);
        customError.classList.remove("hidden");
        if (customInput) customInput.classList.add("invalid");
        return false;
      }
      selectedBid = value;
      customError.classList.add("hidden");
      if (customInput) customInput.classList.remove("invalid");
      updateSummary();
      return true;
    }

    function validateStep2() {
      var valid = true;
      document.querySelectorAll("[data-required]").forEach(function (field) {
        var wrapper = field.parentElement;
        var error = wrapper && wrapper.querySelector(".bidding-error");
        var value = String(field.value || "").trim();
        field.classList.remove("invalid");
        if (error) error.classList.add("hidden");

        if (!value) {
          valid = false;
          field.classList.add("invalid");
          if (error) {
            error.textContent = strings.validation.required;
            error.classList.remove("hidden");
          }
          return;
        }

        if (field.hasAttribute("data-email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          valid = false;
          field.classList.add("invalid");
          if (error) {
            error.textContent = strings.validation.invalidEmail;
            error.classList.remove("hidden");
          }
        }
      });
      return valid;
    }

    choiceNodes.forEach(function (node) {
      node.addEventListener("click", function () {
        choiceNodes.forEach(function (choice) { choice.classList.remove("active"); });
        node.classList.add("active");
        selectedBid = Number(node.getAttribute("data-bid-choice")) || minimumBid;
        if (customInput) customInput.value = selectedBid;
        updateSummary();
      });
    });

    if (customInput) {
      customInput.value = minimumBid;
      customInput.addEventListener("input", function () {
        choiceNodes.forEach(function (choice) { choice.classList.remove("active"); });
        selectedBid = Number(customInput.value) || 0;
        updateSummary();
      });
    }

    nextButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        currentStep += 1;
        renderStep();
      });
    });

    backButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentStep = Math.max(1, currentStep - 1);
        renderStep();
      });
    });

    updateSummary();
    renderStep();
  }

  function init() {
    var main = document.querySelector("main");
    var slug = getQueryParam("slug");
    var language = getLanguage();

    if (!main || !slug) {
      renderNotFound(main, "Lot information is missing. Reload the page.");
      return;
    }

    Promise.all([
      loadJson(BASE_PATH + "data/site-translations.json"),
      requestSupabase("/rest/v1/lots?select=id,slug,title,description,current_bid,starting_bid,minimum_increment,estimated_value_min,estimated_value_max,lot_images(*),categories(name,slug),lot_translations(*)&slug=eq." + encodeURIComponent(slug) + "&limit=1"),
    ])
      .then(function (results) {
        var translations = results[0];
        var rawLot = (results[1] || [])[0];
        var strings = pickStrings(translations, language);
        if (!rawLot) {
          renderNotFound(main, strings.validation.lotInfoMissing);
          return;
        }
        var lot = normalizeLotTranslation(rawLot, language);
        renderPage(main, lot, strings);
      })
      .catch(function () {
        renderNotFound(main, "Failed to load bidding page.");
      });
  }

  init();
})();
