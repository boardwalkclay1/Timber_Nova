// Smooth scroll for header and hero buttons
function setupScrollLinks() {
  const scrollLinks = document.querySelectorAll("[data-scroll-target]");

  scrollLinks.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSelector = btn.getAttribute("data-scroll-target");
      const targetEl = document.querySelector(targetSelector);
      if (!targetEl) return;
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// Left panel tab switching
function setupPanelTabs() {
  const tabs = document.querySelectorAll(".panel-tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-panel-target");

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === target.slice(1));
      });
    });
  });
}

// Tree Theme toggle (just adds/removes a body class for now)
function setupTreeThemeToggle() {
  const toggle = document.getElementById("tree-theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("tree-theme-active");
    } else {
      document.body.classList.remove("tree-theme-active");
    }
  });
}

// Weather layer toggles (hooks where you wire actual overlays)
function setupWeatherLayerControls() {
  const weatherCheckboxes = document.querySelectorAll(
    "#weather-controls input[type='checkbox'][data-weather-layer]"
  );

  weatherCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const layer = checkbox.getAttribute("data-weather-layer");
      const enabled = checkbox.checked;

      // TODO: hook into your map weather overlay engine
      console.log("Weather layer toggle:", layer, "->", enabled);
    });
  });
}

// Base map layer controls (hooks)
function setupBaseLayerControls() {
  const radios = document.querySelectorAll("input[name='base-layer']");

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      const value = radio.value;

      // TODO: switch your map engine base layer here
      console.log("Base map layer changed to:", value);
    });
  });
}

// Weather Center: "View on Map" integration
function setupWeatherCenterIntegration() {
  const weatherSearchInput = document.getElementById("weather-search");
  const weatherSearchBtn = document.getElementById("weather-search-btn");
  const weatherResults = document.getElementById("weather-results");
  const viewOnMapBtn = document.getElementById("view-on-map-btn");

  if (!weatherSearchInput || !weatherSearchBtn || !weatherResults || !viewOnMapBtn) return;

  let lastWeatherLocation = null;

  weatherSearchBtn.addEventListener("click", () => {
    const query = weatherSearchInput.value.trim();
    if (!query) return;

    // TODO: call your weather lookup engine here and render results.
    // For now, just mock it.
    lastWeatherLocation = { query }; // You’ll replace this with lat/lng + metadata.

    weatherResults.innerHTML = `
      <p><strong>Location:</strong> ${query}</p>
      <p>Weather data goes here (radar, wind, temp, etc.).</p>
    `;
    viewOnMapBtn.disabled = false;
  });

  viewOnMapBtn.addEventListener("click", () => {
    if (!lastWeatherLocation) return;

    // 1. Scroll to map
    const mapSection = document.getElementById("map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // 2. Ensure weather controls are checked however you want
    const radarCheckbox = document.querySelector(
      "#weather-controls input[data-weather-layer='radar']"
    );
    if (radarCheckbox && !radarCheckbox.checked) {
      radarCheckbox.checked = true;
      radarCheckbox.dispatchEvent(new Event("change"));
    }

    // 3. Center your map on the lastWeatherLocation (when you wire the real engine)
    console.log("View on Map for location:", lastWeatherLocation);

    // TODO: call mapEngine.centerOn(lat, lng) and sync active weather overlays.
  });
}

// Client View buttons (hooks)
function setupClientView() {
  const showBtn = document.getElementById("show-job-view-btn");
  const clearBtn = document.getElementById("clear-job-view-btn");

  if (!showBtn || !clearBtn) return;

  showBtn.addEventListener("click", () => {
    const name = document.getElementById("client-name").value.trim();
    const address = document.getElementById("client-address").value.trim();
    const notes = document.getElementById("client-notes").value.trim();

    if (!address) return;

    console.log("Show job view:", { name, address, notes });

    // TODO:
    // 1. Geocode address -> lat/lng
    // 2. Place marker on map
    // 3. Route from current location
    // 4. Center map + adjust zoom
    // 5. Optionally enable weather overlays for that area.
  });

  clearBtn.addEventListener("click", () => {
    // TODO: clear job marker/route from map
    console.log("Clear job view");
  });
}

// Supply Finder (hooks)
function setupSupplyFinder() {
  const btn = document.getElementById("find-supplies-btn");
  const queryInput = document.getElementById("supply-query");
  const resultsEl = document.getElementById("supply-results");

  if (!btn || !queryInput || !resultsEl) return;

  btn.addEventListener("click", () => {
    const query = queryInput.value.trim();
    if (!query) return;

    console.log("Find supplies for:", query);

    // TODO: call your store search engine / data source.
    // For now, mock results:
    resultsEl.innerHTML = `
      <div>Mock store result for "<strong>${query}</strong>" goes here.</div>
      <div>Wire this to real data (distance, stock, directions).</div>
    `;
  });
}

// Equipment & Parts Finder (hooks)
function setupEquipmentFinder() {
  const btn = document.getElementById("find-parts-btn");
  const typeEl = document.getElementById("equipment-type");
  const brandEl = document.getElementById("equipment-brand");
  const modelEl = document.getElementById("equipment-model");
  const resultsEl = document.getElementById("parts-results");

  if (!btn || !typeEl || !brandEl || !modelEl || !resultsEl) return;

  btn.addEventListener("click", () => {
    const type = typeEl.value;
    const brand = brandEl.value.trim();
    const model = modelEl.value.trim();

    if (!type || !brand || !model) return;

    console.log("Find parts for:", { type, brand, model });

    // TODO: call your parts database / API.
    resultsEl.innerHTML = `
      <div>Parts for <strong>${brand} ${model}</strong> (${type}) go here.</div>
      <div>Wire this to real part numbers and nearby stores.</div>
    `;
  });
}

// Map initialization hook
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  // TODO: mount your custom tile engine / map library here.
  console.log("Initialize map here.");
}

document.addEventListener("DOMContentLoaded", () => {
  setupScrollLinks();
  setupPanelTabs();
  setupTreeThemeToggle();
  setupWeatherLayerControls();
  setupBaseLayerControls();
  setupWeatherCenterIntegration();
  setupClientView();
  setupSupplyFinder();
  setupEquipmentFinder();
  initMap();
});
