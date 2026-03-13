(function () {
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getBasePath() {
    const path = window.location.pathname.replace(/\/+/g, "/");
    if (path.includes("/collections/") || path.includes("/category/") || path.includes("/auctions/") || path.includes("/lot/") || path.includes("/bidding/")) {
      return "../";
    }
    return "";
  }

  function renderShell(content, title, subtitle) {
    const root = document.querySelector("[data-auth-root]");
    if (!root) return;
    root.innerHTML = `
      <section class="border-b border-border/40 bg-secondary/20">
        <div class="container mx-auto px-4 lg:px-8 py-16">
          <h1 class="font-serif text-4xl md:text-5xl mb-4 text-balance">${title}</h1>
          <p class="text-lg text-muted-foreground max-w-2xl text-pretty">${subtitle}</p>
        </div>
      </section>
      <section class="py-16">
        <div class="container mx-auto px-4 lg:px-8">
          <div class="mx-auto max-w-md rounded-2xl border border-border/60 bg-background p-8 shadow-sm">
            ${content}
          </div>
        </div>
      </section>
    `;
  }

  function renderWideShell(content, title, subtitle) {
    const root = document.querySelector("[data-auth-root]");
    if (!root) return;
    root.innerHTML = `
      <section class="py-10 lg:py-16">
        <div class="container mx-auto px-4 lg:px-8">
          ${content}
        </div>
      </section>
    `;
  }

  function buildInput(label, name, type, autocomplete, required) {
    return `
      <label class="block space-y-2">
        <span class="text-sm font-medium">${label}</span>
        <input name="${name}" type="${type}" autocomplete="${autocomplete}" ${required ? "required" : ""} class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-11 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" />
      </label>
    `;
  }

  const COUNTRIES = [
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

  function renderCountryOptions(selectedCountry) {
    return COUNTRIES.map(function (country) {
      return `<option ${selectedCountry === country ? "selected" : ""}>${country}</option>`;
    }).join("");
  }

  function buildLoginPage(basePath) {
    return `
      <div class="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
        <div class="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-background">
          <div class="w-full max-w-md mx-auto space-y-8">
            <div class="space-y-2">
              <h1 class="text-4xl font-serif font-bold tracking-tight">Login</h1>
              <p class="text-muted-foreground">Enter your credentials to access your account</p>
            </div>
            <form data-auth-form class="space-y-6">
              <div class="space-y-2">
                <label class="flex items-center gap-2 font-medium text-base" for="email">Email</label>
                <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base" id="email" name="email" placeholder="Enter your email" required type="email" autocomplete="email" />
              </div>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 font-medium text-base" for="password">Password</label>
                  <a class="text-sm text-primary hover:underline" href="${basePath}contact.html">Forgot password?</a>
                </div>
                <div class="relative">
                  <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base pr-12" id="password" name="password" placeholder="Enter your password" required type="password" autocomplete="current-password" />
                  <button type="button" data-password-toggle class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Show password">
                    <svg xmlns="http://www.w3.org/2000/svg" data-password-icon="show" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" data-password-icon="hide" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden h-5 w-5"><path d="m15 18-.722-3.25"></path><path d="M2 8a10.645 10.645 0 0 0 20 0"></path><path d="m20 15-1.726-2.05"></path><path d="m4 15 1.726-2.05"></path><path d="m9 18 .722-3.25"></path></svg>
                  </button>
                </div>
              </div>
              <p data-auth-error class="hidden rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"></p>
              <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 w-full h-12 text-base" type="submit">Sign In</button>
            </form>
            <div class="text-center text-base">
              <span class="text-muted-foreground">Don't have an account? </span>
              <a class="text-primary font-medium hover:underline" href="${window.AuctioAuth.buildAuthPageUrl("register", basePath)}">Sign Up</a>
            </div>
            <div class="text-center pt-4">
              <a class="text-sm text-muted-foreground hover:text-foreground transition-colors" href="${basePath}index.html">← Back to Home</a>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-center relative bg-muted/30 overflow-hidden lg:min-h-0 min-h-[500px]">
          <div class="absolute inset-0">
            <img alt="Luxury auction gallery" class="object-cover h-full w-full" src="${basePath}luxury-jewelry-watches-display.jpg" />
            <div class="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/75"></div>
          </div>
          <div class="relative z-10 px-6 py-12 lg:px-16 xl:px-24 space-y-8 lg:space-y-12">
            <div class="space-y-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 lg:w-12 lg:h-12 text-primary/60"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path></svg>
              <blockquote class="text-xl lg:text-2xl xl:text-3xl font-serif leading-relaxed text-foreground">The exceptional quality and seamless experience gave me complete confidence in my purchase. Truly a world-class auction platform.</blockquote>
              <div class="space-y-1">
                <div class="font-semibold text-base lg:text-lg">Michael Chen</div>
                <div class="text-sm text-muted-foreground">Art Collector</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 lg:gap-8 pt-6 lg:pt-8 border-t border-border/40">
              <div>
                <div class="text-2xl lg:text-3xl font-bold text-primary">50K+</div>
                <div class="text-xs lg:text-sm text-muted-foreground mt-1">Trusted Collectors</div>
              </div>
              <div>
                <div class="text-2xl lg:text-3xl font-bold text-primary">25+</div>
                <div class="text-xs lg:text-sm text-muted-foreground mt-1">Years Experience</div>
              </div>
              <div>
                <div class="text-2xl lg:text-3xl font-bold text-primary">€2.5B+</div>
                <div class="text-xs lg:text-sm text-muted-foreground mt-1">Total Sales</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildRegisterPage(basePath) {
    return `
      <div class="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
        <div class="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-background">
          <div class="w-full max-w-md mx-auto space-y-8">
            <div class="space-y-2">
              <h1 class="text-4xl font-serif font-bold tracking-tight">Register</h1>
              <p class="text-muted-foreground">Join our community of collectors and enthusiasts</p>
            </div>
            <form data-auth-form class="space-y-5">
              <div class="space-y-2">
                <label class="flex items-center gap-2 font-medium text-base" for="firstName">First Name</label>
                <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base" id="firstName" name="firstName" placeholder="Enter your first name" required type="text" autocomplete="given-name" />
              </div>
              <div class="space-y-2">
                <label class="flex items-center gap-2 font-medium text-base" for="lastName">Last Name</label>
                <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base" id="lastName" name="lastName" placeholder="Enter your last name" required type="text" autocomplete="family-name" />
              </div>
              <div class="space-y-2">
                <label class="flex items-center gap-2 font-medium text-base" for="email">Email</label>
                <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base" id="email" name="email" placeholder="Enter your email" required type="email" autocomplete="email" />
              </div>
              <div class="space-y-2">
                <label class="flex items-center gap-2 font-medium text-base" for="phone">Phone</label>
                <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base" id="phone" name="phone" placeholder="Enter your phone number" type="tel" autocomplete="tel" />
              </div>
              <div class="space-y-2">
                <label class="flex items-center gap-2 font-medium text-base" for="password">Password</label>
                <div class="relative">
                  <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base pr-12" id="password" name="password" placeholder="Enter your password" required type="password" autocomplete="new-password" />
                  <button type="button" data-password-toggle="password" class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Show password">
                    <svg xmlns="http://www.w3.org/2000/svg" data-password-icon="show" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" data-password-icon="hide" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden h-5 w-5"><path d="m15 18-.722-3.25"></path><path d="M2 8a10.645 10.645 0 0 0 20 0"></path><path d="m20 15-1.726-2.05"></path><path d="m4 15 1.726-2.05"></path><path d="m9 18 .722-3.25"></path></svg>
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <label class="flex items-center gap-2 font-medium text-base" for="confirmPassword">Confirm Password</label>
                <div class="relative">
                  <input class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-12 text-base pr-12" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required type="password" autocomplete="new-password" />
                  <button type="button" data-password-toggle="confirmPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Show password">
                    <svg xmlns="http://www.w3.org/2000/svg" data-password-icon="show" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <svg xmlns="http://www.w3.org/2000/svg" data-password-icon="hide" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden h-5 w-5"><path d="m15 18-.722-3.25"></path><path d="M2 8a10.645 10.645 0 0 0 20 0"></path><path d="m20 15-1.726-2.05"></path><path d="m4 15 1.726-2.05"></path><path d="m9 18 .722-3.25"></path></svg>
                  </button>
                </div>
              </div>
              <div class="flex items-start space-x-3 pt-2">
                <input id="terms" name="terms" class="mt-0.5 h-4 w-4 rounded border border-input" required type="checkbox" />
                <label for="terms" class="text-sm text-muted-foreground leading-relaxed cursor-pointer">I agree to the <a class="text-primary hover:underline" href="${basePath}terms.html">Terms of Service</a> and <a class="text-primary hover:underline" href="${basePath}privacy.html">Privacy Policy</a></label>
              </div>
              <p data-auth-error class="hidden rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"></p>
              <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 w-full h-12 text-base" type="submit">Create Account</button>
            </form>
            <div class="text-center text-base">
              <span class="text-muted-foreground">Already have an account? </span>
              <a class="text-primary font-medium hover:underline" href="${window.AuctioAuth.buildAuthPageUrl("login", basePath)}">Sign In</a>
            </div>
            <div class="text-center pt-4">
              <a class="text-sm text-muted-foreground hover:text-foreground transition-colors" href="${basePath}index.html">← Back to Home</a>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-center relative bg-muted/30 overflow-hidden lg:min-h-0 min-h-[600px]">
          <div class="absolute inset-0">
            <img alt="Luxury watches and jewelry" class="object-cover h-full w-full" src="${basePath}luxury-jewelry-watches-display.jpg" />
            <div class="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/75"></div>
          </div>
          <div class="relative z-10 px-6 py-12 lg:px-16 xl:px-24 space-y-8 lg:space-y-12">
            <div class="space-y-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 lg:w-12 lg:h-12 text-primary/60"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path></svg>
              <blockquote class="text-xl lg:text-2xl xl:text-3xl font-serif leading-relaxed text-foreground">From rare timepieces to exceptional jewelry, the quality and authenticity of every item exceeded my expectations.</blockquote>
              <div class="space-y-1">
                <div class="font-semibold text-base lg:text-lg">Sarah Williams</div>
                <div class="text-sm text-muted-foreground">Watch Enthusiast</div>
              </div>
            </div>
            <div class="space-y-6 pt-6 lg:pt-8 border-t border-border/40">
              <div class="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-primary mt-0.5 flex-shrink-0"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
                <div>
                  <div class="font-semibold mb-1">Authenticity Guarantee</div>
                  <div class="text-sm text-muted-foreground">Every item is verified by our expert team</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-primary mt-0.5 flex-shrink-0"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
                <div>
                  <div class="font-semibold mb-1">Expert Curators</div>
                  <div class="text-sm text-muted-foreground">World-renowned specialists in every category</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-primary mt-0.5 flex-shrink-0"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>
                <div>
                  <div class="font-semibold mb-1">Secure Shipping</div>
                  <div class="text-sm text-muted-foreground">Insured worldwide delivery for all items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindPasswordToggle(button, input) {
    if (!button || !input) return;
    button.addEventListener("click", function () {
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      button.querySelector('[data-password-icon="show"]')?.classList.toggle("hidden", !showing);
      button.querySelector('[data-password-icon="hide"]')?.classList.toggle("hidden", showing);
      button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  }

  function setAuthSubmitState(button, isLoading, idleLabel, loadingLabel) {
    if (!button) return;
    if (!button.dataset.idleLabel) {
      button.dataset.idleLabel = idleLabel;
      button.dataset.loadingLabel = loadingLabel;
    }
    button.disabled = !!isLoading;
    button.innerHTML = isLoading
      ? `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"></circle>
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-90"></path>
        </svg>
        <span>${loadingLabel}</span>
      `
      : `<span>${idleLabel}</span>`;
  }

  function bindLoginPage(basePath) {
    if (window.AuctioAuth.getCurrentUser()) {
      window.location.replace(window.AuctioAuth.getPostAuthRedirect(basePath));
      return;
    }

    const root = document.querySelector("[data-auth-root]");
    if (!root) return;
    root.innerHTML = buildLoginPage(basePath);

    const form = document.querySelector("[data-auth-form]");
    const errorNode = document.querySelector("[data-auth-error]");
    const passwordInput = document.querySelector("#password");
    const passwordToggle = document.querySelector("[data-password-toggle]");
    if (!form || !errorNode || !passwordInput) return;

    bindPasswordToggle(passwordToggle, passwordInput);

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      errorNode.classList.add("hidden");
      const submitBtn = form.querySelector("[type=submit]");
      setAuthSubmitState(submitBtn, true, "Sign In", "Signing In...");
      const formData = new FormData(form);
      try {
        await window.AuctioAuth.login(formData.get("email"), formData.get("password"));
        window.location.href = window.AuctioAuth.getPostAuthRedirect(basePath);
      } catch (error) {
        errorNode.textContent = error.message || "Unable to log in.";
        errorNode.classList.remove("hidden");
        setAuthSubmitState(submitBtn, false, "Sign In", "Signing In...");
      }
    });
  }

  function bindRegisterPage(basePath) {
    if (window.AuctioAuth.getCurrentUser()) {
      window.location.replace(window.AuctioAuth.getPostAuthRedirect(basePath));
      return;
    }

    const root = document.querySelector("[data-auth-root]");
    if (!root) return;
    root.innerHTML = buildRegisterPage(basePath);

    const form = document.querySelector("[data-auth-form]");
    const errorNode = document.querySelector("[data-auth-error]");
    const passwordInput = document.querySelector("#password");
    const confirmPasswordInput = document.querySelector("#confirmPassword");
    if (!form || !errorNode || !passwordInput || !confirmPasswordInput) return;

    bindPasswordToggle(document.querySelector('[data-password-toggle="password"]'), passwordInput);
    bindPasswordToggle(document.querySelector('[data-password-toggle="confirmPassword"]'), confirmPasswordInput);

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      errorNode.classList.add("hidden");
      const submitBtn = form.querySelector("[type=submit]");
      const formData = new FormData(form);

      if (String(formData.get("password") || "") !== String(formData.get("confirmPassword") || "")) {
        errorNode.textContent = "Passwords do not match.";
        errorNode.classList.remove("hidden");
        return;
      }

      if (!formData.get("terms")) {
        errorNode.textContent = "You must accept the terms to continue.";
        errorNode.classList.remove("hidden");
        return;
      }

      setAuthSubmitState(submitBtn, true, "Create Account", "Creating Account...");
      try {
        await window.AuctioAuth.register({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          password: formData.get("password"),
        });
        window.location.href = window.AuctioAuth.getPostAuthRedirect(basePath);
      } catch (error) {
        if (error.isConfirmEmail) {
          errorNode.className = errorNode.className.replace(/border-red-\S+|bg-red-\S+|text-red-\S+/g, "").trim();
          errorNode.classList.add("border-green-200", "bg-green-50", "text-green-800");
        } else {
          errorNode.className = errorNode.className.replace(/border-green-\S+|bg-green-\S+|text-green-\S+/g, "").trim();
          errorNode.classList.add("border-red-200", "bg-red-50", "text-red-700");
          setAuthSubmitState(submitBtn, false, "Create Account", "Creating Account...");
        }
        errorNode.textContent = error.message || "Unable to create account.";
        errorNode.classList.remove("hidden");
      }
    });
  }

  function bindAccountPage(basePath) {
    const user = window.AuctioAuth.getCurrentUser();
    if (!user) {
      window.location.href = window.AuctioAuth.buildAuthPageUrl("login", basePath);
      return;
    }
    const profileKey = `auctio_profile_${user.id}`;
    const views = [
      { id: "overview", label: "Overview", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
      { id: "bids", label: "My Bids", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 8 8"></path><path d="m21 11-8-8"></path></svg>' },
      { id: "watchlist", label: "Watchlist", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>' },
      { id: "history", label: "Viewing History", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>' },
      { id: "settings", label: "Settings", icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>' },
    ];
    const allowedTabs = new Set(["overview", "bids", "watchlist", "history", "settings"]);
    const initialTab = new URLSearchParams(window.location.search).get("tab");
    let activeView = allowedTabs.has(initialTab) ? initialTab : "overview";
    let flash = { profile: null, password: null, danger: null };

    function setActionButtonState(button, isLoading, idleLabel, loadingLabel) {
      if (!button) return;
      button.disabled = !!isLoading;
      button.innerHTML = isLoading
        ? `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"></circle>
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-90"></path>
          </svg>
          <span>${loadingLabel}</span>
        `
        : `<span>${idleLabel}</span>`;
    }

    // ── Data cache ─────────────────────────────────────────────────────────
    const cache = { counts: null, bids: null, watchlist: null, history: null, notifications: null };

    async function loadDataForView(view) {
      if (!window.SupabaseAPI) return;
      try {
        if (view === "overview" && !cache.counts) {
          cache.counts = await window.SupabaseAPI.getCounts();
        }
        if (view === "bids" && !cache.bids) {
          cache.bids = await window.SupabaseAPI.getBids();
        }
        if (view === "watchlist" && !cache.watchlist) {
          cache.watchlist = await window.SupabaseAPI.getWatchlist();
        }
        if (view === "history" && !cache.history) {
          cache.history = await window.SupabaseAPI.getViewingHistory();
        }
        if (view === "settings" && !cache.notifications) {
          cache.notifications = await window.SupabaseAPI.getNotificationSettings();
        }
      } catch (_e) {}
    }

    function readStoredProfile() {
      try {
        return JSON.parse(window.localStorage.getItem(profileKey)) || {};
      } catch (_error) {
        return {};
      }
    }

    function writeStoredProfile(value) {
      try {
        window.localStorage.setItem(profileKey, JSON.stringify(value));
      } catch (_error) {}
    }

    function updateLegacyUserRecord(nextUser) {
      try {
        const users = JSON.parse(window.localStorage.getItem("auctio_users")) || [];
        const nextUsers = Array.isArray(users)
          ? users.map(function (entry) {
              if (entry.id !== nextUser.id) return entry;
              return {
                id: nextUser.id,
                firstName: nextUser.firstName || "",
                lastName: nextUser.lastName || "",
                email: nextUser.email || "",
                phone: nextUser.phone || "",
                password: entry.password || "__supabase__",
                createdAt: nextUser.createdAt || entry.createdAt || "",
              };
            })
          : [];
        window.localStorage.setItem("auctio_users", JSON.stringify(nextUsers));
      } catch (_error) {}
    }

    function getAccountState() {
      const currentUser = window.AuctioAuth.getCurrentUser() || user;
      const storedUsers = (() => {
        try {
          const users = JSON.parse(window.localStorage.getItem("auctio_users")) || [];
          return Array.isArray(users) ? users : [];
        } catch (_error) {
          return [];
        }
      })();
      const storedUser = storedUsers.find(function (entry) { return entry && entry.id === currentUser.id; }) || {};
      const stored = readStoredProfile();
      const initials = escapeHtml(
        [(currentUser.firstName || storedUser.firstName), (currentUser.lastName || storedUser.lastName)]
          .filter(Boolean)
          .map(function (part) {
            return String(part).trim().charAt(0).toUpperCase();
          })
          .join("")
          .slice(0, 2) || (currentUser.fullName || currentUser.email).slice(0, 1).toUpperCase()
      );
      const memberSince = currentUser.createdAt
        ? new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Recently joined";

      return {
        id: currentUser.id,
        fullName: `${currentUser.firstName || storedUser.firstName || ""} ${currentUser.lastName || storedUser.lastName || ""}`.trim() || currentUser.email,
        firstName: currentUser.firstName || storedUser.firstName || "",
        lastName: currentUser.lastName || storedUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || storedUser.phone || "",
        createdAt: currentUser.createdAt || "",
        initials,
        memberSince,
        country: (cache.notifications && cache.notifications._profile && cache.notifications._profile.country) || stored.country || "United States",
        street: (cache.notifications && cache.notifications._profile && cache.notifications._profile.street) || stored.street || "",
        city: (cache.notifications && cache.notifications._profile && cache.notifications._profile.city) || stored.city || "",
        state: (cache.notifications && cache.notifications._profile && cache.notifications._profile.state) || stored.state || "",
        zip: (cache.notifications && cache.notifications._profile && cache.notifications._profile.zip) || stored.zip || "",
      };
    }

    function buildNavButton(view, currentView, mobile) {
      const isActive = currentView === view.id;
      const baseClass = mobile
        ? "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors "
        : "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ";
      const stateClass = isActive
        ? mobile
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary"
        : mobile
          ? "bg-muted text-muted-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground";
      return `<button class="${baseClass}${stateClass}" type="button" data-account-view="${view.id}">${view.icon.replace("w-5 h-5", mobile ? "w-4 h-4" : "w-5 h-5")}<span class="font-medium">${view.label}</span></button>`;
    }

    function buildPlaceholderContent(title, copy) {
      const emptyStates = {
        "My Bids": {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16 text-muted-foreground mb-4"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 8 8"></path><path d="m21 11-8-8"></path></svg>',
          heading: "No bids yet",
          body: "You haven't placed any bids yet. Start exploring our auctions!",
          cta: "Start Bidding",
        },
        Watchlist: {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16 text-muted-foreground mb-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>',
          heading: "Your watchlist is empty",
          body: "Save favorite lots to your watchlist so you can follow them in one place.",
          cta: "Browse Lots",
        },
        "Viewing History": {
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16 text-muted-foreground mb-4"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>',
          heading: "No viewing history",
          body: "Recently viewed lots and auctions will appear here once you start browsing.",
          cta: "Explore Auctions",
        },
      };
      const state = emptyStates[title] || {
        icon: "",
        heading: `No ${title.toLowerCase()} yet`,
        body: copy,
        cta: "Browse Auctions",
      };
      return `
        <div class="flex-1 min-w-0">
          <div class="space-y-6">
            <div>
              <h1 class="text-2xl lg:text-3xl font-serif mb-2">${title}</h1>
              <p class="text-muted-foreground">${copy}</p>
            </div>
            <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-12">
              <div class="flex flex-col items-center justify-center text-center">
                ${state.icon}
                <h3 class="text-xl font-semibold mb-2">${state.heading}</h3>
                <p class="text-muted-foreground mb-6 max-w-md">${state.body}</p>
                <a class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2" href="${basePath}auctions.html">${state.cta}</a>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function buildOverviewContent(state) {
      return `
        <div class="flex-1 min-w-0">
          <div class="space-y-6">
            <div>
              <h1 class="text-2xl lg:text-3xl font-serif mb-2">Overview</h1>
              <p class="text-muted-foreground">Welcome back, ${escapeHtml(state.fullName)}</p>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-4 lg:p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-muted-foreground"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 8 8"></path><path d="m21 11-8-8"></path></svg>
                <p class="text-2xl lg:text-3xl font-bold">${cache.counts ? cache.counts.bids : "…"}</p>
                <p class="text-xs lg:text-sm text-muted-foreground">Active Bids</p>
              </div>
              <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-4 lg:p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-muted-foreground"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                <p class="text-2xl lg:text-3xl font-bold">${cache.counts ? cache.counts.watchlist : "…"}</p>
                <p class="text-xs lg:text-sm text-muted-foreground">Watchlist</p>
              </div>
              <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-4 lg:p-6 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-muted-foreground"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <p class="text-2xl lg:text-3xl font-bold">${cache.counts ? cache.counts.history : "…"}</p>
                <p class="text-xs lg:text-sm text-muted-foreground">Viewed</p>
              </div>
            </div>
            <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Account Information</h2>
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="p-2 rounded-lg bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-muted-foreground">Email</p>
                    <p class="font-medium truncate">${escapeHtml(state.email)}</p>
                  </div>
                </div>
                <div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"></div>
                <div class="flex items-start gap-4">
                  <div class="p-2 rounded-lg bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-muted-foreground">Phone</p>
                    <p class="font-medium">${escapeHtml(state.phone || "Not set")}</p>
                  </div>
                </div>
                <div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"></div>
                <div class="flex items-start gap-4">
                  <div class="p-2 rounded-lg bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-muted-foreground">Address</p>
                    <p class="font-medium">${escapeHtml(state.street || "Not set")}</p>
                  </div>
                </div>
              </div>
              <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-6 bg-transparent" type="button" data-account-view="settings">Edit Profile</button>
            </div>
            <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button class="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 justify-between bg-transparent" type="button" data-account-view="bids">
                  <span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 8 8"></path><path d="m21 11-8-8"></path></svg>View My Bids</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
                </button>
                <button class="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 justify-between bg-transparent" type="button" data-account-view="watchlist">
                  <span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>View Watchlist</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
                </button>
                <a class="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 justify-between bg-transparent" href="${basePath}auctions.html">
                  <span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>Browse Auctions</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
                </a>
                <button class="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 justify-between bg-transparent" type="button" data-account-view="settings">
                  <span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>Settings</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function buildSettingsContent(state) {
      const profileMessage = flash.profile
        ? `<p class="rounded-md border px-3 py-2 text-sm ${flash.profile.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}">${escapeHtml(flash.profile.text)}</p>`
        : "";
      const passwordMessage = flash.password
        ? `<p class="rounded-md border px-3 py-2 text-sm ${flash.password.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"}">${escapeHtml(flash.password.text)}</p>`
        : "";
      const dangerMessage = flash.danger
        ? `<p class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">${escapeHtml(flash.danger.text)}</p>`
        : "";

      return `
        <div class="flex-1 min-w-0">
          <div class="space-y-6">
            <div>
              <h1 class="text-2xl lg:text-3xl font-serif mb-2">Account Settings</h1>
              <p class="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">${views[0].icon}Personal Information</h2>
              ${profileMessage}
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-first-name">First Name</label>
                    <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-first-name" placeholder="Enter first name" value="${escapeHtml(state.firstName)}">
                  </div>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-last-name">Last Name</label>
                    <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-last-name" placeholder="Enter last name" value="${escapeHtml(state.lastName)}">
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-email">Email</label>
                  <input class="border-input bg-muted ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-base md:text-sm" id="account-email" disabled type="email" value="${escapeHtml(state.email)}">
                  <p class="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-phone">Phone</label>
                  <input autocomplete="tel" class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-phone" placeholder="+1" type="tel" value="${escapeHtml(state.phone)}">
                </div>
              </div>
              <button data-save-profile="personal" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 mt-6">Save Changes</button>
            </div>
            <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>Shipping Address</h2>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-country">Country</label>
                  <select id="account-country" class="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2">
                    ${renderCountryOptions(state.country || "United States")}
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-street">Street Address</label>
                  <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-street" placeholder="Enter street address" value="${escapeHtml(state.street)}">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-city">City</label>
                    <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-city" placeholder="Enter city" value="${escapeHtml(state.city)}">
                  </div>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-state">State</label>
                    <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-state" placeholder="Enter state" value="${escapeHtml(state.state)}">
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-zip">ZIP Code</label>
                  <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full max-w-[200px] rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-zip" placeholder="Enter postal code" value="${escapeHtml(state.zip)}">
                </div>
              </div>
              <button data-save-profile="address" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 mt-6">Save Changes</button>
            </div>
            <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>Security</h2>
              ${passwordMessage}
              <div class="space-y-4">
                <div class="space-y-2">
                  <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-current-password">Current Password</label>
                  <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-current-password" placeholder="Enter current password" type="password">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-new-password">New Password</label>
                    <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-new-password" placeholder="Enter new password" type="password">
                  </div>
                  <div class="space-y-2">
                    <label class="flex items-center gap-2 text-sm leading-none font-medium" for="account-confirm-password">Confirm New Password</label>
                    <input class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:text-sm" id="account-confirm-password" placeholder="Confirm new password" type="password">
                  </div>
                </div>
              </div>
              <button data-change-password class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 mt-6">Change Password</button>
            </div>
            <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6 border-destructive/50">
              <h2 class="text-lg font-semibold mb-2 text-destructive">Danger Zone</h2>
              <p class="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              ${dangerMessage}
              <button data-delete-account class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-destructive text-white hover:bg-destructive/90 h-9 px-4 py-2">Delete Account</button>
            </div>
            <div class="lg:hidden">
              <button data-account-logout class="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full justify-center gap-2 text-muted-foreground bg-transparent" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                Log Out
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function formatCurrency(v) { return "€" + Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }); }
    function timeAgo(iso) {
      if (!iso) return "";
      var d = new Date(iso), now = new Date(), diff = Math.floor((now - d) / 1000);
      if (diff < 60) return "just now";
      if (diff < 3600) return Math.floor(diff / 60) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      return Math.floor(diff / 86400) + "d ago";
    }

    function formatDate(iso) {
      if (!iso) return "—";
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    function buildWonInvoiceBlock(item) {
      if (!item || item.status !== "won") return "";
      var invoiceNumber = item.invoiceNumber || "INV-2026-1048";
      var issuedAt = item.invoiceIssuedAt || item.placedAt;
      var dueAt = item.invoiceDueAt || item.placedAt;
      var amountDue = Number(item.invoiceAmount || item.currentBid || item.bidAmount || 0);
      return `
        <details class="mt-3 rounded-lg border border-blue-200 bg-blue-50/70">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium text-blue-900">
            <span>Payment by invoice</span>
            <span class="text-xs text-blue-700">View details</span>
          </summary>
          <div class="space-y-3 border-t border-blue-200 px-3 py-3">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p class="text-blue-700/80">Invoice</p>
                <p class="font-semibold text-blue-950">${escapeHtml(invoiceNumber)}</p>
              </div>
              <div>
                <p class="text-blue-700/80">Amount due</p>
                <p class="font-semibold text-blue-950">${formatCurrency(amountDue)}</p>
              </div>
              <div>
                <p class="text-blue-700/80">Issued</p>
                <p class="font-semibold text-blue-950">${formatDate(issuedAt)}</p>
              </div>
              <div>
                <p class="text-blue-700/80">Due date</p>
                <p class="font-semibold text-blue-950">${formatDate(dueAt)}</p>
              </div>
            </div>
            <div class="rounded-md bg-white/80 p-3 text-xs text-blue-950">
              <p class="font-semibold mb-1">Bank transfer / invoice payment</p>
              <p class="text-blue-800">Use the invoice number as payment reference. Settlement is made by bank transfer after the auction win, not by card.</p>
            </div>
          </div>
        </details>`;
    }

    function buildBidInvoiceCommitmentBlock(item) {
      if (!item || item.status !== "active" || item.paymentMethod !== "invoice") return "";
      var amount = Number(item.invoiceAmount || item.bidAmount || item.currentBid || 0);
      var recipient = item.invoiceRecipient || "Verified bidder";
      var reference = item.invoiceReference || "On file";
      var invoiceNumber = item.invoiceNumber || "PFI-00000000";
      var transferStatus = item.transferStatus || "pending_verification";
      return `
        <details class="mt-3 rounded-lg border border-amber-200 bg-amber-50/80">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium text-amber-950">
            <span>Bank transfer submitted</span>
            <span class="text-xs text-amber-700">${escapeHtml(transferStatus.replace(/_/g, " "))}</span>
          </summary>
          <div class="space-y-3 border-t border-amber-200 px-3 py-3">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p class="text-amber-700/80">Invoice</p>
                <p class="font-semibold text-amber-950">${escapeHtml(invoiceNumber)}</p>
              </div>
              <div>
                <p class="text-amber-700/80">Transfer amount</p>
                <p class="font-semibold text-amber-950">${formatCurrency(amount)}</p>
              </div>
              <div>
                <p class="text-amber-700/80">Sender</p>
                <p class="font-semibold text-amber-950">${escapeHtml(recipient)}</p>
              </div>
              <div>
                <p class="text-amber-700/80">Reference</p>
                <p class="font-semibold text-amber-950">${escapeHtml(reference)}</p>
              </div>
              <div>
                <p class="text-amber-700/80">Authorized</p>
                <p class="font-semibold text-amber-950">${formatDate(item.invoiceAuthorizedAt || item.placedAt)}</p>
              </div>
            </div>
            <div class="rounded-md bg-white/80 p-3 text-xs text-amber-950">
              <p class="font-semibold mb-1">Bank details used for payment</p>
              <p class="text-amber-900">Beneficiary: Auctio Holdings Ltd. IBAN: DE89 3704 0044 0532 0130 00. SWIFT/BIC: DEUTDEBBXXX.</p>
            </div>
          </div>
        </details>`;
    }

    function buildLotCard(item, actions) {
      var img = item.lotImage
        ? `<img src="${escapeHtml(item.lotImage)}" alt="${escapeHtml(item.lotTitle)}" class="w-full h-full object-cover">`
        : `<div class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No image</div>`;
      var href = item.lotSlug ? `${basePath}lot/index.html?slug=${escapeHtml(item.lotSlug)}` : "#";
      return `
        <div class="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col" data-lot-id="${escapeHtml(item.lotId)}">
          <a href="${href}" class="block aspect-[4/3] overflow-hidden bg-muted flex-shrink-0">${img}</a>
          <div class="p-4 flex flex-col gap-2 flex-1">
            <a href="${href}" class="text-sm font-medium line-clamp-2 hover:underline">${escapeHtml(item.lotTitle)}</a>
            <p class="text-xs text-muted-foreground">Current bid: <span class="font-semibold text-foreground">${formatCurrency(item.currentBid || item.bidAmount)}</span></p>
            ${actions || ""}
          </div>
        </div>`;
    }

    function buildWatchlistContent() {
      var items = cache.watchlist;
      if (!items) return `<div class="flex-1 min-w-0"><div class="flex items-center justify-center py-20 text-muted-foreground">Loading…</div></div>`;
      if (!items.length) return buildPlaceholderContent("Watchlist", "Save lots you want to follow closely.");
      return `
        <div class="flex-1 min-w-0">
          <div class="space-y-6">
            <div><h1 class="text-2xl lg:text-3xl font-serif mb-2">Watchlist</h1><p class="text-muted-foreground">${items.length} saved lot${items.length !== 1 ? "s" : ""}</p></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              ${items.map(function(item) {
                return buildLotCard(item, `<button type="button" data-remove-watchlist="${escapeHtml(item.lotId)}" class="mt-auto text-xs text-muted-foreground hover:text-destructive transition-colors">Remove from watchlist</button>`);
              }).join("")}
            </div>
          </div>
        </div>`;
    }

    function buildHistoryContent() {
      var items = cache.history;
      if (!items) return `<div class="flex-1 min-w-0"><div class="flex items-center justify-center py-20 text-muted-foreground">Loading…</div></div>`;
      if (!items.length) return buildPlaceholderContent("Viewing History", "Review recently viewed lots and auctions.");
      return `
        <div class="flex-1 min-w-0">
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div><h1 class="text-2xl lg:text-3xl font-serif mb-2">Viewing History</h1><p class="text-muted-foreground">${items.length} recently viewed</p></div>
              <button type="button" data-clear-history class="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear history</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              ${items.map(function(item) {
                return buildLotCard(item, `<p class="mt-auto text-xs text-muted-foreground">Viewed ${timeAgo(item.viewedAt)}</p>`);
              }).join("")}
            </div>
          </div>
        </div>`;
    }

    function buildBidsContent() {
      var items = cache.bids;
      if (!items) return `<div class="flex-1 min-w-0"><div class="flex items-center justify-center py-20 text-muted-foreground">Loading…</div></div>`;
      if (!items.length) return buildPlaceholderContent("My Bids", "Track your live and past bidding activity.");
      var statusBadge = { active: "bg-green-100 text-green-800", won: "bg-blue-100 text-blue-800", outbid: "bg-yellow-100 text-yellow-800", lost: "bg-red-100 text-red-800" };
      return `
        <div class="flex-1 min-w-0">
          <div class="space-y-6">
            <div><h1 class="text-2xl lg:text-3xl font-serif mb-2">My Bids</h1><p class="text-muted-foreground">${items.length} bid${items.length !== 1 ? "s" : ""} placed</p></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              ${items.map(function(item) {
                var badge = statusBadge[item.status] || "bg-muted text-muted-foreground";
                return buildLotCard(item, `
                  <div class="mt-auto flex items-center justify-between gap-2">
                    <span class="text-xs font-medium">Your bid: ${formatCurrency(item.bidAmount)}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full ${badge}">${escapeHtml(item.status)}</span>
                  </div>
                  <p class="text-xs text-muted-foreground">${timeAgo(item.placedAt)}</p>
                  ${buildBidInvoiceCommitmentBlock(item)}
                  ${buildWonInvoiceBlock(item)}`);
              }).join("")}
            </div>
          </div>
        </div>`;
    }

    function buildMainContent(state) {
      if (activeView === "settings") return buildSettingsContent(state);
      if (activeView === "bids") return buildBidsContent();
      if (activeView === "watchlist") return buildWatchlistContent();
      if (activeView === "history") return buildHistoryContent();
      return buildOverviewContent(state);
    }

    function render() {
      const state = getAccountState();
      renderWideShell(
        `
          <div class="flex flex-col lg:flex-row gap-8">
            <aside class="hidden lg:block w-72 flex-shrink-0">
              <div class="sticky top-24 space-y-6">
                <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-6">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl">${state.initials}</div>
                    <div class="flex-1 min-w-0">
                      <h2 class="font-semibold text-lg truncate">${escapeHtml(state.fullName)}</h2>
                      <p class="text-sm text-muted-foreground truncate">${escapeHtml(state.email)}</p>
                    </div>
                  </div>
                  <p class="text-xs text-muted-foreground">Member since ${escapeHtml(state.memberSince)}</p>
                </div>
                <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm p-2">
                  <nav class="space-y-1">${views.map(function (view) { return buildNavButton(view, activeView, false); }).join("")}</nav>
                </div>
                <button data-account-logout class="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent h-9 px-4 py-2 w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:border-destructive bg-transparent" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                  Log Out
                </button>
              </div>
            </aside>
            <div class="lg:hidden">
              <div class="px-4 py-4 mb-2">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">${state.initials}</div>
                  <div class="flex-1 min-w-0">
                    <h2 class="font-semibold truncate">${escapeHtml(state.fullName)}</h2>
                    <p class="text-xs text-muted-foreground">Member since ${escapeHtml(state.memberSince)}</p>
                  </div>
                </div>
              </div>
              <div class="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">${views.map(function (view) { return buildNavButton(view, activeView, true); }).join("")}</div>
            </div>
            ${buildMainContent(state)}
          </div>
        `,
        "My account",
        "Manage your collector profile and account details."
      );

      document.querySelectorAll("[data-account-view]").forEach(function (button) {
        button.addEventListener("click", async function () {
          const nextView = button.getAttribute("data-account-view");
          activeView = allowedTabs.has(nextView) ? nextView : "overview";
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set("tab", activeView);
          window.history.replaceState({}, "", nextUrl.toString());
          render(); // show loading state immediately
          await loadDataForView(activeView);
          render(); // re-render with real data
        });
      });

      // Watchlist remove button
      document.querySelectorAll("[data-remove-watchlist]").forEach(function(btn) {
        btn.addEventListener("click", async function() {
          const lotId = btn.getAttribute("data-remove-watchlist");
          if (window.SupabaseAPI) {
            btn.disabled = true;
            await window.SupabaseAPI.removeFromWatchlist(lotId).catch(function(){});
            cache.watchlist = null; cache.counts = null;
            await loadDataForView("watchlist");
            await loadDataForView("overview");
            render();
          }
        });
      });

      // Clear history button
      const clearHistoryBtn = document.querySelector("[data-clear-history]");
      if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", async function() {
          if (window.SupabaseAPI) {
            clearHistoryBtn.disabled = true;
            await window.SupabaseAPI.clearViewingHistory().catch(function(){});
            cache.history = null; cache.counts = null;
            await loadDataForView("history");
            await loadDataForView("overview");
            render();
          }
        });
      }

      document.querySelectorAll("[data-account-logout]").forEach(function (button) {
        button.addEventListener("click", function () {
          Promise.resolve(window.AuctioAuth.logout()).then(function () {
            window.location.href = basePath + "index.html";
          });
        });
      });

      const saveProfileButtons = Array.from(document.querySelectorAll("[data-save-profile]"));
      if (saveProfileButtons.length) {
        saveProfileButtons.forEach(function (saveProfileButton) {
          saveProfileButton.addEventListener("click", async function () {
            const saveMode = saveProfileButton.getAttribute("data-save-profile");
            setActionButtonState(saveProfileButton, true, "Save Changes", "Saving...");

            const personalState = {
              firstName: document.querySelector("#account-first-name")?.value.trim() || "",
              lastName: document.querySelector("#account-last-name")?.value.trim() || "",
              phone: document.querySelector("#account-phone")?.value.trim() || "",
            };
            const addressState = {
              country: document.querySelector("#account-country")?.value || "United States",
              street: document.querySelector("#account-street")?.value.trim() || "",
              city: document.querySelector("#account-city")?.value.trim() || "",
              state: document.querySelector("#account-state")?.value.trim() || "",
              zip: document.querySelector("#account-zip")?.value.trim() || "",
            };

            if (saveMode === "personal") {
              const hasAnyPersonalValue = Object.values(personalState).some(function (value) {
                return String(value || "").trim() !== "";
              });

              if (!hasAnyPersonalValue) {
                flash.profile = { type: "error", text: "Fill in your personal information before saving." };
                setActionButtonState(saveProfileButton, false, "Save Changes", "Saving...");
                render();
                return;
              }

              if (!personalState.firstName || !personalState.lastName) {
                flash.profile = { type: "error", text: "First name and last name cannot be empty." };
                setActionButtonState(saveProfileButton, false, "Save Changes", "Saving...");
                render();
                return;
              }

              try {
                if (window.SupabaseAPI) {
                  await window.SupabaseAPI.updateProfile({
                    firstName: personalState.firstName,
                    lastName: personalState.lastName,
                    phone: personalState.phone,
                  });
                }
                updateLegacyUserRecord({
                  id: state.id,
                  firstName: personalState.firstName,
                  lastName: personalState.lastName,
                  fullName: `${personalState.firstName} ${personalState.lastName}`.trim() || state.email || "Collector",
                  email: state.email,
                  phone: personalState.phone,
                  createdAt: state.createdAt,
                });
                if (window.AuctioAuth && typeof window.AuctioAuth.refreshCurrentUser === "function") {
                  await window.AuctioAuth.refreshCurrentUser();
                }
                flash.profile = { type: "success", text: "Personal information updated." };
              } catch (error) {
                flash.profile = { type: "error", text: error.message || "Unable to save personal information." };
              }

              render();
              return;
            }

            const hasAnyAddressValue = Object.values(addressState).some(function (value) {
              return String(value || "").trim() !== "";
            });

            if (!hasAnyAddressValue) {
              flash.profile = { type: "error", text: "Fill in your address before saving." };
              setActionButtonState(saveProfileButton, false, "Save Changes", "Saving...");
              render();
              return;
            }

            try {
              if (window.SupabaseAPI) {
                await window.SupabaseAPI.updateProfile({
                  address: addressState.street,
                  city: addressState.city,
                  state: addressState.state,
                  postalCode: addressState.zip,
                  country: addressState.country,
                });
              }
              writeStoredProfile({
                country: addressState.country,
                street: addressState.street,
                city: addressState.city,
                state: addressState.state,
                zip: addressState.zip,
              });
              cache.notifications = Object.assign({}, cache.notifications || {}, {
                _profile: {
                  country: addressState.country,
                  street: addressState.street,
                  city: addressState.city,
                  state: addressState.state,
                  zip: addressState.zip,
                },
              });
              flash.profile = { type: "success", text: "Shipping address updated." };
            } catch (error) {
              flash.profile = { type: "error", text: error.message || "Unable to save shipping address." };
            }

            render();
          });
        });
      }

      const changePasswordButton = document.querySelector("[data-change-password]");
      if (changePasswordButton) {
        changePasswordButton.addEventListener("click", async function () {
          setActionButtonState(changePasswordButton, true, "Change Password", "Updating...");
          const currentPassword = document.querySelector("#account-current-password")?.value || "";
          const newPassword = document.querySelector("#account-new-password")?.value || "";
          const confirmPassword = document.querySelector("#account-confirm-password")?.value || "";

          if (!currentPassword) {
            flash.password = { type: "error", text: "Enter your current password." };
            setActionButtonState(changePasswordButton, false, "Change Password", "Updating...");
            render();
            return;
          }
          if (newPassword.length < 8) {
            flash.password = { type: "error", text: "New password must be at least 8 characters." };
            setActionButtonState(changePasswordButton, false, "Change Password", "Updating...");
            render();
            return;
          }
          if (newPassword !== confirmPassword) {
            flash.password = { type: "error", text: "New passwords do not match." };
            setActionButtonState(changePasswordButton, false, "Change Password", "Updating...");
            render();
            return;
          }

          try {
            if (!window.SupabaseAPI) throw new Error("Supabase is not available.");
            await window.SupabaseAPI.changePassword(currentPassword, newPassword);
            const currentField = document.querySelector("#account-current-password");
            const newField = document.querySelector("#account-new-password");
            const confirmField = document.querySelector("#account-confirm-password");
            if (currentField) currentField.value = "";
            if (newField) newField.value = "";
            if (confirmField) confirmField.value = "";
            flash.password = { type: "success", text: "Password updated successfully." };
          } catch (error) {
            flash.password = { type: "error", text: error.message || "Unable to change password." };
          }

          render();
        });
      }

      const deleteAccountButton = document.querySelector("[data-delete-account]");
      if (deleteAccountButton) {
        deleteAccountButton.addEventListener("click", function () {
          flash.danger = { text: "Account deletion is not available in this static copy." };
          render();
        });
      }
    }

    // Async init: load data for initial view, then render
    (async function initAccount() {
      render(); // immediate render with loading placeholders
      await loadDataForView(activeView);
      render(); // re-render with real data
    })();
  }

  function init() {
    const page = document.body.getAttribute("data-auth-page");
    const basePath = getBasePath();
    if (!window.AuctioAuth) return;

    if (page === "login") {
      bindLoginPage(basePath);
    } else if (page === "register") {
      bindRegisterPage(basePath);
    } else if (page === "account") {
      bindAccountPage(basePath);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
