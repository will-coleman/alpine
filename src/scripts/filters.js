/**
 * The filters. Vanilla, ~1.5KB, and the only JavaScript the site ships.
 *
 * It reads its configuration off the markup, so the same file drives the
 * country index (region + search) and the gem list (country + type + search)
 * without knowing anything about either.
 *
 * State goes in the query string, so a filtered view can be sent to someone.
 * Everything is rendered server-side and visible with JS off; this only ever
 * hides rows.
 */
(function () {
  var root = document.querySelector("[data-filter-root]");
  if (!root) return;

  var items = Array.prototype.slice.call(root.querySelectorAll("[data-item]"));
  var chips = Array.prototype.slice.call(root.querySelectorAll("[data-filter-key]"));
  var search = root.querySelector("[data-filter-search]");
  var tally = root.querySelector("[data-filter-tally]");
  var empty = root.querySelector("[data-filter-empty]");
  var total = items.length;

  var state = {};
  chips.forEach(function (chip) {
    state[chip.dataset.filterKey] = null;
  });
  var query = "";

  function readUrl() {
    var params = new URLSearchParams(location.search);
    Object.keys(state).forEach(function (key) {
      state[key] = params.get(key);
    });
    query = (params.get("q") || "").trim().toLowerCase();
    if (search) search.value = params.get("q") || "";
  }

  function writeUrl() {
    var params = new URLSearchParams();
    Object.keys(state).forEach(function (key) {
      if (state[key]) params.set(key, state[key]);
    });
    if (query) params.set("q", query);
    var qs = params.toString();
    history.replaceState(null, "", qs ? "?" + qs : location.pathname);
  }

  function apply() {
    var shown = 0;
    items.forEach(function (item) {
      var ok = true;
      Object.keys(state).forEach(function (key) {
        if (state[key] && item.dataset[key] !== state[key]) ok = false;
      });
      if (ok && query && (item.dataset.search || "").indexOf(query) === -1) ok = false;
      item.hidden = !ok;
      if (ok) shown++;
    });

    chips.forEach(function (chip) {
      var on = state[chip.dataset.filterKey] === chip.dataset.filterValue;
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });

    if (tally) tally.textContent = shown === total ? "All " + total : shown + " of " + total;
    if (empty) empty.hidden = shown !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var key = chip.dataset.filterKey;
      state[key] = state[key] === chip.dataset.filterValue ? null : chip.dataset.filterValue;
      writeUrl();
      apply();
    });
  });

  if (search) {
    search.addEventListener("input", function () {
      query = search.value.trim().toLowerCase();
      writeUrl();
      apply();
    });
  }

  window.addEventListener("popstate", function () {
    readUrl();
    apply();
  });

  readUrl();
  apply();
})();
