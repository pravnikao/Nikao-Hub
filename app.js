(() => {
  const data = window.NIKAO_ROADMAP;
  const tracks = data.tracks || [];

  // Selected track lives in memory only — no localStorage in this environment.
  // Reload always returns to the first track (Testing).
  let track = tracks[0];
  let categories = [];
  let allResources = [];

  const state = { category: null, tab: null, hubTab: "home", currentSkill: null };

  // ---------------------------------------------------------------- tab config
  // One entry per track, so a future track declares its own tabs without
  // touching the tab machinery. A track with a single primary tab hides the
  // primary bar and promotes the hub sub-strip to main navigation.
  const TRACK_TABS = {
    testing: {
      default: "overview",
      tabs: [
        { id: "overview",     label: "Overview" },
        { id: "capabilities", label: "Our capabilities" },
        { id: "approach",     label: "How we work" },
        { id: "ai",           label: "AI & quality" },
        { id: "hub",          label: "Growth Hub" }
      ]
    },
    engineering: {
      default: "hub",
      tabs: [
        { id: "hub", label: "Growth Hub" }
      ]
    }
  };

  const HUB_SUBTABS = [
    { id: "home",           label: "Overview" },
    { id: "skills",         label: "Explore skills" },
    { id: "library",        label: "Learning library" },
    { id: "paths",          label: "Learning paths" },
    { id: "certifications", label: "Certifications" },
    { id: "platforms",      label: "Platforms" }
  ];

  const SITE_NAME = "Nikao Hub";
  const OVERVIEW_TITLE = "Quality Engineering & Assurance | Nikao Hub";
  const OVERVIEW_DESCRIPTION = "Hands-on quality engineering for complex change. Explore Nikao’s assurance, testing, automation, integration and migration capabilities.";
  const HUB_DESCRIPTION = "Curated learning roadmaps for testing and engineering — courses, videos and references sourced from Nikao's learning roadmaps.";

  // Showcase tabs get the contact band; the Growth Hub does not.
  const SHOWCASE_TABS = new Set(["overview", "capabilities", "approach", "ai"]);

  // ---------------------------------------------------------------- helpers
  const qs = selector => document.querySelector(selector);
  const qsa = (selector, scope) => [...(scope || document).querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
  const slugify = value => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const typeLabel = type => ({ course: "Course", video: "Video", article: "Reference" }[type] || "Resource");
  const looseMatch = (a, b) => {
    const al = String(a ?? "").toLowerCase();
    const bl = String(b ?? "").toLowerCase();
    return !!al && !!bl && (al.includes(bl) || bl.includes(al));
  };
  const pad2 = n => String(n).padStart(2, "0");

  // Engineering resources carry level/mandatory instead of the
  // premium / free-YouTube / free-references split the Testing track uses.
  const isLeveled = () => track.resourceModel === "leveled";
  const tabConfig = () => TRACK_TABS[track.id] || TRACK_TABS.testing;
  const hasTab = id => tabConfig().tabs.some(t => t.id === id);
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------- copy
  const TRACK_COPY = {
    testing: {
      homeEyebrow: "QA growth hub",
      homeHeading: "Confidence in testing, built one skill at a time.",
      homeLead: "Every course, video and reference in this hub is pulled directly from Nikao's Complete QA & Test Engineering Learning Roadmap — nothing added, nothing invented.",
      showValueSection: true,
      skillsLead: "Discover the areas of testing that interest you. Choose a category, then open a skill to see its resources.",
      libraryLead: count => `Search and filter all ${count} verified courses, videos and references in one place.`,
      pathsEyebrow: "Quick reference",
      pathsLead: "Three experience-based routes, taken directly from the roadmap's quick-reference section.",
      certsEyebrow: "Researched, not guessed",
      certsLead: "One or two credentials per category, checked against official certifying-body sites (ISTQB, OffSec, EC-Council, Postman, ICAgile) rather than course marketplaces. Each links to the certifying body directly, not a training vendor."
    },
    // PLACEHOLDER COPY — needs sign-off from the dev-side content owner.
    engineering: {
      homeEyebrow: "Engineering growth hub",
      homeHeading: "Skills and resources for every engineering level",
      homeLead: "Courses, videos and references from the engineering learning roadmap, grouped by skill and tagged with the engineering level they apply to.",
      showValueSection: false,
      skillsLead: "Choose a category, then open a skill to see its resources.",
      libraryLead: count => `Search and filter all ${count} courses, videos and references in one place.`,
      pathsEyebrow: "Engineering levels",
      pathsLead: "One route per engineering level, built from the level tagged on each resource.",
      certsEyebrow: "From the roadmap",
      certsLead: "Credentials named directly in the engineering roadmap, linked to the official source."
    }
  };
  const copy = () => TRACK_COPY[track.id] || TRACK_COPY.testing;

  // ---------------------------------------------------------------- lookups
  function findSkillByLooseName(name) {
    for (const category of categories) {
      for (const skill of category.skills) {
        if (looseMatch(skill.name, name)) return { category, skill };
      }
    }
    return null;
  }

  function findSkill(slug) {
    for (const category of categories) {
      for (const skill of category.skills) {
        if (slugify(skill.name) === slug) return { category, skill };
      }
    }
    return null;
  }

  function findSkillByExactName(name) {
    for (const category of categories) {
      for (const skill of category.skills) {
        if (skill.name === name) return { category, skill };
      }
    }
    return null;
  }

  function topResourceForSkill(skill) {
    const bySection = section => skill.resources.find(r => r.section === section);
    return bySection("Premium Courses") || bySection("Free YouTube") || bySection("Free References") || null;
  }

  // ================================================================ TABS
  // Built once per track. Tab *state* is updated in place by syncTabStates()
  // so switching tabs never destroys the focused button.
  function buildTabBars() {
    const config = tabConfig();
    const single = config.tabs.length <= 1;

    // One primary tab -> hide the bar; the hub sub-strip becomes main nav.
    qs("#primaryTabBar").hidden = single;
    qs("#primaryTabList").innerHTML = single ? "" : config.tabs.map(tab => `
      <button class="tab" type="button" role="tab" id="tab-${tab.id}"
        aria-controls="panel-${tab.id}" aria-selected="false" tabindex="-1"
        data-tab="${tab.id}">${escapeHtml(tab.label)}</button>
    `).join("");

    qs("#hubTabList").innerHTML = HUB_SUBTABS.map(tab => `
      <button class="tab" type="button" role="tab" id="hubtab-${tab.id}"
        aria-controls="hubpanel-${tab.id}" aria-selected="false" tabindex="-1"
        data-hub-tab="${tab.id}">${escapeHtml(tab.label)}</button>
    `).join("");

    syncPanelWiring();
  }

  // A track with a single primary tab renders no tab buttons, so the static
  // role="tabpanel" and aria-labelledby="tab-…" that every panel carries would
  // point at elements that never exist. Keep the wiring only where its tab is
  // really there; elsewhere drop both, leaving a plain section.
  function syncPanelWiring() {
    qsa("#main > .tabpanel").forEach(panel => {
      const tabId = panel.id.replace(/^panel-/, "");
      if (document.getElementById(`tab-${tabId}`)) {
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", `tab-${tabId}`);
      } else {
        panel.removeAttribute("role");
        panel.removeAttribute("aria-labelledby");
      }
    });
  }

  // With no tab to name it, the hub takes its name from the heading on show,
  // so the region is still announced with something meaningful.
  function labelHubRegion() {
    const hub = qs("#panel-hub");
    if (!hub || hub.getAttribute("role") === "tabpanel") return;   // named by its tab
    const sub = qsa(".hub-panel").find(panel => !panel.hidden);
    const heading = sub && sub.querySelector("h1");
    if (!heading) { hub.removeAttribute("aria-labelledby"); return; }
    if (!heading.id) heading.id = `heading-${sub.id}`;
    hub.setAttribute("aria-labelledby", heading.id);
  }

  function syncTabStates() {
    const hubActive = state.currentSkill ? "skills" : state.hubTab;
    const mark = (nodes, activeId, key) => nodes.forEach(node => {
      const on = node.dataset[key] === activeId;
      node.setAttribute("aria-selected", String(on));
      node.tabIndex = on ? 0 : -1;
    });
    mark(qsa("#primaryTabList .tab"), state.tab, "tab");
    mark(qsa("#hubTabList .tab"), hubActive, "hubTab");
  }

  function updateScrollHints() {
    qsa(".tabbar").forEach(bar => {
      const strip = bar.querySelector(".tabbar-scroll");
      if (!strip) return;
      bar.classList.toggle("is-scrollable", strip.scrollWidth > strip.clientWidth + 1);
    });
  }

  function scrollActiveTabIntoView() {
    qsa('.tab[aria-selected="true"]').forEach(tab => {
      const strip = tab.closest(".tabbar-scroll");
      if (!strip || strip.scrollWidth <= strip.clientWidth + 1) return;
      const left = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
      strip.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? "auto" : "smooth" });
    });
  }

  // Measures what is genuinely pinned right now. Desktop pins the header;
  // mobile pins the primary tab bar, or the hub strip when there is no
  // primary bar. Reading computed position keeps this honest across both.
  function stickyOffset() {
    return [qs(".site-header"), qs("#primaryTabBar"), qs(".tabbar-sub")].reduce((sum, el) => {
      if (!el || el.hidden || !el.offsetParent) return sum;
      return getComputedStyle(el).position === "sticky" ? sum + el.offsetHeight : sum;
    }, 0);
  }

  // Anchor jumps and scrollIntoView must clear the pinned bar. Mobile height
  // varies with which bar is pinned, so set it from the measurement; on wider
  // screens clear the inline value and let the stylesheet own it.
  function syncScrollPadding() {
    const root = document.documentElement;
    if (window.matchMedia("(max-width: 700px)").matches) {
      root.style.scrollPaddingTop = (stickyOffset() + 8) + "px";
    } else {
      root.style.removeProperty("scroll-padding-top");
    }
  }

  function showPanels() {
    const config = tabConfig();
    const panelId = `panel-${state.tab}`;

    // Only panels belonging to the active track are eligible.
    qsa("#main > .tabpanel").forEach(panel => {
      const owner = panel.dataset.track;
      const eligible = (!owner || owner === track.id) && config.tabs.some(t => `panel-${t.id}` === panel.id);
      panel.hidden = !(eligible && panel.id === panelId);
    });

    const hubSub = state.currentSkill ? "skillDetail" : state.hubTab;
    qsa(".hub-panel").forEach(panel => {
      panel.hidden = panel.id !== `hubpanel-${hubSub}`;
    });

    qs("#contactBand").hidden = !SHOWCASE_TABS.has(state.tab);
    labelHubRegion();
  }

  function animatePanel() {
    if (reducedMotion()) return;
    const panel = state.tab === "hub"
      ? qs(`#hubpanel-${state.currentSkill ? "skillDetail" : state.hubTab}`)
      : qs(`#panel-${state.tab}`);
    if (!panel) return;
    panel.classList.remove("is-entering");
    void panel.offsetWidth; // restart the animation
    panel.classList.add("is-entering");
    // Drop the class once it has played. A finished animation keeps the panel
    // on its own compositing layer, which switches all its text to greyscale
    // antialiasing and leaves it there for the life of the page.
    window.clearTimeout(panel._enterTimer);
    panel._enterTimer = window.setTimeout(() => panel.classList.remove("is-entering"), 260);
  }

  function currentTitle() {
    if (state.tab === "overview" && track.id === "testing") return OVERVIEW_TITLE;
    if (state.tab === "hub") {
      if (state.currentSkill) {
        const found = findSkill(state.currentSkill);
        if (found) return `${found.skill.name} | ${SITE_NAME}`;
      }
      if (state.hubTab === "home") return SITE_NAME;
      const sub = HUB_SUBTABS.find(t => t.id === state.hubTab);
      return sub ? `${sub.label} | ${SITE_NAME}` : SITE_NAME;
    }
    const tab = tabConfig().tabs.find(t => t.id === state.tab);
    return tab ? `${tab.label} | ${SITE_NAME}` : SITE_NAME;
  }

  function currentHash() {
    if (state.tab !== "hub") return `#${state.tab}`;
    if (state.currentSkill) return `#skill/${state.currentSkill}`;
    if (state.hubTab === "home") return "#hub";
    return `#${state.hubTab}`;
  }

  function syncChrome() {
    document.title = currentTitle();
    const onOverview = state.tab === "overview" && track.id === "testing";
    qs("#metaDescription").setAttribute("content", onOverview ? OVERVIEW_DESCRIPTION : HUB_DESCRIPTION);
  }

  function scrollToPanelTop() {
    const behavior = reducedMotion() ? "auto" : "smooth";
    // Primary tabs always open at the banner; sub-tabs align below the sticky chrome.
    if (state.tab !== "hub" || state.hubTab === "home" && !state.currentSkill) {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const hub = qs("#panel-hub");
    if (!hub) { window.scrollTo({ top: 0, behavior }); return; }
    const top = window.scrollY + hub.getBoundingClientRect().top - stickyOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  /**
   * Single entry point for every navigation.
   * opts.push  — add a history entry (tab clicks) vs replace (initial load, popstate)
   * opts.quiet — skip scrolling and motion (initial load)
   */
  function goTo(tab, opts = {}) {
    const { hubTab, skillSlug = null, push = true, quiet = false } = opts;

    state.tab = hasTab(tab) ? tab : tabConfig().default;
    if (hubTab !== undefined) state.hubTab = hubTab;
    state.currentSkill = skillSlug;

    syncTabStates();
    showPanels();
    // Measure the strips only once their panel is visible — a hidden bar is 0px wide.
    updateScrollHints();
    syncScrollPadding();
    syncChrome();

    const hash = currentHash();
    if (push && location.hash !== hash) history.pushState({ tab: state.tab }, "", hash);
    else if (!push) history.replaceState({ tab: state.tab }, "", hash);

    if (!quiet) { animatePanel(); scrollToPanelTop(); }
    scrollActiveTabIntoView();
  }

  // ---------------------------------------------------------------- routing
  function applyRoute(rawHash, opts = {}) {
    const hash = String(rawHash || "").replace(/^#/, "");
    const fallback = tabConfig().default;

    if (hash.startsWith("skill/")) {
      const slug = hash.slice("skill/".length);
      if (hasTab("hub") && findSkill(slug)) {
        renderSkillDetail(slug, opts);
        return;
      }
      goTo(fallback, { hubTab: "home", ...opts });
      return;
    }

    // Legacy: #home was the hub landing page; it now opens the track's Overview.
    if (hash === "home" || hash === "overview") {
      goTo(hasTab("overview") ? "overview" : fallback, { hubTab: "home", ...opts });
      return;
    }

    if (HUB_SUBTABS.some(t => t.id === hash)) {
      if (hasTab("hub")) { goTo("hub", { hubTab: hash, ...opts }); return; }
      goTo(fallback, { hubTab: "home", ...opts });
      return;
    }

    if (hash === "hub") { goTo(hasTab("hub") ? "hub" : fallback, { hubTab: "home", ...opts }); return; }

    // A hash the active track has no tab for falls back to that track's default.
    goTo(hasTab(hash) ? hash : fallback, { hubTab: hash === fallback ? state.hubTab : "home", ...opts });
  }

  // ---------------------------------------------------------------- keyboard
  function tabKeydown(event) {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    const strip = tab.closest('[role="tablist"]');
    const tabs = [...strip.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(tab);
    let next = -1;

    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;

    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  }

  // ================================================================ RENDER
  function renderTrackSwitcher() {
    const pills = tracks.map(item => `
      <button class="track-pill ${item.id === track.id ? "active" : ""}" type="button" data-track="${escapeHtml(item.id)}"
        aria-pressed="${item.id === track.id}" title="${escapeHtml(item.name)}">
        ${escapeHtml(item.shortName || item.name)}
      </button>
    `).join("");
    qs("#trackSwitcher").innerHTML = pills +
      `<button class="track-pill disabled" type="button" disabled aria-disabled="true">More coming soon</button>`;
  }

  function renderCopy() {
    const c = copy();
    qs("#homeEyebrow").textContent = c.homeEyebrow;
    qs("#homeHeading").textContent = c.homeHeading;
    qs("#homeLead").textContent = c.homeLead;
    qs("#homeValueSection").hidden = !c.showValueSection;
    qs("#skillsLead").textContent = c.skillsLead;
    qs("#libraryLead").textContent = c.libraryLead(allResources.length);
    qs("#pathsEyebrow").textContent = c.pathsEyebrow;
    qs("#pathsLead").textContent = c.pathsLead;
    qs("#certsEyebrow").textContent = c.certsEyebrow;
    qs("#certsLead").textContent = c.certsLead;
  }

  function renderStats() {
    const skillCount = categories.reduce((sum, category) => sum + category.skills.length, 0);
    const freeCount = allResources.filter(resource => resource.isFree).length;
    const stats = [
      [categories.length, "Learning categories"],
      [skillCount, "Skills"],
      [allResources.length, "Curated resources"],
      [freeCount, "Free resources"]
    ];
    qs("#stats").innerHTML = stats.map(([value, label]) =>
      `<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`
    ).join("");
  }

  function renderHomeCategories() {
    // The title carries the control, so its accessible name is just the
    // category name while its visible text matches it (WCAG 2.5.3). The
    // button's hit area is stretched over the card in CSS, so the whole card
    // stays clickable. "cat-" keeps these ids clear of the skill cards, which
    // can slug identically: Engineering has a category and a skill both
    // called Web Fundamentals, and both panels are in the DOM at once.
    qs("#homeCategories").innerHTML = categories.map(category => {
      const id = `cat-${slugify(category.name)}`;
      return `
      <div class="skill-card" data-accent="${category.accent}">
        <div class="card-kicker">${pad2(category.displayOrder)}.</div>
        <h3 class="ttl"><button type="button" class="card-btn" aria-describedby="${id}-c"
          data-category-open="${escapeHtml(category.name)}">${escapeHtml(category.name)}</button></h3>
        <p>${escapeHtml(category.description)}</p>
        <span class="card-link" id="${id}-c">${category.skills.length} skills &rarr;</span>
      </div>
    `;
    }).join("");
  }

  function renderPills() {
    qs("#categoryPills").innerHTML = categories.map(category => `
      <button class="pill ${state.category === category.name ? "active" : ""}" type="button" data-category="${escapeHtml(category.name)}">
        ${escapeHtml(category.name)}
      </button>
    `).join("");
  }

  function skillSummary(skill) {
    const count = skill.resources.length;
    return isLeveled()
      ? `${count} resource${count === 1 ? "" : "s"}.`
      : `${count} resources across premium courses, free videos and free references.`;
  }

  function renderSkills() {
    const visibleCategories = categories.filter(category => category.name === state.category);

    qs("#skillGrid").innerHTML = visibleCategories.flatMap(category =>
      category.skills.map((skill, index) => {
        const slug = slugify(skill.name);
        return `
        <div class="skill-card" data-accent="${category.accent}">
          <div class="card-kicker">${pad2(index + 1)}.</div>
          <h2 class="ttl"><button type="button" class="card-btn" aria-describedby="sk-${slug}-d"
            data-skill-slug="${slug}">${escapeHtml(skill.name)}</button></h2>
          <p id="sk-${slug}-d">${escapeHtml(skillSummary(skill))}</p>
          <span class="card-link">View skill details &rarr;</span>
        </div>
      `;
      })
    ).join("");
  }

  function resourceBadges(resource) {
    const type = `<span class="badge">${typeLabel(resource.type)}</span>`;
    if (!isLeveled()) {
      return type + `<span class="badge ${resource.isFree ? "free" : "premium"}">${resource.isFree ? "Free" : "Premium"}</span>`;
    }
    // `points` is still carried in the data but deliberately not displayed.
    return type
      + (resource.level ? `<span class="badge level">${escapeHtml(resource.level)}</span>` : "")
      + (resource.mandatory ? `<span class="badge mandatory">Mandatory</span>` : "");
  }

  function resourceCard(resource, level = 2) {
    const provider = resource.provider || resource.section;
    return `
      <article class="resource-card">
        <div class="badges">
          ${resourceBadges(resource)}
        </div>
        ${provider ? `<div class="provider">${escapeHtml(provider)}</div>` : ""}
        <h${level} class="ttl">${escapeHtml(resource.title)}</h${level}>
        <p class="meta-line">${escapeHtml(resource.skill)}${resource.category ? " &middot; " + escapeHtml(resource.category) : ""}</p>
        <div class="resource-actions">
          <a class="action-button" href="${escapeHtml(resource.url || "#")}" target="_blank" rel="noopener noreferrer">Start learning</a>
        </div>
      </article>
    `;
  }

  function renderSkillDetail(slug, opts = {}) {
    const found = findSkill(slug);
    if (!found) { goTo("hub", { hubTab: "skills", ...opts }); return; }
    const { category, skill } = found;

    qs("#skillDetailCategory").textContent = category.name;
    qs("#skillDetailTitle").textContent = skill.name;
    qs("#skillDetailDescription").textContent = category.description;

    let badgeNumber = 0;
    let sectionsHtml;

    if (isLeveled()) {
      // Flat list — the engineering data has no premium/free section split.
      if (skill.resources.length) {
        badgeNumber = 1;
        sectionsHtml = `
          <div class="section-label">
            <span class="step-badge">1</span>
            <h2 class="ttl">Resources</h2>
          </div>
          <div class="resource-grid">
            ${skill.resources.map(r => resourceCard(r, 3)).join("")}
          </div>
        `;
      } else {
        sectionsHtml = `<div class="empty-state"><h2 class="ttl">No resources yet</h2><p>This skill is listed in the roadmap but has no resources recorded against it yet.</p></div>`;
      }
    } else {
      const sections = [
        { key: "Premium Courses", label: "Premium courses" },
        { key: "Free YouTube", label: "Free YouTube" },
        { key: "Free References", label: "Free references" }
      ];

      sectionsHtml = sections.map(section => {
        const items = skill.resources.filter(r => r.section === section.key);
        if (!items.length) return "";
        badgeNumber += 1;
        return `
          <div class="section-label">
            <span class="step-badge">${badgeNumber}</span>
            <h2 class="ttl">${section.label}</h2>
          </div>
          <div class="resource-grid">
            ${items.map(r => resourceCard(r, 3)).join("")}
          </div>
        `;
      }).join("");
    }

    const relatedCerts = (track.certifications || [])
      .flatMap(group => group.items)
      .filter(item => (item.requiredSkills || []).some(tag => looseMatch(skill.name, tag)));

    const relatedCertsHtml = relatedCerts.length ? `
      <div class="section-label">
        <span class="step-badge">${badgeNumber + 1}</span>
        <h2 class="ttl">Related certifications</h2>
      </div>
      <div class="badges">
        ${relatedCerts.map(item => `<button type="button" class="badge" data-hub-tab="certifications">${escapeHtml(item.name)}</button>`).join("")}
      </div>
    ` : "";

    qs("#skillDetailBody").innerHTML = sectionsHtml + relatedCertsHtml;

    goTo("hub", { hubTab: "skills", skillSlug: slug, ...opts });
  }

  function populateFilters() {
    qs("#categoryFilter").innerHTML = `<option value="">All categories</option>` +
      categories.map(category => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`).join("");

    // Same <select> element, two modes: Testing filters on cost, the leveled
    // tracks have no free/premium split and filter on engineering level instead.
    const levelFilter = qs("#costFilter");
    if (isLeveled()) {
      levelFilter.innerHTML = `<option value="">All levels</option>` +
        (track.levels || []).map(level => `<option value="${escapeHtml(level)}">${escapeHtml(level)}</option>`).join("");
      levelFilter.setAttribute("aria-label", "Filter by level");
    } else {
      levelFilter.innerHTML = `<option value="">Free and premium</option>`
        + `<option value="free">Free only</option>`
        + `<option value="premium">Premium only</option>`;
      levelFilter.setAttribute("aria-label", "Filter by cost");
    }
  }

  function renderLibrary() {
    const search = qs("#resourceSearch").value.trim().toLowerCase();
    const category = qs("#categoryFilter").value;
    const type = qs("#typeFilter").value;
    const costOrLevel = qs("#costFilter").value;

    const filtered = allResources.filter(resource => {
      const haystack = `${resource.title} ${resource.provider || ""} ${resource.skill} ${resource.category}`.toLowerCase();
      return (!search || haystack.includes(search))
        && (!category || resource.category === category)
        && (!type || resource.type === type)
        && (!costOrLevel || (isLeveled()
          ? resource.level === costOrLevel
          : (costOrLevel === "free" ? resource.isFree : !resource.isFree)));
    });

    qs("#resultsLine").textContent = `${filtered.length} resource${filtered.length === 1 ? "" : "s"} found`;
    qs("#resourceGrid").innerHTML = filtered.length
      ? filtered.map(resource => resourceCard(resource)).join("")
      : `<div class="empty-state"><h2 class="ttl">No resources match these filters</h2><p>Try clearing one or more filters.</p></div>`;
  }

  function renderCertifications() {
    const groups = track.certifications || [];
    qs("#certificationGroups").innerHTML = groups.map(group => `
      <div class="cert-group-header">
        <span class="step-badge">${escapeHtml(group.category.split(" ")[0][0])}</span>
        <h2 class="ttl">${escapeHtml(group.category)}</h2>
      </div>
      <div class="cert-grid">
        ${group.items.map(item => `
          <article class="cert-card" data-accent="${group.accent}">
            <span class="badge cert-level">${escapeHtml(item.level)}</span>
            <div class="provider">${escapeHtml(item.body)}</div>
            <h3 class="ttl">${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description)}</p>
            ${(item.requiredSkills || []).length ? `
              <div class="badges skill-tags">
                ${item.requiredSkills.map(tag => {
                  const match = findSkillByLooseName(tag);
                  return match
                    ? `<button type="button" class="badge" data-skill-slug="${slugify(match.skill.name)}">${escapeHtml(tag)}</button>`
                    : `<span class="badge">${escapeHtml(tag)}</span>`;
                }).join("")}
              </div>
            ` : ""}
            <div class="resource-actions">
              <a class="action-button secondary" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">View certification</a>
              ${item.trainingUrl && item.trainingUrl !== item.url
                ? `<a class="action-button ghost" href="${escapeHtml(item.trainingUrl)}" target="_blank" rel="noopener noreferrer">Training</a>`
                : ""}
            </div>
          </article>
        `).join("")}
      </div>
    `).join("");
  }

  function renderPaths() {
    qs("#pathGrid").innerHTML = (track.learningPaths || []).map(path => `
      <article class="path-card">
        <h2 class="ttl">${escapeHtml(path.level || "Learning path")}</h2>
        ${!(path.steps || []).length ? `<p class="path-empty">No resources tagged at this level yet.</p>` : ""}
        ${(path.steps || []).map((step, index) => {
          const title = step.title || step;
          const description = step.description || "";

          let skillBlocksHtml;
          if (step.resources) {
            // Engineering: steps carry their own level-tagged resources.
            const match = findSkillByExactName(step.skillName);
            skillBlocksHtml = step.resources.map(resource => `
              <p>${escapeHtml(resource.title)}
                <a class="badge" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">Start</a>
              </p>
            `).join("") + (match
              ? `<button type="button" class="card-link" data-skill-slug="${slugify(match.skill.name)}">View full skill &rarr;</button>`
              : "");
          } else {
            const skillNames = step.skillNames || (step.skillName ? [step.skillName] : []);
            const matches = skillNames.map(name => findSkillByExactName(name)).filter(Boolean);

            skillBlocksHtml = matches.map(({ skill }) => {
              const resource = topResourceForSkill(skill);
              return `
                ${resource ? `
                  <p>${escapeHtml(resource.provider)} &mdash; ${escapeHtml(resource.title)}
                    <a class="badge" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">Start</a>
                  </p>
                ` : ""}
                <button type="button" class="card-link" data-skill-slug="${slugify(skill.name)}">View full skill &rarr;</button>
              `;
            }).join("");
          }

          return `
            <div class="path-step">
              <span class="step-number">${pad2(index + 1)}.</span>
              <div>
                <strong>${escapeHtml(title)}</strong>
                ${description ? `<p>${escapeHtml(description)}</p>` : ""}
                ${skillBlocksHtml}
              </div>
            </div>
          `;
        }).join("")}
      </article>
    `).join("");
  }

  function platformCard(platform, extra) {
    return `
      <article class="platform-card">
        <h3 class="ttl">${escapeHtml(platform.name)}</h3>
        ${extra ? `<div class="cost">${escapeHtml(extra)}</div>` : ""}
        <p>${escapeHtml(platform.description || platform.bestFor || "")}</p>
        <div class="resource-actions">
          <a class="action-button" href="${escapeHtml(platform.url || "#")}" target="_blank" rel="noopener noreferrer">Visit site</a>
        </div>
      </article>
    `;
  }

  function renderPlatforms() {
    const premium = track.premiumPlatforms || [];
    qs("#freePlatformGrid").innerHTML = (track.freePlatforms || []).map(p => platformCard(p)).join("");
    qs("#premiumPlatformGrid").innerHTML = premium.map(p => platformCard(p, p.cost)).join("");
    qs("#premiumPlatformLabel").hidden = !premium.length;
    qs("#premiumPlatformGrid").hidden = !premium.length;
  }


  // ================================================================ REVEAL
  // Progressive enhancement. The markup is visible with no JS at all; the
  // hiding rules are scoped to html.reveal-ready, which only this code adds.
  //
  // Pacing lives in one place: --reveal-speed in styles.css. The base values
  // below are milliseconds at speed 1 and are multiplied by it, in CSS for
  // the animations and here for the bookkeeping, so the two never drift.
  // Each kind has one target length at speed 1. Series of the same kind hold
  // different numbers of items (the pillars have three and no connector; the
  // journey has four and a connector), so the per-element offsets are derived
  // from the target rather than fixed, and every series of a kind finishes
  // together.
  const REVEAL_BASE = {
    h: { target: 1300, item: 420, dot: 380 },
    v: { target: 920,  item: 400, dot: 0 },
    g: { target: 520,  item: 340, dot: 0 }
  };

  const revealSpeed = () => {
    const raw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--reveal-speed"));
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  };

  // Spread n elements of the given duration across the target window.
  const stepFor = (n, target, duration) => (n > 1 ? (target - duration) / (n - 1) : 0);

  function primeRevealSeries(series) {
    const base = REVEAL_BASE[series.dataset.reveal] || REVEAL_BASE.v;
    const items = qsa("[data-item]", series);
    const segs = qsa(".seg", series);
    const dots = qsa(".journey-dot, .aiq-dot", series);

    // --d is a plain number of milliseconds; the stylesheet adds the unit and
    // the speed multiplier.
    const itemStep = stepFor(items.length, base.target, base.item);
    items.forEach((el, i) => el.style.setProperty("--d", String(Math.round(i * itemStep))));

    // The line reaches each circle as that circle fills, so both share a step
    // and each segment takes exactly one step to draw.
    const dotStep = stepFor(dots.length, base.target, base.dot);
    dots.forEach((el, i) => el.style.setProperty("--d", String(Math.round(i * dotStep))));
    segs.forEach((el, i) => el.style.setProperty("--d", String(Math.round(i * dotStep))));
    if (segs.length) series.style.setProperty("--rev-seg", String(Math.round(dotStep)));

    series._revealBase = base.target;
  }

  function seriesDuration(series) {
    return Math.round((series._revealBase || 0) * revealSpeed());
  }

  // Play from the first frame. Clearing the classes drops the elements back to
  // their pre-animation state; the reflow between clear and re-add is what
  // makes the browser restart the animations rather than continue them.
  function playReveal(series) {
    if (reducedMotion()) { series.classList.add("is-in", "is-done"); return; }
    if (series._revealPlaying) return;
    window.clearTimeout(series._revealTimer);
    series.classList.remove("is-in", "is-done");
    void series.offsetWidth;
    series._revealPlaying = true;
    series.classList.add("is-in");
    series._revealTimer = window.setTimeout(() => {
      series.classList.add("is-done");
      series._revealPlaying = false;          // re-armed for the next hover
    }, seriesDuration(series) + 60);
  }

  let revealObserver = null;

  function armRevealObserver() {
    if (revealObserver) revealObserver.disconnect();
    // A series taller than the viewport can never reach 0.4, so also accept a
    // visible slice of at least half the viewport.
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const tallEnough = entry.intersectionRect.height >= window.innerHeight * 0.5;
        if (entry.intersectionRatio >= 0.4 || (entry.isIntersecting && tallEnough)) {
          playReveal(entry.target);
        }
      });
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4] });
    qsa("[data-reveal]").forEach(series => revealObserver.observe(series));
  }

  // Every load, and every restore from the back/forward cache, starts over.
  // Nothing is stored anywhere; the state lives on the elements.
  function resetAllReveals() {
    qsa("[data-reveal]").forEach(series => {
      window.clearTimeout(series._revealTimer);
      series._revealPlaying = false;
      series.classList.remove("is-in", "is-done");
    });
    void document.body.offsetWidth;
  }

  function startReveal() {
    if (reducedMotion()) {
      qsa("[data-reveal]").forEach(series => series.classList.add("is-in", "is-done"));
      return;
    }
    resetAllReveals();
    armRevealObserver();
    // Last resort for a series the observer can never satisfy.
    window.setTimeout(() => qsa("[data-reveal]:not(.is-in)").forEach(playReveal), 6000);
  }

  function primeReveal() {
    if (!("IntersectionObserver" in window)) return;   // no IO: leave it visible
    document.documentElement.classList.add("reveal-ready");
    qsa("[data-reveal]").forEach(primeRevealSeries);

    // Hold until the webfont has settled, so the first frame is not swapped
    // out from under the viewer, then give them a moment to look.
    const begin = () => window.setTimeout(startReveal, 300);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(begin);
    else begin();

    // Replay on hover (mouse or pen) and on tap. Ignored while a series is
    // still playing; playReveal re-arms itself when it finishes. These are
    // passive listeners on a non-interactive container: no tab stop, no
    // cursor change, no focus ring.
    const replay = event => {
      if (reducedMotion()) return;
      const series = event.target.closest("[data-reveal]");
      if (series) playReveal(series);
    };
    // data-replay="off" keeps a series' load stagger but leaves it alone after
    // that: the capability cards sit under a hover popover, and restarting
    // their stagger under the pointer read as a flicker.
    qsa('[data-reveal]:not([data-replay="off"])').forEach(series => {
      series.addEventListener("pointerenter", e => {
        if (e.pointerType === "mouse" || e.pointerType === "pen") replay(e);
      });
      series.addEventListener("pointerup", e => {
        if (e.pointerType === "touch") replay(e);
      });
    });

    window.addEventListener("pageshow", event => {
      if (event.persisted) startReveal();
    });
  }

  // ---------------------------------------------------------------- capability popover
  // The six capability cards are stationary. Pointing at one, or activating its
  // title, zooms a popover out of that card's rectangle over the grid. Every
  // word in the popover is lifted from the card markup at init, so there is one
  // source of truth and nothing to keep in step by hand.
  function initCapabilityPopover() {
    const stage = qs(".cap-stage");
    const grid = stage && stage.querySelector(".cards");
    if (!stage || !grid) return;
    const cards = Array.from(grid.querySelectorAll("article"));
    if (!cards.length) return;

    const plainText = node => {
      if (!node) return "";
      const copy = node.cloneNode(true);
      copy.querySelectorAll("span").forEach(span => span.remove());
      return copy.textContent.replace(/\s+/g, " ").trim();
    };

    // Read the cards before rewriting them, or the title would come back
    // wrapped in the button we are about to add.
    const caps = cards.map(card => {
      const details = card.querySelector("details");
      const outcome = card.querySelector(".service-outcome");
      return {
        card,
        number: card.querySelector(".number").textContent.trim(),
        titleHtml: card.querySelector(".ttl").innerHTML.trim(),
        lede: card.querySelector("p:not(.service-outcome)").textContent.replace(/\s+/g, " ").trim(),
        outcomeLabel: outcome.querySelector("span").textContent.trim(),
        outcomeText: plainText(outcome),
        deliverLabel: details.querySelector("summary").textContent.replace(/\s+/g, " ").trim(),
        steps: Array.from(details.querySelectorAll("li")).map(li => li.textContent.replace(/\s+/g, " ").trim())
      };
    });

    const overlay = document.createElement("div");
    overlay.className = "cap-overlay";
    overlay.id = "capOverlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="cap-panel" id="capPanel" role="dialog" aria-labelledby="capPanelTitle" tabindex="-1">
        <div class="cap-inner">
          <div class="cap-bar">
            <div class="cap-chips">${caps.map((cap, index) => {
              const digits = cap.number.replace(/\D/g, "");
              return `<button class="cap-chip" type="button" data-cap="${index}" aria-label="Capability ${digits}">${digits}</button>`;
            }).join("")}</div>
            <button class="cap-close" type="button" aria-label="Close">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          <div class="cap-body">
            <span class="cap-num"></span>
            <h2 class="cap-title" id="capPanelTitle"></h2>
            <div class="cap-cols">
              <p class="cap-lede"></p>
              <p class="cap-outcome"><span></span><span class="cap-outcome-text"></span></p>
            </div>
            <div class="cap-deliver">
              <span class="cap-deliver-label"></span>
              <div class="cap-steps" data-reveal="h" data-replay="off"></div>
            </div>
          </div>
        </div>
      </div>`;
    stage.appendChild(overlay);

    const panel = overlay.querySelector(".cap-panel");
    const steps = overlay.querySelector(".cap-steps");
    const chips = Array.from(overlay.querySelectorAll(".cap-chip"));
    const closeButton = overlay.querySelector(".cap-close");
    const CLIP = ["--ct", "--cr", "--cb", "--cl"];

    caps.forEach(cap => {
      // The heading becomes the control, so the button's accessible name is
      // exactly the visible title.
      const title = cap.card.querySelector(".ttl");
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "cap-trigger";
      trigger.innerHTML = cap.titleHtml;
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", "capPanel");
      title.textContent = "";
      title.appendChild(trigger);
      cap.trigger = trigger;

      // <details> is the no-script affordance. With script running the card
      // must never change size, so it becomes a static signpost instead. The
      // list itself is in the popover, so the row stays out of the a11y tree.
      const row = document.createElement("div");
      row.className = "deliver-row";
      row.setAttribute("aria-hidden", "true");
      row.innerHTML = `<span>${escapeHtml(cap.deliverLabel)}</span>
        <svg class="deliver-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>`;
      cap.card.querySelector("details").replaceWith(row);
    });

    const zoomMode = window.matchMedia("(min-width: 1100px) and (hover: hover)");
    const OPEN_DELAY = 200;
    const CLOSE_DELAY = 250;
    let current = -1;
    let pinned = false;
    let openTimer = 0;
    let closeTimer = 0;
    let stepTimer = 0;
    let settleTimer = 0;
    let returnFocus = null;
    let hoverBlocked = false;

    function fill(index) {
      const cap = caps[index];
      overlay.querySelector(".cap-num").textContent = cap.number;
      overlay.querySelector(".cap-title").innerHTML = cap.titleHtml;
      overlay.querySelector(".cap-lede").textContent = cap.lede;
      overlay.querySelector(".cap-outcome > span").textContent = cap.outcomeLabel;
      overlay.querySelector(".cap-outcome-text").textContent = cap.outcomeText;
      overlay.querySelector(".cap-deliver-label").textContent = cap.deliverLabel;
      steps.innerHTML = cap.steps.map((text, position) => {
        const seg = position < cap.steps.length - 1 ? '<span class="seg" aria-hidden="true"></span>' : "";
        return `<div class="cap-step" data-item>${seg}
          <span class="cap-dot">${String(position + 1).padStart(2, "0")}</span>
          <p>${escapeHtml(text)}</p>
        </div>`;
      }).join("");
      primeRevealSeries(steps);
      chips.forEach((chip, position) => chip.setAttribute("aria-current", position === index ? "true" : "false"));
      current = index;
    }

    // The clip starts as the card's own rectangle, measured against the panel,
    // and opens to nothing. Only the clip animates, so no layout is touched.
    function clipToCard(index) {
      const frame = panel.getBoundingClientRect();
      const card = caps[index].card.getBoundingClientRect();
      panel.style.setProperty("--ct", Math.max(0, card.top - frame.top) + "px");
      panel.style.setProperty("--cl", Math.max(0, card.left - frame.left) + "px");
      panel.style.setProperty("--cr", Math.max(0, frame.right - card.right) + "px");
      panel.style.setProperty("--cb", Math.max(0, frame.bottom - card.bottom) + "px");
    }

    function open(index, options) {
      const shouldPin = !!(options && options.pin);
      window.clearTimeout(closeTimer);
      window.clearTimeout(settleTimer);
      const fresh = overlay.hidden;
      overlay.classList.remove("is-closing");
      fill(index);
      caps.forEach((cap, position) => cap.trigger.setAttribute("aria-expanded", String(position === index)));
      if (fresh) {
        overlay.hidden = false;
        if (zoomMode.matches && !reducedMotion()) {
          panel.style.transition = "none";
          clipToCard(index);
          void panel.offsetWidth;
          panel.style.transition = "";
        }
      }
      window.requestAnimationFrame(() => {
        CLIP.forEach(name => panel.style.setProperty(name, "0px"));
        overlay.classList.add("is-open");
      });
      window.clearTimeout(stepTimer);
      stepTimer = window.setTimeout(() => playReveal(steps), reducedMotion() ? 0 : 260);
      if (shouldPin) pinPopover();
    }

    function pinPopover() {
      pinned = true;
      panel.setAttribute("aria-modal", "true");
      if (!zoomMode.matches) document.documentElement.classList.add("cap-sheet-open");
      panel.focus();
    }

    function close(options) {
      if (overlay.hidden) return;
      const restore = !(options && options.restoreFocus === false);
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      window.clearTimeout(stepTimer);
      overlay.classList.remove("is-open");
      overlay.classList.add("is-closing");
      if (zoomMode.matches && !reducedMotion() && current >= 0) clipToCard(current);
      const finish = () => {
        overlay.hidden = true;
        overlay.classList.remove("is-closing");
        panel.removeAttribute("aria-modal");
        document.documentElement.classList.remove("cap-sheet-open");
        caps.forEach(cap => cap.trigger.setAttribute("aria-expanded", "false"));
        pinned = false;
        current = -1;
      };
      // Hiding the overlay hands the pointer back to whichever card is under it,
      // which re-fires pointerenter with no matching pointerleave first. Without
      // this the popover would spring straight back open after Escape or the
      // close button. Moving off a card, or off the grid, re-arms hover.
      if (!(options && options.viaPointerLeave)) hoverBlocked = true;
      const target = restore ? returnFocus : null;
      returnFocus = null;
      if (reducedMotion()) finish();
      else settleTimer = window.setTimeout(finish, 270);
      if (target) target.focus();
    }

    cards.forEach((card, index) => {
      card.addEventListener("pointerenter", event => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        if (!zoomMode.matches || pinned) return;
        if (hoverBlocked) return;
        window.clearTimeout(openTimer);
        openTimer = window.setTimeout(() => open(index), OPEN_DELAY);
      });
      card.addEventListener("pointerleave", () => {
        hoverBlocked = false;
        window.clearTimeout(openTimer);
      });
    });

    // The overlay covers the grid, so moving onto it never leaves the stage and
    // never closes. Leaving the stage altogether does, after a grace period.
    stage.addEventListener("pointerenter", () => window.clearTimeout(closeTimer));
    stage.addEventListener("pointerleave", () => {
      hoverBlocked = false;                 // leaving the grid re-arms hover
      if (pinned) return;
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => close({ restoreFocus: false, viaPointerLeave: true }), CLOSE_DELAY);
    });

    caps.forEach((cap, index) => {
      cap.trigger.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        window.clearTimeout(openTimer);
        returnFocus = cap.trigger;
        hoverBlocked = false;
        if (overlay.hidden || current !== index) open(index, { pin: true });
        else pinPopover();
      });
    });

    chips.forEach((chip, index) => {
      chip.addEventListener("click", event => {
        event.stopPropagation();
        if (index === current) return;
        open(index);
        if (pinned) chip.focus();
      });
    });

    closeButton.addEventListener("click", event => {
      event.stopPropagation();
      close();
    });

    panel.addEventListener("keydown", event => {
      if (event.key !== "Tab" || !pinned) return;
      const stops = chips.concat([closeButton]).filter(el => el.offsetParent !== null);
      if (!stops.length) { event.preventDefault(); panel.focus(); return; }
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || active === panel)) { event.preventDefault(); first.focus(); }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !overlay.hidden) { event.stopPropagation(); close(); }
    });

    document.addEventListener("pointerdown", event => {
      if (overlay.hidden || !pinned) return;
      if (panel.contains(event.target)) return;
      close();
    });

    // Geometry and mode both stop being valid once the viewport changes.
    zoomMode.addEventListener("change", () => close({ restoreFocus: false }));
    window.addEventListener("resize", () => { if (!pinned) close({ restoreFocus: false }); });
  }

  // ---------------------------------------------------------------- track
  function loadTrack(id) {
    const next = tracks.find(item => item.id === id);
    if (!next) return;
    track = next;
    categories = track.categories || [];
    allResources = categories.flatMap(category =>
      category.skills.flatMap(skill =>
        skill.resources.map(resource => ({
          ...resource,
          category: category.name,
          skill: skill.name
        }))
      )
    );
    state.category = categories[0]?.name;
    state.currentSkill = null;
  }

  function renderAll() {
    renderTrackSwitcher();
    buildTabBars();
    renderCopy();
    renderStats();
    renderHomeCategories();
    renderPills();
    renderSkills();
    populateFilters();
    renderLibrary();
    renderPaths();
    renderPlatforms();
    renderCertifications();
  }

  function switchTrack(id) {
    if (id === track.id) return;
    loadTrack(id);
    // Filters are category-scoped, so reset them rather than carry stale values over.
    qs("#resourceSearch").value = "";
    qs("#categoryFilter").value = "";
    qs("#typeFilter").value = "";
    qs("#costFilter").value = "";
    renderAll();
    renderLibrary();
    // Switching track falls back to that track's default tab.
    goTo(tabConfig().default, { hubTab: "home", skillSlug: null });
  }

  // ---------------------------------------------------------------- events
  document.addEventListener("click", event => {
    const trackButton = event.target.closest("[data-track]");
    if (trackButton && trackButton.classList.contains("track-pill")) { switchTrack(trackButton.dataset.track); return; }

    const primaryTab = event.target.closest("[data-tab]");
    if (primaryTab) { goTo(primaryTab.dataset.tab, { hubTab: state.hubTab, skillSlug: null }); return; }

    const goTab = event.target.closest("[data-go-tab]");
    if (goTab) { goTo(goTab.dataset.goTab, { skillSlug: null }); return; }

    const hubTab = event.target.closest("[data-hub-tab]");
    if (hubTab) { goTo("hub", { hubTab: hubTab.dataset.hubTab, skillSlug: null }); return; }

    const homeLink = event.target.closest("[data-nav-home]");
    if (homeLink) { event.preventDefault(); goTo(tabConfig().default, { hubTab: "home", skillSlug: null }); return; }

    const categoryButton = event.target.closest("[data-category]");
    if (categoryButton) {
      state.category = categoryButton.dataset.category;
      renderPills();
      renderSkills();
      return;
    }

    const categoryCard = event.target.closest("[data-category-open]");
    if (categoryCard) {
      state.category = categoryCard.dataset.categoryOpen;
      renderPills();
      renderSkills();
      goTo("hub", { hubTab: "skills", skillSlug: null });
      return;
    }

    const skillCard = event.target.closest("[data-skill-slug]");
    if (skillCard) { renderSkillDetail(skillCard.dataset.skillSlug); return; }
  });

  document.addEventListener("keydown", event => {
    if (event.target.closest('[role="tab"]')) { tabKeydown(event); return; }
    // skill cards activate through a real <button>, so Enter and Space are native
  });

  ["resourceSearch", "categoryFilter", "typeFilter", "costFilter"].forEach(id => {
    qs(`#${id}`).addEventListener(id === "resourceSearch" ? "input" : "change", renderLibrary);
  });

  window.addEventListener("popstate", () => applyRoute(location.hash, { push: false }));
  // A hash typed or pasted into the address bar on the live page fires hashchange,
  // not popstate. Guarded so our own pushState writes don't re-enter.
  window.addEventListener("hashchange", () => {
    if (location.hash !== currentHash()) applyRoute(location.hash, { push: false });
  });
  window.addEventListener("resize", () => { updateScrollHints(); syncScrollPadding(); });

  // ---------------------------------------------------------------- boot
  loadTrack(tracks[0].id);
  renderAll();
  initCapabilityPopover();   // before primeReveal, so its series is primed too
  primeReveal();
  applyRoute(location.hash, { push: false, quiet: true });
})();
