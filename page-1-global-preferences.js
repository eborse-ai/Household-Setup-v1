(function () {

  /* ──────────────────────────────────────────
     Global HH toggle
  ────────────────────────────────────────── */
  (function () {
    var toggle = document.getElementById("toggle-global-hh");
    if (!toggle) return;

    toggle.addEventListener("change", function () {
      console.log("Global HH toggle:", toggle.checked);
    });
  }());

  /* ──────────────────────────────────────────
     Accordion handlers
  ────────────────────────────────────────── */
  function bindAccordions(root) {
    root.querySelectorAll(".accordion__section").forEach(function (sec) {
      var btn = sec.querySelector(".accordion__header");
      var panel = sec.querySelector(".accordion__panel");
      if (!btn || !panel) return;

      function setOpen(open) {
        sec.classList.toggle("is-open", open);
        panel.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        panel.setAttribute("aria-hidden", String(!open));
      }

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(!sec.classList.contains("is-open"));
      });

      setOpen(sec.classList.contains("is-open"));
    });
  }

  document.querySelectorAll(".card--accordion").forEach(bindAccordions);

  /* ──────────────────────────────────────────
     Stepper navigation
  ────────────────────────────────────────── */
  (function () {
    var panels = document.querySelectorAll(".panel[data-panel]");
    var stepperItems = document.querySelectorAll(".stepper__item");
    var stepperSubItems = document.querySelectorAll(".stepper__sub-item");
    var navBtns = document.querySelectorAll("[data-nav]");
    var COMPLETION_PANEL = 9;

    function updateFooter(idx) {
      var btnNext = document.getElementById("btn-next");
      var footer  = document.querySelector(".modal__footer");
      if (!btnNext || !footer) return;

      var lastContentPanel = COMPLETION_PANEL - 1;
      if (idx === COMPLETION_PANEL) {
        footer.hidden = true;
      } else {
        footer.hidden = false;
        btnNext.textContent = (idx === lastContentPanel) ? "Save and sync" : "Save & Next";
      }
    }

    function showPanel(idx) {
      panels.forEach(function (p) {
        var panelIdx = parseInt(p.getAttribute("data-panel"), 10);
        if (panelIdx === idx) {
          p.removeAttribute("hidden");
          p.classList.add("panel--active");
        } else {
          p.setAttribute("hidden", "");
          p.classList.remove("panel--active");
        }
      });

      stepperItems.forEach(function (item) { item.classList.remove("is-active"); });
      stepperSubItems.forEach(function (item) { item.classList.remove("is-active"); });

      if (idx === COMPLETION_PANEL) {
        var chronicleItem = document.querySelector('.stepper__item[data-step="chronicle"]');
        if (chronicleItem) chronicleItem.classList.add("is-active", "is-done");
        var createItem = document.querySelector('.stepper__item[data-step="create"]');
        if (createItem) createItem.classList.add("is-done");
        var step1Item = document.querySelector('.stepper__item[data-step="global-prefs"]');
        if (step1Item) step1Item.classList.add("is-done");
      } else {
        navBtns.forEach(function (btn) {
          var navIdx = parseInt(btn.getAttribute("data-nav"), 10);
          if (navIdx === idx) {
            var parent = btn.closest(".stepper__item");
            if (parent) parent.classList.add("is-active");
            var subItem = btn.closest(".stepper__sub-item");
            if (subItem) subItem.classList.add("is-active");
          }
        });
      }

      updateFooter(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    navBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-nav"), 10);
        showPanel(idx);
      });
    });

    showPanel(0);
  }());

  /* ──────────────────────────────────────────
     Global Settings gate — both prefs must be
     enabled before any other section is accessible
  ────────────────────────────────────────── */
  (function () {
    var toggleHH  = document.getElementById('toggle-global-hh');
    var toggleCtx = document.getElementById('toggle-context-definitions');
    var btnNext   = document.getElementById('btn-next');

    /* All nav buttons that go beyond panel 0 */
    var gatedBtns = document.querySelectorAll('[data-nav]:not([data-nav="0"])');

    /* Inline notice element — injected once */
    var notice = document.createElement('div');
    notice.className = 'gate-notice';
    notice.setAttribute('aria-live', 'polite');
    notice.hidden = true;
    var modalFooter = document.querySelector('.modal__footer');
    if (modalFooter) modalFooter.parentNode.insertBefore(notice, modalFooter);

    var noticeTimer;
    function showNotice() {
      notice.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;color:#d97706"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Please enable both Global Settings preferences before proceeding.';
      notice.hidden = false;
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(function () { notice.hidden = true; }, 3500);
    }

    function isUnlocked() {
      return !!(toggleHH && toggleHH.checked && toggleCtx && toggleCtx.checked);
    }

    function getActivePanel() {
      return document.querySelector('.panel.panel--active');
    }

    function applyGate() {
      var unlocked = isUnlocked();
      var activePanel = getActivePanel();
      var onPanel0 = activePanel && activePanel.getAttribute('data-panel') === '0';

      /* Footer Next button — only gated on panel 0 */
      if (btnNext) {
        btnNext.disabled = onPanel0 ? !unlocked : false;
      }

      /* Stepper items beyond panel 0 */
      gatedBtns.forEach(function (btn) {
        btn.classList.toggle('is-nav-locked', !unlocked);
        btn.setAttribute('tabindex', unlocked ? '0' : '-1');
      });

      /* Notice visibility: hide it if now unlocked */
      if (unlocked) notice.hidden = true;
    }

    /* Intercept clicks on locked buttons (capture phase — runs before data-nav handler) */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-nav]');
      if (btn && btn.classList.contains('is-nav-locked')) {
        e.stopImmediatePropagation();
        e.preventDefault();
        showNotice();
      }
    }, true);

    /* Re-evaluate whenever a toggle changes or a panel becomes active */
    if (toggleHH)  toggleHH.addEventListener('change',  applyGate);
    if (toggleCtx) toggleCtx.addEventListener('change', applyGate);

    /* Watch panel switches so btnNext disabled state stays correct */
    var observer = new MutationObserver(applyGate);
    document.querySelectorAll('.panel').forEach(function (p) {
      observer.observe(p, { attributes: true, attributeFilter: ['hidden', 'class'] });
    });

    applyGate();
  }());

  /* ──────────────────────────────────────────
     Save & Next / Finish button
  ────────────────────────────────────────── */
  (function () {
    var btnNext = document.getElementById("btn-next");
    var panels = document.querySelectorAll(".panel[data-panel]");

    if (!btnNext) return;

    btnNext.addEventListener("click", function () {
      var currentIdx = -1;
      panels.forEach(function (p) {
        if (!p.hasAttribute("hidden")) {
          currentIdx = parseInt(p.getAttribute("data-panel"), 10);
        }
      });

      var nextIdx = currentIdx + 1;
      if (nextIdx < panels.length) {
        var navBtn = document.querySelector('[data-nav="' + nextIdx + '"]');
        if (navBtn) navBtn.click();
      }
    });
  }());

  /* ──────────────────────────────────────────
     Person Accounts — Org Impact modal (info only)
     "Review Org Impacts" opens the modal for reference.
     The inline checkbox in the sub-list gates the toggle.
  ────────────────────────────────────────── */
  (function () {
    var modal    = document.getElementById("pa-terms-modal");
    var btnOpen  = document.getElementById("btn-pa-terms");
    var btnClose = document.getElementById("btn-pa-terms-close");
    var btnCloseFooter = document.getElementById("btn-pa-terms-close-footer");
    var backdrop = document.getElementById("pa-terms-backdrop");
    if (!modal) return;

    function openModal()  { modal.hidden = false; }
    function closeModal() { modal.hidden = true;  }

    if (btnOpen)        btnOpen.addEventListener("click", openModal);
    if (btnClose)       btnClose.addEventListener("click", closeModal);
    if (btnCloseFooter) btnCloseFooter.addEventListener("click", closeModal);
    if (backdrop)       backdrop.addEventListener("click", closeModal);
  }());

  /* ──────────────────────────────────────────
     Set Up the Basics — top-level section accordions
  ────────────────────────────────────────── */
  (function () {
    var headers = document.querySelectorAll("[data-basics-toggle]");
    headers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var panelId  = btn.getAttribute("aria-controls");
        var panel    = document.getElementById(panelId);
        if (!panel) return;
        btn.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
      });
    });
  }());

  /* ──────────────────────────────────────────
     Inline "I accept" checkbox → unlocks Person Accounts toggle
  ────────────────────────────────────────── */
  (function () {
    var inlineCheck = document.getElementById("pa-consent-prereq-check");
    var prereqItem  = document.getElementById("pa-consent-prereq-item");
    if (!inlineCheck) return;

    function checkUnlockPA() {
      var paToggle   = document.getElementById("toggle-person-accounts");
      var gateNotice = document.getElementById("pa-gate-notice");
      if (!paToggle) return;
      paToggle.disabled = false;
      if (gateNotice) gateNotice.hidden = true;
    }

    inlineCheck.addEventListener("change", function () {
      if (!inlineCheck.checked) return;
      if (prereqItem) prereqItem.classList.add("prereq-step--accepted");
      checkUnlockPA();
    });
  }());

  /* ──────────────────────────────────────────
     Create Accounts Record Type — expand / collapse
     Chevron and "Set Up" button both toggle the sub-panel
  ────────────────────────────────────────── */
  (function () {
    var chevron  = document.getElementById("pa-create-rt-chevron");
    var btnSetUp = document.getElementById("btn-pa-setup");
    var panel    = document.getElementById("pa-create-rt-panel");
    if (!panel) return;

    function togglePanel() {
      var isOpen = !panel.hidden;
      panel.hidden = isOpen;
      if (chevron) {
        chevron.classList.toggle("is-open", !isOpen);
        chevron.setAttribute("aria-expanded", String(!isOpen));
      }
    }

    if (chevron)  chevron.addEventListener("click", togglePanel);
    if (btnSetUp) btnSetUp.addEventListener("click", togglePanel);
  }());

  /* ──────────────────────────────────────────
     Permission Sets list — select-all checkbox
  ────────────────────────────────────────── */
  (function () {
    var selectAll = document.getElementById("perm-set-select-all");
    var tableBody = document.getElementById("perm-set-table-body");
    if (!selectAll || !tableBody) return;

    var rowChecks = tableBody.querySelectorAll('input[type="checkbox"]');

    selectAll.addEventListener("change", function () {
      rowChecks.forEach(function (cb) { cb.checked = selectAll.checked; });
    });

    rowChecks.forEach(function (cb) {
      cb.addEventListener("change", function () {
        var allChecked = Array.from(rowChecks).every(function (c) { return c.checked; });
        var someChecked = Array.from(rowChecks).some(function (c) { return c.checked; });
        selectAll.checked = allChecked;
        selectAll.indeterminate = someChecked && !allChecked;
      });
    });

    // Show only first 5 rows until user types
    var TOP_N = 5;
    var allRows = Array.from(tableBody.querySelectorAll(".perm-set-table__row"));

    function applyVisibility(query) {
      var shown = 0;
      allRows.forEach(function (row) {
        if (query) {
          var name = row.querySelector(".perm-set-table__name-link");
          row.hidden = !(name && name.textContent.toLowerCase().includes(query));
        } else {
          row.hidden = (shown >= TOP_N);
          if (!row.hidden) shown++;
        }
      });
    }

    applyVisibility("");

    var searchInput = document.querySelector(".perm-set-search__input");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        applyVisibility(searchInput.value.toLowerCase().trim());
      });
    }
  }());

  /* ──────────────────────────────────────────
     Field-Level Security toggle → shows FLS config panel
  ────────────────────────────────────────── */
  (function () {
    var flsToggle    = document.getElementById("toggle-prereq-field-security");
    var flsPanel     = document.getElementById("fls-config-panel");
    if (!flsToggle || !flsPanel) return;

    flsToggle.addEventListener("change", function () {
      flsPanel.hidden = !flsToggle.checked;
    });
  }());

  /* ──────────────────────────────────────────
     Field-Level Security — Profile dueling picklist
  ────────────────────────────────────────── */
  (function () {
    var listAvail   = document.getElementById("fls-dp-available");
    var listSel     = document.getElementById("fls-dp-selected");
    var btnRight    = document.getElementById("fls-dp-move-right");
    var btnAllRight = document.getElementById("fls-dp-move-all-right");
    var btnLeft     = document.getElementById("fls-dp-move-left");
    var btnAllLeft  = document.getElementById("fls-dp-move-all-left");
    if (!listAvail || !listSel) return;

    function sortList(list) {
      var opts = Array.from(list.options);
      opts.sort(function (a, b) { return a.text.localeCompare(b.text); });
      opts.forEach(function (opt) { list.appendChild(opt); });
    }

    function moveOptions(fromList, toList, selectedOnly) {
      Array.from(fromList.options).forEach(function (opt) {
        if (!selectedOnly || opt.selected) {
          opt.selected = false;
          toList.appendChild(opt);
        }
      });
      sortList(toList);
    }

    if (btnRight)    btnRight.addEventListener("click",    function () { moveOptions(listAvail, listSel, true); });
    if (btnAllRight) btnAllRight.addEventListener("click", function () { moveOptions(listAvail, listSel, false); });
    if (btnLeft)     btnLeft.addEventListener("click",     function () { moveOptions(listSel, listAvail, true); });
    if (btnAllLeft)  btnAllLeft.addEventListener("click",  function () { moveOptions(listSel, listAvail, false); });
  }());

  /* ──────────────────────────────────────────
     Person Accounts — Profile dueling picklist
  ────────────────────────────────────────── */
  (function () {
    var listAvail   = document.getElementById("pa-dp-available");
    var listSel     = document.getElementById("pa-dp-selected");
    var btnRight    = document.getElementById("pa-dp-move-right");
    var btnAllRight = document.getElementById("pa-dp-move-all-right");
    var btnLeft     = document.getElementById("pa-dp-move-left");
    var btnAllLeft  = document.getElementById("pa-dp-move-all-left");
    if (!listAvail || !listSel) return;

    function sortList(list) {
      var opts = Array.from(list.options);
      opts.sort(function (a, b) { return a.text.localeCompare(b.text); });
      opts.forEach(function (opt) { list.appendChild(opt); });
    }

    function moveOptions(fromList, toList, selectedOnly) {
      Array.from(fromList.options).forEach(function (opt) {
        if (!selectedOnly || opt.selected) {
          opt.selected = false;
          toList.appendChild(opt);
        }
      });
      sortList(toList);
    }

    if (btnRight)    btnRight.addEventListener("click",    function () { moveOptions(listAvail, listSel, true); });
    if (btnAllRight) btnAllRight.addEventListener("click", function () { moveOptions(listAvail, listSel, false); });
    if (btnLeft)     btnLeft.addEventListener("click",     function () { moveOptions(listSel, listAvail, true); });
    if (btnAllLeft)  btnAllLeft.addEventListener("click",  function () { moveOptions(listSel, listAvail, false); });
  }());

  /* ──────────────────────────────────────────
     Roles multi-select (Roles and Relationships)
  ────────────────────────────────────────── */
  (function () {
    var trigger  = document.getElementById("roles-ms-trigger");
    var dropdown = document.getElementById("roles-ms-dropdown");
    var summary  = document.getElementById("roles-ms-summary");
    var pillList = document.getElementById("roles-ms-pills");
    var msWrap   = document.getElementById("roles-ms");
    if (!trigger || !dropdown || !summary || !pillList) return;

    function getChecked() {
      return Array.from(dropdown.querySelectorAll("input[data-roles-ms]:checked"))
        .map(function (i) { return i.value; });
    }

    function updateSummary() {
      var checked = getChecked();
      summary.textContent = checked.length === 0
        ? "Select roles\u2026"
        : checked.length + " role" + (checked.length === 1 ? "" : "s") + " selected";
    }

    function addPill(val) {
      if (pillList.querySelector('[data-roles-pill="' + val + '"]')) return;
      var pill = document.createElement("span");
      pill.className = "pill";
      pill.setAttribute("data-roles-pill", val);
      var txt = document.createTextNode(val);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill__remove";
      btn.setAttribute("aria-label", "Remove " + val);
      btn.innerHTML = "&times;";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var cb = dropdown.querySelector('input[value="' + val + '"]');
        if (cb) cb.checked = false;
        pill.remove();
        updateSummary();
      });
      pill.appendChild(txt);
      pill.appendChild(btn);
      pillList.appendChild(pill);
    }

    function syncPills() {
      var checked = getChecked();
      Array.from(pillList.querySelectorAll("[data-roles-pill]")).forEach(function (p) {
        if (checked.indexOf(p.getAttribute("data-roles-pill")) === -1) p.remove();
      });
      checked.forEach(addPill);
    }

    function openDropdown()  { dropdown.hidden = false; trigger.setAttribute("aria-expanded", "true"); }
    function closeDropdown() { dropdown.hidden = true;  trigger.setAttribute("aria-expanded", "false"); }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.hidden ? openDropdown() : closeDropdown();
    });

    dropdown.querySelectorAll("input[data-roles-ms]").forEach(function (cb) {
      cb.addEventListener("change", function () { syncPills(); updateSummary(); });
    });

    document.addEventListener("click", function (e) {
      if (!msWrap.contains(e.target)) closeDropdown();
    });

    updateSummary();
  }());

  /* ──────────────────────────────────────────
     Relationships multi-select (Roles and Relationships)
  ────────────────────────────────────────── */
  (function () {
    var trigger       = document.getElementById("rel-ms-trigger");
    var dropdown      = document.getElementById("rel-ms-dropdown");
    var summary       = document.getElementById("rel-ms-summary");
    var pillList      = document.getElementById("rel-ms-pills");
    var msWrap        = document.getElementById("rel-ms");
    var inverseNotice = document.getElementById("rel-inverse-notice");
    if (!trigger || !dropdown || !summary || !pillList) return;

    function getChecked() {
      return Array.from(dropdown.querySelectorAll("input[data-rel-ms]:checked"))
        .map(function (i) { return i.value; });
    }

    function updateSummary() {
      var checked = getChecked();
      summary.textContent = checked.length === 0
        ? "Select relationships\u2026"
        : checked.length + " relationship" + (checked.length === 1 ? "" : "s") + " selected";
      if (inverseNotice) inverseNotice.hidden = checked.length === 0;
    }

    function addPill(val) {
      if (pillList.querySelector('[data-rel-pill="' + val + '"]')) return;
      var pill = document.createElement("span");
      pill.className = "pill";
      pill.setAttribute("data-rel-pill", val);
      var txt = document.createTextNode(val);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pill__remove";
      btn.setAttribute("aria-label", "Remove " + val);
      btn.innerHTML = "&times;";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var cb = dropdown.querySelector('input[value="' + val + '"]');
        if (cb) cb.checked = false;
        pill.remove();
        updateSummary();
      });
      pill.appendChild(txt);
      pill.appendChild(btn);
      pillList.appendChild(pill);
    }

    function syncPills() {
      var checked = getChecked();
      Array.from(pillList.querySelectorAll("[data-rel-pill]")).forEach(function (p) {
        if (checked.indexOf(p.getAttribute("data-rel-pill")) === -1) p.remove();
      });
      checked.forEach(addPill);
    }

    function openDropdown()  { dropdown.hidden = false; trigger.setAttribute("aria-expanded", "true"); }
    function closeDropdown() { dropdown.hidden = true;  trigger.setAttribute("aria-expanded", "false"); }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.hidden ? openDropdown() : closeDropdown();
    });

    dropdown.querySelectorAll("input[data-rel-ms]").forEach(function (cb) {
      cb.addEventListener("change", function () { syncPills(); updateSummary(); });
    });

    document.addEventListener("click", function (e) {
      if (!msWrap.contains(e.target)) closeDropdown();
    });

    updateSummary();
  }());

  /* ──────────────────────────────────────────
     Settings page — version gating
  ────────────────────────────────────────── */
  (function () {
    var toggle      = document.getElementById("toggle-nextgen-hh");
    var versionRow  = document.getElementById("hh-version-row");
    var setupRow    = document.getElementById("hh-setup-row");
    var radios      = document.querySelectorAll('input[name="hh-version"]');
    if (!toggle || !versionRow || !setupRow) return;

    function syncVersionRow() {
      versionRow.hidden = !toggle.checked;
      if (!toggle.checked) {
        setupRow.hidden = true;
        radios.forEach(function (r) { r.checked = false; });
      }
    }

    function syncSetupRow() {
      var anyChecked = Array.prototype.some.call(radios, function (r) { return r.checked; });
      setupRow.hidden = !anyChecked;
    }

    toggle.addEventListener("change", syncVersionRow);
    radios.forEach(function (r) { r.addEventListener("change", syncSetupRow); });

    syncVersionRow();
  }());

  /* ──────────────────────────────────────────
     Modal open / close helpers
  ────────────────────────────────────────── */
  (function () {
    var modal    = document.getElementById("setup-modal");
    var backdrop = document.getElementById("app-backdrop");

    function openSetup() {
      if (modal)    modal.hidden    = false;
      if (backdrop) backdrop.hidden = false;
      document.body.classList.add("modal-open");
    }

    function closeSetup() {
      if (modal)    modal.hidden    = true;
      if (backdrop) backdrop.hidden = true;
      document.body.classList.remove("modal-open");
    }

    var btnLaunch = document.getElementById("btn-launch-setup");
    if (btnLaunch) btnLaunch.addEventListener("click", openSetup);

    var btnClose = document.getElementById("btn-close");
    if (btnClose) {
      btnClose.addEventListener("click", function () {
        if (confirm("Are you sure you want to close the setup?")) closeSetup();
      });
    }

    var btnDone = document.getElementById("btn-setup-done");
    if (btnDone) btnDone.addEventListener("click", closeSetup);
  }());

  /* ──────────────────────────────────────────
     FSC License Viewer — dropdown + filter + checkbox assign
  ────────────────────────────────────────── */
  (function () {
    var ALL_ORG_USERS = [
      { initials: 'LP', name: 'Leo Park',       username: 'leo.park@example.com',        profile: 'Community Plus Clone',  email: 'leo.park@example.com' },
      { initials: 'NK', name: 'nk dc admin',    username: 'nk.dc.admin@example.com',     profile: 'System Admin DC',       email: 'nithin.karnati@salesforce.com' },
      { initials: 'AU', name: 'Admin User',     username: 'admin@example.com',           profile: 'System Administrator',  email: 'admin@example.com' },
      { initials: 'NF', name: 'New Fin Advisor',username: 'fin.advisor@example.com',     profile: 'Standard user clone',   email: 'fin.advisor@example.com' },
      { initials: 'JD', name: 'Jane Doe',       username: 'jane.doe@example.com',        profile: 'Standard user clone',   email: 'jane.doe@example.com' },
      { initials: 'MS', name: 'Mark Singh',     username: 'mark.singh@example.com',      profile: 'Standard user clone',   email: 'mark.singh@example.com' },
      { initials: 'RP', name: 'Riya Patel',     username: 'riya.patel@example.com',      profile: 'Standard user clone',   email: 'riya.patel@example.com' },
      { initials: 'LM', name: 'Laura Martin',   username: 'laura.martin@example.com',    profile: 'System Administrator',  email: 'laura.martin@example.com' },
      { initials: 'TC', name: 'Tom Chen',       username: 'tom.chen@example.com',        profile: 'Standard user clone',   email: 'tom.chen@example.com' },
      { initials: 'SB', name: 'Sara Blake',     username: 'sara.blake@example.com',      profile: 'Community Plus Clone',  email: 'sara.blake@example.com' },
      { initials: 'KR', name: 'Kevin Rao',      username: 'kevin.rao@example.com',       profile: 'Standard user clone',   email: 'kevin.rao@example.com' },
      { initials: 'EJ', name: 'Emma Johnson',   username: 'emma.johnson@example.com',    profile: 'Standard user clone',   email: 'emma.johnson@example.com' }
    ];

    var LICENSES = [
      {
        key: 'ext', name: 'Financial Services Cloud Extension', available: 28,
        desc: "Allows the user to access Financial Services Cloud features delivered after Spring '20.",
        users: [
          { initials: 'AU', name: 'Admin User',     username: 'admin@example.com',        profile: 'System Administrator', email: 'admin@example.com' },
          { initials: 'NK', name: 'nk dc admin',    username: 'nk.dc.admin@example.com',  profile: 'System Admin DC',      email: 'nithin.karnati@salesforce.com' }
        ]
      },
      {
        key: 'sales', name: 'FSC Sales', available: 25,
        desc: 'Provides access to sales-specific FSC features including referrals, lead management, and opportunity tracking.',
        users: [
          { initials: 'JD', name: 'Jane Doe',   username: 'jane.doe@example.com',   profile: 'Standard user clone', email: 'jane.doe@example.com' },
          { initials: 'MS', name: 'Mark Singh', username: 'mark.singh@example.com', profile: 'Standard user clone', email: 'mark.singh@example.com' },
          { initials: 'RP', name: 'Riya Patel', username: 'riya.patel@example.com', profile: 'Standard user clone', email: 'riya.patel@example.com' }
        ]
      },
      {
        key: 'svc', name: 'FSC Service', available: 30,
        desc: 'Enables service-specific FSC capabilities including case management, service processes, and customer service tools.',
        users: [
          { initials: 'LM', name: 'Laura Martin', username: 'laura.martin@example.com', profile: 'System Administrator', email: 'laura.martin@example.com' }
        ]
      },
      {
        key: 'comp', name: 'Financial Services Cloud Comprehensive', available: 20,
        desc: 'Full access to all Financial Services Cloud capabilities, including wealth management, insurance, and banking features.',
        users: [
          { initials: 'TC', name: 'Tom Chen', username: 'tom.chen@example.com', profile: 'Standard user clone', email: 'tom.chen@example.com' }
        ]
      },
      {
        key: 'found', name: 'Financial Services Cloud Foundations', available: 35,
        desc: 'Core FSC access covering foundational objects such as financial accounts, goals, and household management.',
        users: [
          { initials: 'SB', name: 'Sara Blake', username: 'sara.blake@example.com', profile: 'Community Plus Clone', email: 'sara.blake@example.com' },
          { initials: 'KR', name: 'Kevin Rao',  username: 'kevin.rao@example.com',  profile: 'Standard user clone', email: 'kevin.rao@example.com' }
        ]
      }
    ];

    var selectorBtn     = document.getElementById('fsc-selector-btn');
    var selectorLabel   = document.getElementById('fsc-selector-label');
    var dropdown        = document.getElementById('fsc-selector-dropdown');
    var metaEl          = document.getElementById('fsc-viewer-meta');
    var descEl          = document.getElementById('fsc-viewer-desc');
    var thead           = document.getElementById('fsc-viewer-thead');
    var tbody           = document.getElementById('fsc-viewer-tbody');
    var filterBtns      = document.querySelectorAll('[data-fsc-filter]');
    var listHeader      = document.getElementById('fsc-list-header');
    var listCount       = document.getElementById('fsc-list-count');
    var listSearch      = document.getElementById('fsc-list-search');
    var selectionCount  = document.getElementById('fsc-selection-count');
    var assignSelBtn    = document.getElementById('fsc-assign-selected-btn');
    if (!selectorBtn || !tbody) return;

    var currentKey    = 'ext';
    var currentFilter = 'assigned';
    var licenseUsers  = {};
    var visibleUsers  = ALL_ORG_USERS.slice(); /* respects search filter */
    LICENSES.forEach(function (l) { licenseUsers[l.key] = l.users.slice(); });

    function isAssigned(email) {
      return licenseUsers[currentKey].some(function (u) { return u.email === email; });
    }

    function removeSvg() {
      return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    }

    /* ── Count how many checkboxes are newly checked (unassigned) ── */
    function countNewSelections() {
      var checks = tbody.querySelectorAll('input[type="checkbox"][data-user-email]:not(:disabled)');
      var n = 0;
      checks.forEach(function (cb) { if (cb.checked) n++; });
      return n;
    }

    function updateSelectionBar() {
      var n = countNewSelections();
      selectionCount.textContent = n + ' selected';
      assignSelBtn.disabled = n === 0;
    }

    /* ── Sync select-all checkbox state ── */
    function syncSelectAll() {
      var selectAll = document.getElementById('fsc-select-all');
      if (!selectAll) return;
      var checks = Array.from(tbody.querySelectorAll('input[type="checkbox"][data-user-email]:not(:disabled)'));
      var checkedCount = checks.filter(function (cb) { return cb.checked; }).length;
      selectAll.checked = checks.length > 0 && checkedCount === checks.length;
      selectAll.indeterminate = checkedCount > 0 && checkedCount < checks.length;
    }

    /* ── Render the "Assigned Users" table ── */
    function renderAssignedTable(query) {
      thead.innerHTML =
        '<tr>' +
          '<th class="fsc-viewer__th fsc-viewer__th--num">#</th>' +
          '<th class="fsc-viewer__th">Full Name</th>' +
          '<th class="fsc-viewer__th">Username</th>' +
          '<th class="fsc-viewer__th">Profile</th>' +
          '<th class="fsc-viewer__th fsc-viewer__th--action"><span class="sr-only">Remove</span></th>' +
        '</tr>';

      var q = (query || '').toLowerCase().trim();
      var users = licenseUsers[currentKey].filter(function (u) {
        if (!q) return true;
        return u.name.toLowerCase().includes(q) ||
               (u.username || u.email).toLowerCase().includes(q) ||
               (u.profile || '').toLowerCase().includes(q);
      });

      if (!licenseUsers[currentKey].length) {
        tbody.innerHTML =
          '<tr><td class="fsc-viewer__td" colspan="5" style="color:var(--sf-text-muted);font-style:italic;text-align:center;padding:1.25rem;">No users assigned to this license.</td></tr>';
        return;
      }
      if (!users.length) {
        tbody.innerHTML =
          '<tr><td class="fsc-viewer__td" colspan="5" style="color:var(--sf-text-muted);font-style:italic;text-align:center;padding:1.25rem;">No users match your search.</td></tr>';
        return;
      }
      tbody.innerHTML = users.map(function (u, i) {
        return '<tr class="fsc-viewer__tr" data-user-key="' + u.email + '">' +
          '<td class="fsc-viewer__td fsc-viewer__td--num">' + (i + 1) + '</td>' +
          '<td class="fsc-viewer__td"><strong>' + u.name + '</strong></td>' +
          '<td class="fsc-viewer__td fsc-viewer__td--email">' + (u.username || u.email) + '</td>' +
          '<td class="fsc-viewer__td fsc-viewer__td--email">' + (u.profile || '—') + '</td>' +
          '<td class="fsc-viewer__td fsc-viewer__td--action"><button type="button" class="fsc-viewer__remove-btn" aria-label="Remove ' + u.name + '" data-remove-email="' + u.email + '">' + removeSvg() + '</button></td>' +
          '</tr>';
      }).join('');
    }

    /* ── Render the "All Users" table with checkboxes ── */
    function renderAllUsersTable() {
      thead.innerHTML =
        '<tr>' +
          '<th class="fsc-viewer__th fsc-viewer__th--cb"><input type="checkbox" id="fsc-select-all" aria-label="Select all users" /></th>' +
          '<th class="fsc-viewer__th">Full Name</th>' +
          '<th class="fsc-viewer__th">Username</th>' +
          '<th class="fsc-viewer__th">Profile</th>' +
        '</tr>';

      if (!visibleUsers.length) {
        tbody.innerHTML =
          '<tr><td class="fsc-viewer__td" colspan="4" style="color:var(--sf-text-muted);font-style:italic;text-align:center;padding:1.25rem;">No users match your search.</td></tr>';
        if (listCount) listCount.textContent = '0 items';
        return;
      }

      if (listCount) listCount.textContent = visibleUsers.length + ' item' + (visibleUsers.length !== 1 ? 's' : '');

      tbody.innerHTML = visibleUsers.map(function (u) {
        var assigned = isAssigned(u.email);
        /* Assigned users: checkbox checked + disabled (already have the license) */
        var cbAttr = assigned
          ? 'checked disabled aria-label="' + u.name + ' — already assigned"'
          : 'data-user-email="' + u.email + '" aria-label="Select ' + u.name + '"';
        var nameCells = assigned
          ? '<td class="fsc-viewer__td fsc-viewer__td--name-link">' + u.name + ' <span class="fsc-assigned-badge">Assigned</span></td>'
          : '<td class="fsc-viewer__td fsc-viewer__td--name-link fsc-viewer__td--unassigned">' + u.name + '</td>';
        return '<tr class="fsc-viewer__tr fsc-viewer__tr--cb' + (assigned ? ' fsc-viewer__tr--assigned' : '') + '" data-user-key="' + u.email + '">' +
          '<td class="fsc-viewer__td fsc-viewer__td--cb"><input type="checkbox" ' + cbAttr + ' /></td>' +
          nameCells +
          '<td class="fsc-viewer__td fsc-viewer__td--email">' + u.username + '</td>' +
          '<td class="fsc-viewer__td fsc-viewer__td--email">' + u.profile + '</td>' +
          '</tr>';
      }).join('');

      /* Wire select-all */
      var selectAll = document.getElementById('fsc-select-all');
      if (selectAll) {
        selectAll.addEventListener('change', function () {
          tbody.querySelectorAll('input[type="checkbox"][data-user-email]').forEach(function (cb) {
            cb.checked = selectAll.checked;
          });
          updateSelectionBar();
        });
      }

      updateSelectionBar();
    }

    /* ── Master render dispatcher ── */
    function renderTable() {
      var selCountEl  = document.getElementById('fsc-selection-count');
      var assignSelEl = document.getElementById('fsc-assign-selected-btn');
      if (currentFilter === 'assigned') {
        renderAssignedTable();
        if (listHeader)   listHeader.hidden   = false;
        if (listCount)    listCount.textContent = licenseUsers[currentKey].length + ' item' + (licenseUsers[currentKey].length !== 1 ? 's' : '');
        if (selCountEl)   selCountEl.hidden   = true;
        if (assignSelEl)  assignSelEl.hidden  = true;
      } else {
        renderAllUsersTable();
        if (listHeader)   listHeader.hidden   = false;
        if (selCountEl)   selCountEl.hidden   = false;
        if (assignSelEl)  assignSelEl.hidden  = false;
      }
    }

    function syncMeta() {
      var license = LICENSES.find(function (l) { return l.key === currentKey; });
      var count = licenseUsers[currentKey].length;
      if (metaEl) metaEl.textContent = count + ' assigned \u00B7 ' + license.available + ' available';
      var dropItem = dropdown.querySelector('[data-fsc-key="' + currentKey + '"] .fsc-viewer__dropdown-count');
      if (dropItem) dropItem.textContent = count + ' assigned';
    }

    function renderLicense(key) {
      var license = LICENSES.find(function (l) { return l.key === key; });
      if (!license) return;
      currentKey = key;
      selectorLabel.textContent = license.name;
      if (descEl) descEl.textContent = license.desc;
      visibleUsers = ALL_ORG_USERS.slice();
      if (listSearch) listSearch.value = '';
      syncMeta();
      renderTable();
      dropdown.querySelectorAll('.fsc-viewer__dropdown-item').forEach(function (item) {
        var active = item.getAttribute('data-fsc-key') === key;
        item.classList.toggle('fsc-viewer__dropdown-item--active', active);
        item.setAttribute('aria-selected', String(active));
      });
    }

    function closeDropdown() {
      dropdown.hidden = true;
      selectorBtn.setAttribute('aria-expanded', 'false');
    }

    /* ── Filter tabs ── */
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentFilter = btn.getAttribute('data-fsc-filter');
        filterBtns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('fsc-viewer__filter-btn--active', active);
          b.setAttribute('aria-selected', String(active));
        });
        visibleUsers = ALL_ORG_USERS.slice();
        if (listSearch) { listSearch.value = ''; listSearch.setAttribute('placeholder', currentFilter === 'assigned' ? 'Search assigned users…' : 'Search this list…'); }
        renderTable();
      });
    });

    /* ── Checkbox changes (event delegation on tbody) ── */
    tbody.addEventListener('change', function (e) {
      if (e.target.type === 'checkbox' && e.target.dataset.userEmail) {
        syncSelectAll();
        updateSelectionBar();
      }
    });

    /* ── Assign Selected button ── */
    if (assignSelBtn) {
      assignSelBtn.addEventListener('click', function () {
        var newEmails = [];
        tbody.querySelectorAll('input[type="checkbox"][data-user-email]:checked').forEach(function (cb) {
          newEmails.push(cb.dataset.userEmail);
        });
        newEmails.forEach(function (email) {
          if (!isAssigned(email)) {
            var user = ALL_ORG_USERS.find(function (u) { return u.email === email; });
            if (user) licenseUsers[currentKey].push(user);
          }
        });
        syncMeta();
        /* Switch to Assigned Users tab to show result */
        currentFilter = 'assigned';
        filterBtns.forEach(function (b) {
          var active = b.getAttribute('data-fsc-filter') === 'assigned';
          b.classList.toggle('fsc-viewer__filter-btn--active', active);
          b.setAttribute('aria-selected', String(active));
        });
        renderTable();
      });
    }

    /* ── Remove button (in Assigned Users view) ── */
    tbody.addEventListener('click', function (e) {
      var removeBtn = e.target.closest('[data-remove-email]');
      if (!removeBtn) return;
      var email = removeBtn.getAttribute('data-remove-email');
      licenseUsers[currentKey] = licenseUsers[currentKey].filter(function (u) { return u.email !== email; });
      syncMeta();
      renderTable();
    });

    /* ── List search (both modes) ── */
    if (listSearch) {
      listSearch.addEventListener('input', function () {
        var q = listSearch.value.toLowerCase().trim();
        if (currentFilter === 'assigned') {
          renderAssignedTable(q);
        } else {
          visibleUsers = q
            ? ALL_ORG_USERS.filter(function (u) {
                return u.name.toLowerCase().includes(q) ||
                       u.username.toLowerCase().includes(q) ||
                       u.profile.toLowerCase().includes(q);
              })
            : ALL_ORG_USERS.slice();
          renderAllUsersTable();
        }
      });
    }

    /* ── License dropdown ── */
    selectorBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dropdown.hidden;
      dropdown.hidden = !open;
      selectorBtn.setAttribute('aria-expanded', String(open));
    });

    dropdown.addEventListener('click', function (e) {
      var item = e.target.closest('[data-fsc-key]');
      if (item) { renderLicense(item.getAttribute('data-fsc-key')); closeDropdown(); }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.fsc-viewer__selector-wrap')) closeDropdown();
    });

    renderLicense('ext');
  }());

  /* ──────────────────────────────────────────
     Picklist Value Manager — ACR Roles & PRR
  ────────────────────────────────────────── */
  (function () {

    function toApiName(label) {
      return label.trim().replace(/[^a-zA-Z0-9]+(.)/g, function (_, c) { return c.toUpperCase(); })
                         .replace(/[^a-zA-Z0-9]/g, "")
                         .replace(/^./, function (c) { return c.toUpperCase(); });
    }

    function deleteSvg() {
      return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
    }

    function updateCount(badgeId, tbodyId) {
      var badge = document.getElementById(badgeId);
      var tbody = document.getElementById(tbodyId);
      if (!badge || !tbody) return;
      var rows = tbody.querySelectorAll("tr.pv-table__row:not(.pv-table__row--group-head)").length;
      badge.textContent = rows + " value" + (rows !== 1 ? "s" : "");
    }

    function bindDeleteBtns(tbody, badgeId) {
      tbody.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-pv-delete]");
        if (!btn) return;
        var row = btn.closest("tr");
        if (row) {
          row.remove();
          updateCount(badgeId, tbody.id);
        }
      });
    }

    /* ── ACR Roles ─────────────────────── */
    (function () {
      var tbody    = document.getElementById("acr-roles-tbody");
      var addRow   = document.getElementById("acr-role-add-row");
      var addBtn   = document.getElementById("acr-role-add-btn");
      var confirm  = document.getElementById("acr-role-add-confirm");
      var cancel   = document.getElementById("acr-role-add-cancel");
      var inLabel  = document.getElementById("acr-role-new-label");
      var inApi    = document.getElementById("acr-role-new-api");
      if (!tbody || !addRow) return;

      bindDeleteBtns(tbody, "acr-role-count");

      inLabel.addEventListener("input", function () {
        inApi.placeholder = toApiName(inLabel.value) || "Auto-generated";
      });

      addBtn.addEventListener("click", function () {
        addRow.hidden = false;
        addBtn.closest(".pv-card__footer").hidden = true;
        inLabel.focus();
      });

      cancel.addEventListener("click", function () {
        addRow.hidden = true;
        addBtn.closest(".pv-card__footer").hidden = false;
        inLabel.value = "";
        inApi.value = "";
        inApi.placeholder = "Auto-generated";
      });

      confirm.addEventListener("click", function () {
        var label = inLabel.value.trim();
        if (!label) { inLabel.focus(); return; }
        var api = inApi.value.trim() || toApiName(label);
        var tr = document.createElement("tr");
        tr.className = "pv-table__row";
        tr.setAttribute("data-value", api);
        tr.innerHTML =
          '<td class="pv-table__td">' + label + '</td>' +
          '<td class="pv-table__td pv-table__td--api">' + api + '</td>' +
          '<td class="pv-table__td pv-table__td--actions">' +
            '<button type="button" class="pv-delete-btn" aria-label="Delete ' + label + '" data-pv-delete>' + deleteSvg() + '</button>' +
          '</td>';
        tbody.appendChild(tr);
        updateCount("acr-role-count", "acr-roles-tbody");
        inLabel.value = "";
        inApi.value = "";
        inApi.placeholder = "Auto-generated";
        addRow.hidden = true;
        addBtn.closest(".pv-card__footer").hidden = false;
      });
    }());

    /* ── Party Role Relationships ───────── */
    (function () {
      var tbody   = document.getElementById("prr-tbody");
      var addRow  = document.getElementById("prr-add-row");
      var addBtn  = document.getElementById("prr-add-btn");
      var confirm = document.getElementById("prr-add-confirm");
      var cancel  = document.getElementById("prr-add-cancel");
      var inLabel   = document.getElementById("prr-new-label");
      var inInverse = document.getElementById("prr-new-inverse");
      var inType    = document.getElementById("prr-new-type");
      if (!tbody || !addRow) return;

      bindDeleteBtns(tbody, "prr-count");

      addBtn.addEventListener("click", function () {
        addRow.hidden = false;
        addBtn.closest(".pv-card__footer").hidden = true;
        inLabel.focus();
      });

      cancel.addEventListener("click", function () {
        addRow.hidden = true;
        addBtn.closest(".pv-card__footer").hidden = false;
        inLabel.value = "";
        inInverse.value = "";
      });

      confirm.addEventListener("click", function () {
        var label   = inLabel.value.trim();
        if (!label) { inLabel.focus(); return; }
        var inverse = inInverse.value.trim() || label;
        var type    = inType.value;
        var badgeCls = type === "CCR" ? "pv-type-badge--ccr" : "pv-type-badge--aar";
        var badgeLabel = type === "CCR" ? "CCR" : "AAR";

        var groupHead = tbody.querySelector('[data-group="' + type + '"]');
        var tr = document.createElement("tr");
        tr.className = "pv-table__row";
        tr.setAttribute("data-value", toApiName(label));
        tr.innerHTML =
          '<td class="pv-table__td">' + label + '</td>' +
          '<td class="pv-table__td"><span class="pv-type-badge ' + badgeCls + '">' + badgeLabel + '</span></td>' +
          '<td class="pv-table__td pv-table__td--muted">' + inverse + '</td>' +
          '<td class="pv-table__td pv-table__td--actions">' +
            '<button type="button" class="pv-delete-btn" aria-label="Delete ' + label + '" data-pv-delete>' + deleteSvg() + '</button>' +
          '</td>';

        if (groupHead) {
          groupHead.insertAdjacentElement("afterend", tr);
        } else {
          tbody.appendChild(tr);
        }

        updateCount("prr-count", "prr-tbody");
        inLabel.value = "";
        inInverse.value = "";
        addRow.hidden = true;
        addBtn.closest(".pv-card__footer").hidden = false;
      });
    }());

  }());

  /* ──────────────────────────────────────────
     Viz mode toggle: Select a Graph / Template
  ────────────────────────────────────────── */
  (function () {
    var radios       = document.querySelectorAll('input[name="arc-mode"]');
    var panelSelect  = document.getElementById("arc-panel-select");
    var panelTemplate = document.getElementById("arc-panel-template");
    if (!radios.length || !panelSelect || !panelTemplate) return;

    function applyMode(val) {
      panelSelect.hidden   = (val === "template");
      panelTemplate.hidden = (val === "select");
    }

    radios.forEach(function (r) {
      r.addEventListener("change", function () { applyMode(r.value); });
    });

    applyMode("select");
  }());

  /* ──────────────────────────────────────────
     Create from Template — ARC graph
  ────────────────────────────────────────── */
  (function () {
    var templateSelect = document.getElementById("arc-template-select");
    var previewBox     = document.getElementById("arc-template-preview-box");
    var saveBtn        = document.getElementById("btn-save-template");
    var savedNotice    = document.getElementById("arc-template-saved-notice");
    if (!templateSelect) return;

    var templates = {
      "standard-household": {
        root: { label: "#Account", color: "indigo", icon: "grid" },
        children: [
          { label: "Members",          color: "violet", icon: "person-group", rel: "Many-to-Many" },
          { label: "Related Contacts", color: "violet", icon: "person",       rel: "Many-to-Many" },
          { label: "Related Accounts", color: "blue",   icon: "grid",         rel: "Many-to-Many" }
        ]
      },
      "financial-services": {
        root: { label: "#Account", color: "indigo", icon: "grid" },
        children: [
          { label: "Members",     color: "violet", icon: "person-group", rel: "Many-to-Many" },
          { label: "Investments", color: "teal",   icon: "grid",         rel: "Many-to-Many" },
          { label: "Advisors",    color: "blue",   icon: "person",       rel: "Many-to-Many" }
        ]
      },
      "wealth-management": {
        root: { label: "#Account", color: "indigo", icon: "grid" },
        children: [
          { label: "Beneficiaries", color: "violet", icon: "person",       rel: "Many-to-Many" },
          { label: "Trustees",      color: "teal",   icon: "person-group", rel: "Many-to-Many" },
          { label: "Assets",        color: "blue",   icon: "grid",         rel: "Many-to-Many" }
        ]
      },
      "family-office": {
        root: { label: "#Account", color: "indigo", icon: "grid" },
        children: [
          { label: "Members",  color: "violet", icon: "person-group", rel: "Many-to-Many" },
          { label: "Entities", color: "teal",   icon: "grid",         rel: "Many-to-Many" },
          { label: "Advisors", color: "blue",   icon: "person",       rel: "Many-to-Many" }
        ]
      }
    };

    function iconSvg(type, color) {
      var paths = type === "grid"
        ? '<rect x="3" y="3" width="18" height="18" rx="2" stroke="white" stroke-width="1.8"/><path d="M3 9h18M9 3v18" stroke="white" stroke-width="1.8"/>'
        : type === "person-group"
          ? '<circle cx="9" cy="7" r="3" stroke="white" stroke-width="1.8"/><path d="M3 20v-1a5 5 0 0 1 5-5h2" stroke="white" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="13" r="2.5" stroke="white" stroke-width="1.5"/><path d="M13 21v-.5a3.5 3.5 0 0 1 3.5-3.5h1a3.5 3.5 0 0 1 3.5 3.5V21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>'
          : '<circle cx="12" cy="7" r="3.5" stroke="white" stroke-width="1.8"/><path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" stroke="white" stroke-width="1.8" stroke-linecap="round"/>';
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">' + paths + '</svg>';
    }

    function renderPreview(key) {
      var tpl = templates[key];
      if (!tpl) {
        previewBox.innerHTML = '<p class="arc-graph__hint">Select a template to preview the graph layout.</p>';
        return;
      }
      var r = tpl.root;
      var cols = tpl.children.map(function (c) {
        return '<div class="arc-graph__col">'
          + '<div class="arc-graph__stem" aria-hidden="true"></div>'
          + '<div class="arc-node">'
            + '<div class="arc-node__icon arc-node__icon--' + c.color + '" aria-hidden="true">' + iconSvg(c.icon, c.color) + '</div>'
            + '<div class="arc-node__body"><span class="arc-node__name">' + c.label + '</span><span class="arc-node__rel">' + c.rel + '</span></div>'
          + '</div>'
        + '</div>';
      }).join("");

      previewBox.innerHTML =
        '<div class="arc-graph__root">'
          + '<div class="arc-node">'
            + '<div class="arc-node__icon arc-node__icon--' + r.color + '" aria-hidden="true">' + iconSvg(r.icon, r.color) + '</div>'
            + '<div class="arc-node__body"><span class="arc-node__name">' + r.label + '</span></div>'
          + '</div>'
        + '</div>'
        + '<div class="arc-graph__trunk" aria-hidden="true"></div>'
        + '<div class="arc-graph__row">'
          + '<div class="arc-graph__h-bar" aria-hidden="true"></div>'
          + cols
        + '</div>'
        + '<p class="arc-graph__hint">Preview is illustrative. Configure nodes in ARC Settings.</p>';
    }

    templateSelect.addEventListener("change", function () {
      var val = templateSelect.value;
      if (val) {
        renderPreview(val);
        saveBtn.disabled    = false;
        savedNotice.hidden  = true;
      } else {
        previewBox.innerHTML = '<p class="arc-graph__hint">Select a template to preview the graph layout.</p>';
        saveBtn.disabled    = true;
        savedNotice.hidden  = true;
      }
    });

    saveBtn.addEventListener("click", function () {
      var selectedVal   = templateSelect.value;
      var selectedLabel = templateSelect.options[templateSelect.selectedIndex].text;

      // Add the saved graph to the "Select a Graph" dropdown (if not already there)
      var graphSelect = document.getElementById("arc-graph-name");
      if (graphSelect) {
        var alreadyExists = Array.from(graphSelect.options).some(function (o) {
          return o.value === "tpl-" + selectedVal;
        });
        if (!alreadyExists) {
          var newOpt = document.createElement("option");
          newOpt.value = "tpl-" + selectedVal;
          newOpt.textContent = selectedLabel + " (from template)";
          graphSelect.appendChild(newOpt);
        }
        // Select the newly added graph
        graphSelect.value = "tpl-" + selectedVal;
      }

      saveBtn.disabled   = true;
      savedNotice.hidden = false;

      // Switch to the "Select a Graph" panel after a short delay so the user sees the success state
      setTimeout(function () {
        var modeSelect = document.getElementById("arc-mode-select");
        var panelSelect   = document.getElementById("arc-panel-select");
        var panelTemplate = document.getElementById("arc-panel-template");
        if (modeSelect && panelSelect && panelTemplate) {
          modeSelect.checked    = true;
          panelSelect.hidden    = false;
          panelTemplate.hidden  = true;
        }
      }, 1200);
    });
  }());

}());
