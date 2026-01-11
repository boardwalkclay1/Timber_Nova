// ===============================
// Timber Nova - App JS
// ===============================

// -------------------------------
// Smooth scroll for nav + buttons
// -------------------------------
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

// -------------------------------
// Left panel tab switching
// -------------------------------
function setupPanelTabs() {
  const tabs = document.querySelectorAll(".panel-tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-panel-target");

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      panels.forEach((panel) => {
        panel.classList.toggle("active", "#" + panel.id === target);
      });
    });
  });
}

// -------------------------------
// Tree Theme toggle
// -------------------------------
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

// -------------------------------
// Weather layer controls (hook)
// -------------------------------
function setupWeatherLayerControls() {
  const weatherCheckboxes = document.querySelectorAll(
    "#weather-controls input[type='checkbox'][data-weather-layer]"
  );

  weatherCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const layer = checkbox.getAttribute("data-weather-layer");
      const enabled = checkbox.checked;

      // TODO: hook into radar/wind/etc overlays on overlayLayer if you want
      console.log("Weather layer toggle:", layer, "->", enabled);
    });
  });
}

// -------------------------------
// Base map layer controls
// -------------------------------
function setupBaseLayerControls() {
  const radios = document.querySelectorAll("input[name='base-layer']");

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      const value = radio.value;

      if (typeof mapEngine !== "undefined") {
        mapEngine.setBaseLayer(value);
      }

      console.log("Base map layer changed to:", value);
    });
  });
}

// -------------------------------
// Weather Center → Map integration
// -------------------------------
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

    // TODO: call your real weather lookup here.
    lastWeatherLocation = {
      query,
      // lat, lng when you wire geocoding + weather
    };

    weatherResults.innerHTML = `
      <p><strong>Location:</strong> ${query}</p>
      <p>Weather data goes here (radar, wind, temp, etc.).</p>
    `;
    viewOnMapBtn.disabled = false;
  });

  viewOnMapBtn.addEventListener("click", () => {
    if (!lastWeatherLocation) return;

    const mapSection = document.getElementById("map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const radarCheckbox = document.querySelector(
      "#weather-controls input[data-weather-layer='radar']"
    );
    if (radarCheckbox && !radarCheckbox.checked) {
      radarCheckbox.checked = true;
      radarCheckbox.dispatchEvent(new Event("change"));
    }

    // When you have lat/lng:
    // mapEngine.setCenter(lastWeatherLocation.lat, lastWeatherLocation.lng);

    console.log("View on Map for location:", lastWeatherLocation);
  });
}

// -------------------------------
// Client View hooks
// -------------------------------
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
    // 2. mapEngine.setCenter(lat, lng);
    // 3. Add marker into overlay layer.
  });

  clearBtn.addEventListener("click", () => {
    console.log("Clear job view");
    // TODO: remove job marker/route from overlay layer.
  });
}

// -------------------------------
// Supply Finder hooks
// -------------------------------
function setupSupplyFinder() {
  const btn = document.getElementById("find-supplies-btn");
  const queryInput = document.getElementById("supply-query");
  const resultsEl = document.getElementById("supply-results");

  if (!btn || !queryInput || !resultsEl) return;

  btn.addEventListener("click", () => {
    const query = queryInput.value.trim();
    if (!query) return;

    console.log("Find supplies for:", query);

    // TODO: call your supply/store source.
    resultsEl.innerHTML = `
      <div>Mock store result for "<strong>${query}</strong>".</div>
      <div>Wire this to real data (distance, stock, directions).</div>
    `;
  });
}

// -------------------------------
// Equipment & Parts Finder hooks
// -------------------------------
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

    // TODO: call your parts database.
    resultsEl.innerHTML = `
      <div>Parts for <strong>${brand} ${model}</strong> (${type}) go here.</div>
      <div>Wire this to real part numbers and nearby stores.</div>
    `;
  });
}

// ===============================
// MAP ENGINE (tile / pan / zoom)
// ===============================
const mapEngine = (() => {
  const TILE_SIZE = 256;
  const MIN_ZOOM = 2;
  const MAX_ZOOM = 20;

  const TILE_SOURCES = {
    street: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", // placeholder
    terrain: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",   // placeholder
    trails: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"     // placeholder
  };

  let container;
  let tileLayer;
  let overlayLayer;

  let centerLat = 33.7490;  // default: Atlanta
  let centerLng = -84.3880;
  let zoom = 13;
  let baseLayerKey = "street";

  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let mapOffset = { x: 0, y: 0 };

  function latToY(lat) {
    const rad = (lat * Math.PI) / 180;
    return (
      (0.5 -
        Math.log((1 + Math.sin(rad)) / (1 - Math.sin(rad))) /
          (4 * Math.PI)) *
      TILE_SIZE *
      Math.pow(2, zoom)
    );
  }

  function lngToX(lng) {
    return ((lng + 180) / 360) * TILE_SIZE * Math.pow(2, zoom);
  }

  function xToLng(x) {
    return (x / (TILE_SIZE * Math.pow(2, zoom))) * 360 - 180;
  }

  function yToLat(y) {
    const n = Math.PI - (2 * Math.PI * y) / (TILE_SIZE * Math.pow(2, zoom));
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  function getViewportSize() {
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  function getTileSourceUrl(x, y, z) {
    const template = TILE_SOURCES[baseLayerKey] || TILE_SOURCES.street;
    return template.replace("{z}", z).replace("{x}", x).replace("{y}", y);
  }

  function clearLayer(layerEl) {
    while (layerEl.firstChild) {
      layerEl.removeChild(layerEl.firstChild);
    }
  }

  function renderTiles() {
    if (!container || !tileLayer) return;

    const { width, height } = getViewportSize();

    const worldX = lngToX(centerLng);
    const worldY = latToY(centerLat);

    const topLeftX = worldX - width / 2 - mapOffset.x;
    const topLeftY = worldY - height / 2 - mapOffset.y;

    const bottomRightX = worldX + width / 2 - mapOffset.x;
    const bottomRightY = worldY + height / 2 - mapOffset.y;

    const tileSizeWorld = TILE_SIZE;
    const minTileX = Math.floor(topLeftX / tileSizeWorld);
    const maxTileX = Math.floor(bottomRightX / tileSizeWorld);
    const minTileY = Math.floor(topLeftY / tileSizeWorld);
    const maxTileY = Math.floor(bottomRightY / tileSizeWorld);

    clearLayer(tileLayer);

    const scale = Math.pow(2, zoom);

    for (let x = minTileX; x <= maxTileX; x++) {
      for (let y = minTileY; y <= maxTileY; y++) {
        const wrappedX = ((x % scale) + scale) % scale;
        if (y < 0 || y >= scale) continue;

        const img = document.createElement("img");
        img.src = getTileSourceUrl(wrappedX, y, zoom);
        img.className = "map-tile";

        const tilePx = x * tileSizeWorld - topLeftX;
        const tilePy = y * tileSizeWorld - topLeftY;

        img.style.left = `${tilePx}px`;
        img.style.top = `${tilePy}px`;
        img.width = TILE_SIZE;
        img.height = TILE_SIZE;

        tileLayer.appendChild(img);
      }
    }
  }

  function setCenter(lat, lng) {
    centerLat = lat;
    centerLng = lng;
    mapOffset.x = 0;
    mapOffset.y = 0;
    renderTiles();
  }

  function setZoom(newZoom, zoomCenterPx) {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    if (clamped === zoom) return;

    if (zoomCenterPx) {
      const { width, height } = getViewportSize();
      const dx = zoomCenterPx.x - width / 2;
      const dy = zoomCenterPx.y - height / 2;

      const worldXBefore = lngToX(centerLng) + mapOffset.x + dx;
      const worldYBefore = latToY(centerLat) + mapOffset.y + dy;

      zoom = clamped;

      const worldXAfter = lngToX(centerLng) + mapOffset.x + dx;
      const worldYAfter = latToY(centerLat) + mapOffset.y + dy;

      mapOffset.x += worldXAfter - worldXBefore;
      mapOffset.y += worldYAfter - worldYBefore;
    } else {
      zoom = clamped;
    }

    renderTiles();
  }

  function setBaseLayer(key) {
    baseLayerKey = key;
    renderTiles();
  }

  function handleMouseDown(e) {
    isDragging = true;
    dragStart.x = e.clientX;
    dragStart.y = e.clientY;
    container.classList.add("map-dragging");
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    dragStart.x = e.clientX;
    dragStart.y = e.clientY;

    mapOffset.x += dx;
    mapOffset.y += dy;

    const threshold = TILE_SIZE;
    if (Math.abs(mapOffset.x) > threshold || Math.abs(mapOffset.y) > threshold) {
      const worldX = lngToX(centerLng) - mapOffset.x;
      const worldY = latToY(centerLat) - mapOffset.y;

      centerLng = xToLng(worldX);
      centerLat = yToLat(worldY);

      mapOffset.x = 0;
      mapOffset.y = 0;
    }

    renderTiles();
  }

  function handleMouseUp() {
    isDragging = false;
    container.classList.remove("map-dragging");
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomStep = delta > 0 ? -1 : 1;

    const rect = container.getBoundingClientRect();
    const centerPx = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setZoom(zoom + zoomStep, centerPx);
  }

  function attachEvents() {
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseUp);
    container.addEventListener("wheel", handleWheel, { passive: false });

    container.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        isDragging = true;
        dragStart.x = t.clientX;
        dragStart.y = t.clientY;
        container.classList.add("map-dragging");
      }
    });

    container.addEventListener("touchmove", (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - dragStart.x;
      const dy = t.clientY - dragStart.y;

      dragStart.x = t.clientX;
      dragStart.y = t.clientY;

      mapOffset.x += dx;
      mapOffset.y += dy;

      const threshold = TILE_SIZE;
      if (Math.abs(mapOffset.x) > threshold || Math.abs(mapOffset.y) > threshold) {
        const worldX = lngToX(centerLng) - mapOffset.x;
        const worldY = latToY(centerLat) - mapOffset.y;

        centerLng = xToLng(worldX);
        centerLat = yToLat(worldY);

        mapOffset.x = 0;
        mapOffset.y = 0;
      }

      renderTiles();
    });

    container.addEventListener("touchend", () => {
      isDragging = false;
      container.classList.remove("map-dragging");
    });
  }

  function init(containerEl) {
    container = containerEl;
    if (!container) return;

    const placeholder = container.querySelector(".map-placeholder");
    if (placeholder) placeholder.remove();

    tileLayer = document.createElement("div");
    overlayLayer = document.createElement("div");
    tileLayer.className = "tile-layer";
    overlayLayer.className = "overlay-layer";

    container.appendChild(tileLayer);
    container.appendChild(overlayLayer);

    attachEvents();
    renderTiles();
  }

  return {
    init,
    setCenter,
    setZoom,
    setBaseLayer,
    getCenter: () => ({ lat: centerLat, lng: centerLng }),
    getZoom: () => zoom,
    getOverlayLayer: () => overlayLayer
  };
})();

// -------------------------------
// Map init entry point
// -------------------------------
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  mapEngine.init(mapEl);
  mapEngine.setCenter(33.7490, -84.3880); // Atlanta default
}

// -------------------------------
// Boot
// -------------------------------
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
