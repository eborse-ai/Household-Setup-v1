(function () {

  /* ──────────────────────────────────────────
     Data Cloud Household Reconciliation toggle
  ────────────────────────────────────────── */
  (function () {
    var toggle   = document.getElementById("toggle-dc-hh");
    var infoCard = document.getElementById("dc-hh-info-card");
    if (!toggle || !infoCard) return;

    function sync() {
      var on = toggle.checked;
      infoCard.hidden = !on;
      infoCard.setAttribute("aria-hidden", String(!on));
    }

    toggle.addEventListener("change", sync);
    sync();
  }());

  /* ──────────────────────────────────────────
     AI toggle → RRA card visibility
  ────────────────────────────────────────── */
  (function () {
    var toggle = document.getElementById("toggle-ai");
    var rra    = document.getElementById("rra-card");
    if (!toggle || !rra) return;

    function sync() {
      var on = toggle.checked;
      rra.hidden = !on;
      rra.setAttribute("aria-hidden", String(!on));
      var link = rra.querySelector("a");
      if (link) {
        if (on) link.removeAttribute("tabindex");
        else link.setAttribute("tabindex", "-1");
      }
    }

    toggle.addEventListener("change", sync);
    sync();
  }());

  /* ──────────────────────────────────────────
     Multiselect dropdowns
  ────────────────────────────────────────── */
  function closeAllMultiselectDropdowns() {
    document.querySelectorAll("[data-multiselect-dropdown]").forEach(function (dd) {
      if (dd.hidden) return;
      dd.hidden = true;
      dd.classList.remove("is-fixed");
      dd.style.left = dd.style.top = dd.style.width = "";
      var root = dd.closest("[data-multiselect-root]");
      if (root) {
        var tr = root.querySelector(".multiselect__trigger");
        if (tr) tr.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initMultiselect(msRoot) {
    var trigger    = msRoot.querySelector(".multiselect__trigger");
    var dropdown   = msRoot.querySelector("[data-multiselect-dropdown]");
    var summary    = msRoot.querySelector("[data-multiselect-summary]");
    var pills      = msRoot.querySelector("[data-multiselect-pills]");
    var checkboxes = msRoot.querySelectorAll(".multiselect__dropdown input[type=checkbox]");
    var previewId  = msRoot.getAttribute("data-runtime-preview-id");
    var previewList = previewId ? document.getElementById(previewId) : null;

    if (!trigger || !dropdown) return;

    function pos() {
      if (dropdown.hidden) return;
      var r = trigger.getBoundingClientRect();
      dropdown.classList.add("is-fixed");
      dropdown.style.left  = Math.round(r.left)       + "px";
      dropdown.style.top   = Math.round(r.bottom + 4) + "px";
      dropdown.style.width = Math.round(r.width)      + "px";
    }

    function clearPos() {
      dropdown.classList.remove("is-fixed");
      dropdown.style.left = dropdown.style.top = dropdown.style.width = "";
    }

    function renderSummary() {
      if (!summary) return;
      var n = 0;
      checkboxes.forEach(function (cb) { if (cb.checked) n++; });
      summary.textContent = n === 0
        ? "0 options selected"
        : n + " option" + (n === 1 ? "" : "s") + " selected";
    }

    function renderPills() {
      if (!pills) return;
      pills.innerHTML = "";
      checkboxes.forEach(function (cb) {
        if (!cb.checked) return;
        var label = cb.getAttribute("data-label") || cb.value;
        var pill  = document.createElement("span");
        pill.className = "pill";
        pill.setAttribute("data-value", cb.value);

        var text = document.createElement("span");
        text.textContent = label;

        var rm = document.createElement("button");
        rm.type = "button";
        rm.className = "pill__remove";
        rm.setAttribute("aria-label", "Remove " + label);
        rm.innerHTML = "&times;";
        rm.addEventListener("click", function (e) {
          e.stopPropagation();
          cb.checked = false;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
        });

        pill.appendChild(text);
        pill.appendChild(rm);
        pills.appendChild(pill);
      });
    }

    function renderPreview() {
      if (!previewList) return;
      previewList.innerHTML = "";
      checkboxes.forEach(function (cb) {
        if (!cb.checked) return;
        var li = document.createElement("li");
        li.className = "runtime-preview__item";
        li.textContent = cb.getAttribute("data-label") || cb.value;
        previewList.appendChild(li);
      });
      if (!previewList.children.length) {
        var empty = document.createElement("li");
        empty.className = "runtime-preview__item runtime-preview__item--empty";
        empty.textContent = "No fields selected.";
        previewList.appendChild(empty);
      }
    }

    function sync() { renderSummary(); renderPills(); renderPreview(); }

    function closeDropdown() {
      dropdown.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      clearPos();
    }

    function openDropdown() {
      dropdown.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      requestAnimationFrame(pos);
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (trigger.getAttribute("aria-expanded") === "true") closeDropdown();
      else { closeAllMultiselectDropdowns(); openDropdown(); }
    });

    document.addEventListener("click", closeDropdown);
    msRoot.addEventListener("click", function (e) { e.stopPropagation(); });
    window.addEventListener("resize", function () { if (!dropdown.hidden) pos(); });
    window.addEventListener("scroll", function () { if (!dropdown.hidden) pos(); }, true);
    checkboxes.forEach(function (cb) { cb.addEventListener("change", sync); });
    sync();
  }

  /* ──────────────────────────────────────────
     Card accordions
  ────────────────────────────────────────── */
  function bindAccordions(root) {
    root.querySelectorAll(".accordion__section").forEach(function (sec) {
      var btn   = sec.querySelector(".accordion__header");
      var panel = sec.querySelector(".accordion__panel");
      if (!btn || !panel) return;

      function setOpen(open) {
        sec.classList.toggle("is-open", open);
        panel.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        panel.setAttribute("aria-hidden", String(!open));
        if (!open) closeAllMultiselectDropdowns();
      }

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(!sec.classList.contains("is-open"));
      });

      setOpen(sec.classList.contains("is-open"));
    });
  }

  /* ──────────────────────────────────────────
     Initialise ALL multiselects on the page
     Accordion binding is handled by page-1-global-preferences.js.
     Calling initMultiselect here (even for hidden panels) pre-renders
     pills into the DOM so they appear immediately when a panel opens.
  ────────────────────────────────────────── */
  (function () {
    document.querySelectorAll("[data-multiselect-root]").forEach(initMultiselect);
  }());

  /* ──────────────────────────────────────────
     Manage Relationships viz-card selection
  ────────────────────────────────────────── */
  (function () {
    var workspace = document.getElementById("additional-details-workspace");
    if (!workspace) return;

    var vizCards = workspace.querySelectorAll(".hh-viz-card[data-ad-target]");
    var adConfig = document.getElementById("additional-details-config");
    if (!adConfig || !vizCards.length) return;

    var adPanels = adConfig.querySelectorAll("[data-ad-panel]");

    function select(id) {
      vizCards.forEach(function (c) {
        var on = c.getAttribute("data-ad-target") === id;
        c.classList.toggle("hh-viz-card--active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      adPanels.forEach(function (p) {
        p.hidden = p.getAttribute("data-ad-panel") !== id;
      });
      closeAllMultiselectDropdowns();
    }

    vizCards.forEach(function (c) {
      c.addEventListener("click", function () { select(c.getAttribute("data-ad-target")); });
    });

    select("members");
  }());

  /* ──────────────────────────────────────────
     Close button
  ────────────────────────────────────────── */
  (function () {
    var btn = document.getElementById("btn-close");
    if (btn) btn.addEventListener("click", function () { /* wire to your app */ });
  }());

}());
