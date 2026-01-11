// ============================================================
// TIMBER NOVA – APP JS (FULL ENGINE)
// ============================================================

// -------------------------------
// Leaf animation init
// -------------------------------
function setupLeaves() {
  const leafContainer = document.getElementById("leaf-container");
  if (!leafContainer) return;

  const LEAF_COUNT = 40;
  for (let i = 0; i < LEAF_COUNT; i++) {
    const leaf = document.createElement("div");
    leaf.className = "leaf";
    leaf.style.left = Math.random() * 100 + "vw";
    leaf.style.animationDelay = Math.random() * 5 + "s";
    leaf.style.opacity = 0.5 + Math.random() * 0.5;
    leafContainer.appendChild(leaf);
  }
}

// ============================================================
// UI WIRING
// ============================================================

// Smooth scroll for nav + buttons
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
        panel.classList.toggle("active", "#" + panel.id === target);
      });
    });
  });
}

// Tree Theme toggle
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

// Weather layer controls
function setupWeatherLayerControls() {
  const controlsContainer = document.getElementById("weather-controls");
  if (controlsContainer) {
    controlsContainer.innerHTML = `
      <div class="toolbar-group">
        <span class="toolbar-title">Weather</span>
        <label><input type="checkbox" data-weather-layer="radar"> Radar</label>
        <label><input type="checkbox" data-weather-layer="wind"> Wind</label>
        <label><input type="checkbox" data-weather-layer="storms"> Storms</label>
        <label><input type="checkbox" data-weather-layer="temperature"> Temp</label>
      </div>
    `;
  }

  const weatherCheckboxes = document.querySelectorAll(
    "#weather-controls input[type='checkbox'][data-weather-layer]"
  );

  weatherCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const layer = checkbox.getAttribute("data-weather-layer");
      const enabled = checkbox.checked;

      weatherOverlayEngine.setLayerEnabled(layer, enabled);
      console.log("Weather layer toggle:", layer, "->", enabled);
    });
  });
}

// Base map layer controls
function setupBaseLayerControls() {
  const controlsContainer = document.getElementById("layer-controls");
  if (controlsContainer) {
    controlsContainer.innerHTML = `
      <div class="toolbar-group">
        <span class="toolbar-title">Map</span>
        <label><input type="radio" name="base-layer" value="street" checked> Street</label>
        <label><input type="radio" name="base-layer" value="satellite"> Satellite</label>
        <label><input type="radio" name="base-layer" value="terrain"> Terrain</label>
        <label><input type="radio" name="base-layer" value="trails"> Trails</label>
        <label class="tree-theme-toggle">
          <input type="checkbox" id="tree-theme-toggle"> Tree Theme
        </label>
      </div>
    `;
  }

  const radios = document.querySelectorAll("input[name='base-layer']");
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      const value = radio.value;

      mapEngine.setBaseLayer(value);
      console.log("Base map layer changed to:", value);
    });
  });

  // re-bind tree theme toggle because we recreated it in the DOM
  setupTreeThemeToggle();
}

// Weather Center → Map integration
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

    lastWeatherLocation = {
      query
      // later: lat, lng, etc.
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

    console.log("View on Map for location:", lastWeatherLocation);
  });
}

// Client View wiring (uses Job View engine)
function setupClientView() {
  const showBtn = document.getElementById("show-job-view-btn");
  const clearBtn = document.getElementById("clear-job-view-btn");

  if (!showBtn || !clearBtn) return;

  showBtn.addEventListener("click", async () => {
    const name = (document.getElementById("client-name")?.value || "").trim();
    const address = (document.getElementById("client-address")?.value || "").trim();
    const notes = (document.getElementById("client-notes")?.value || "").trim();

    if (!address) return;

    await jobViewEngine.showJobView({
      name,
      address,
      notes,
      radiusMeters: 100,
      enableWeather: true,
      enableRoute: true
    });
  });

  clearBtn.addEventListener("click", () => {
    jobViewEngine.clearJobView();
  });
}

// Supply Finder wiring (Store engine + markers)
function setupSupplyFinder() {
  const btn = document.getElementById("find-supplies-btn");
  const queryInput = document.getElementById("supply-query");
  const resultsEl = document.getElementById("supply-results");

  if (!btn || !queryInput || !resultsEl) return;

  btn.addEventListener("click", () => {
    const query = queryInput.value.trim();
    if (!query) return;

    const center = mapEngine.getCenter();
    const stores = storeEngine.searchStores(query, center.lat, center.lng);

    markerEngine.clearStoreMarkers();

    if (!stores.length) {
      resultsEl.innerHTML = `<div>No nearby stores found for "<strong>${query}</strong>".</div>`;
      return;
    }

    const htmlParts = [];
    stores.forEach((store) => {
      const miles = (store.distanceKm * 0.621371).toFixed(1);
      htmlParts.push(
        `<div class="store-result">
          <strong>${store.name}</strong> — ${miles} mi
        </div>`
      );
      markerEngine.addStoreMarker(store.lat, store.lng, { name: store.name, label: store.name });
    });

    resultsEl.innerHTML = htmlParts.join("");
  });
}

// Equipment & Parts Finder wiring
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

    const parts = partsEngine.findParts(type, brand, model);

    if (!parts.length) {
      resultsEl.innerHTML = `
        <div>No matching parts found for <strong>${brand} ${model}</strong> (${type}).</div>
        <div>Add this combo to the catalog when you wire a real parts DB.</div>
      `;
      return;
    }

    const html = parts
      .map(
        (p) => `
        <div class="part-result">
          <strong>${p.code}</strong> — ${p.name}
        </div>
      `
      )
      .join("");

    resultsEl.innerHTML = html;
  });
}

// ============================================================
// ENGINES
// ============================================================

// -------------------------------
// Tile Source Engine
// -------------------------------
const tileSourceEngine = (() => {
  const sources = {
    street: {
      name: "Street",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    },
    satellite: {
      name: "Satellite",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png" // placeholder
    },
    terrain: {
      name: "Terrain",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    },
    trails: {
      name: "Trails",
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    }
  };

  function getUrlTemplate(key) {
    return (sources[key] && sources[key].url) || sources.street.url;
  }

  function listSources() {
    return sources;
  }

  return {
    getUrlTemplate,
    listSources
  };
})();

// -------------------------------
// Geocoding Engine (mockable)
// -------------------------------
const geocodeEngine = (() => {
  async function geocodeAddress(address) {
    console.log("Geocoding address:", address);

    if (/atlanta/i.test(address)) {
      return { lat: 33.749, lng: -84.388 };
    }

    const baseLat = 33.749;
    const baseLng = -84.388;
    const jitter = () => (Math.random() - 0.5) * 0.1;

    return {
      lat: baseLat + jitter(),
      lng: baseLng + jitter()
    };
  }

  return {
    geocodeAddress
  };
})();

// -------------------------------
// Map Engine (Web Mercator tiles)
// -------------------------------
const mapEngine = (() => {
  const TILE_SIZE = 256;
  const MIN_ZOOM = 2;
  const MAX_ZOOM = 20;

  let container;
  let tileLayer;
  let overlayLayer;

  let centerLat = 33.749;  // default: Atlanta
  let centerLng = -84.388;
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
    const template = tileSourceEngine.getUrlTemplate(baseLayerKey);
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

    if (typeof markerEngine !== "undefined" && markerEngine.repositionAll) {
      markerEngine.repositionAll();
    }
    if (typeof routeEngine !== "undefined" && routeEngine.onMapChanged) {
      routeEngine.onMapChanged();
    }
    if (typeof weatherOverlayEngine !== "undefined" && weatherOverlayEngine.onMapChanged) {
      weatherOverlayEngine.onMapChanged();
    }
    if (typeof radiusToolEngine !== "undefined" && radiusToolEngine.onMapChanged) {
      radiusToolEngine.onMapChanged();
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
// Marker Engine
// -------------------------------
const markerEngine = (() => {
  let overlayLayer = null;
  const markers = [];

  function init() {
    overlayLayer = mapEngine.getOverlayLayer();
    if (!overlayLayer) return;
  }

  function latLngToPixel(lat, lng) {
    const center = mapEngine.getCenter();
    const zoom = mapEngine.getZoom();
    const TILE_SIZE = 256;
    const scale = Math.pow(2, zoom);

    function lngToX(lngVal) {
      return ((lngVal + 180) / 360) * TILE_SIZE * scale;
    }

    function latToY(latVal) {
      const rad = (latVal * Math.PI) / 180;
      return (
        (0.5 -
          Math.log((1 + Math.sin(rad)) / (1 - Math.sin(rad))) /
            (4 * Math.PI)) *
        TILE_SIZE *
        scale
      );
    }

    const centerX = lngToX(center.lng);
    const centerY = latToY(center.lat);

    const mapRect = overlayLayer.getBoundingClientRect();
    const worldX = lngToX(lng);
    const worldY = latToY(lat);

    const dx = worldX - centerX;
    const dy = worldY - centerY;

    const x = mapRect.width / 2 + dx;
    const y = mapRect.height / 2 + dy;

    return { x, y };
  }

  function createMarkerElement(type, meta) {
    const el = document.createElement("div");
    el.className = `marker marker-${type}`;
    el.title =
      (meta && meta.name) ||
      (meta && meta.address) ||
      (meta && meta.label) ||
      "";

    const inner = document.createElement("div");
    inner.className = "marker-inner";
    el.appendChild(inner);

    return el;
  }

  function addMarker(lat, lng, type, meta = {}) {
    if (!overlayLayer) init();
    if (!overlayLayer) return;

    const el = createMarkerElement(type, meta);
    overlayLayer.appendChild(el);

    const marker = { lat, lng, type, meta, el };
    markers.push(marker);

    positionMarker(marker);
    return marker;
  }

  function positionMarker(marker) {
    if (!overlayLayer) return;
    const { x, y } = latLngToPixel(marker.lat, marker.lng);
    marker.el.style.left = `${x}px`;
    marker.el.style.top = `${y}px`;
  }

  function repositionAll() {
    markers.forEach(positionMarker);
  }

  function clearByType(type) {
    if (!overlayLayer) return;
    for (let i = markers.length - 1; i >= 0; i--) {
      if (markers[i].type === type) {
        overlayLayer.removeChild(markers[i].el);
        markers.splice(i, 1);
      }
    }
  }

  function clearJobMarker() {
    clearByType("job");
  }

  function clearStoreMarkers() {
    clearByType("store");
  }

  function addJobMarker(lat, lng, meta) {
    return addMarker(lat, lng, "job", meta);
  }

  function addStoreMarker(lat, lng, meta) {
    return addMarker(lat, lng, "store", meta);
  }

  return {
    init,
    addJobMarker,
    clearJobMarker,
    addStoreMarker,
    clearStoreMarkers,
    repositionAll
  };
})();

// -------------------------------
// Route Engine
// -------------------------------
const routeEngine = (() => {
  let overlayLayer = null;
  let routeEl = null;
  let pathPoints = [];

  function init() {
    overlayLayer = mapEngine.getOverlayLayer();
    if (!overlayLayer) return;

    routeEl = document.createElement("canvas");
    routeEl.className = "route-canvas";
    overlayLayer.appendChild(routeEl);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!overlayLayer || !routeEl) return;
    const rect = overlayLayer.getBoundingClientRect();
    routeEl.width = rect.width;
    routeEl.height = rect.height;
    drawRoute();
  }

  function setRoute(fromLat, fromLng, toLat, toLng) {
    if (!overlayLayer) init();
    pathPoints = [
      { lat: fromLat, lng: fromLng },
      { lat: toLat, lng: toLng }
    ];
    drawRoute();
  }

  function clearRoute() {
    pathPoints = [];
    drawRoute();
  }

  function drawRoute() {
    if (!routeEl) return;
    const ctx = routeEl.getContext("2d");
    const rect = overlayLayer.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (pathPoints.length < 2) return;

    const pixelPoints = pathPoints.map((p) => {
      const { x, y } = latLngToPixelForRoute(p.lat, p.lng);
      return { x, y };
    });

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(151, 216, 114, 0.9)";
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(pixelPoints[0].x, pixelPoints[0].y);
    ctx.lineTo(pixelPoints[1].x, pixelPoints[1].y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function latLngToPixelForRoute(lat, lng) {
    const center = mapEngine.getCenter();
    const zoom = mapEngine.getZoom();
    const TILE_SIZE = 256;
    const scale = Math.pow(2, zoom);

    function lngToX(lngVal) {
      return ((lngVal + 180) / 360) * TILE_SIZE * scale;
    }
    function latToY(latVal) {
      const rad = (latVal * Math.PI) / 180;
      return (
        (0.5 -
          Math.log((1 + Math.sin(rad)) / (1 - Math.sin(rad))) /
            (4 * Math.PI)) *
        TILE_SIZE *
        scale
      );
    }

    const centerX = lngToX(center.lng);
    const centerY = latToY(center.lat);
    const mapRect = overlayLayer.getBoundingClientRect();

    const worldX = lngToX(lng);
    const worldY = latToY(lat);
    const dx = worldX - centerX;
    const dy = worldY - centerY;

    return {
      x: mapRect.width / 2 + dx,
      y: mapRect.height / 2 + dy
    };
  }

  function onMapChanged() {
    drawRoute();
  }

  return {
    init,
    setRoute,
    clearRoute,
    onMapChanged
  };
})();

// -------------------------------
// Weather Overlay Engine
// -------------------------------
const weatherOverlayEngine = (() => {
  let overlayLayer = null;
  let canvas = null;
  let ctx = null;
  const activeLayers = new Set();

  function init() {
    overlayLayer = mapEngine.getOverlayLayer();
    if (!overlayLayer) return;

    canvas = document.createElement("canvas");
    canvas.className = "weather-canvas";
    overlayLayer.appendChild(canvas);
    ctx = canvas.getContext("2d");

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas || !overlayLayer) return;
    const rect = overlayLayer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    render();
  }

  function setLayerEnabled(layer, enabled) {
    if (enabled) {
      activeLayers.add(layer);
    } else {
      activeLayers.delete(layer);
    }
    render();
  }

  function render() {
    if (!ctx || !canvas || !overlayLayer) return;
    const rect = overlayLayer.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (activeLayers.size === 0) return;

    const center = {
      x: rect.width / 2,
      y: rect.height / 2
    };

    if (activeLayers.has("radar")) {
      const gradient = ctx.createRadialGradient(
        center.x,
        center.y,
        0,
        center.x,
        center.y,
        Math.min(rect.width, rect.height) / 2
      );
      gradient.addColorStop(0, "rgba(52, 152, 219, 0.25)");
      gradient.addColorStop(1, "rgba(52, 152, 219, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center.x, center.y, rect.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (activeLayers.has("wind")) {
      ctx.strokeStyle = "rgba(231, 76, 60, 0.6)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) {
        const y = (rect.height / 40) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y + 10 * Math.sin(i));
        ctx.stroke();
      }
    }

    if (activeLayers.has("storms")) {
      ctx.strokeStyle = "rgba(155, 89, 182, 0.8)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, rect.height / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (activeLayers.has("temperature")) {
      const grad = ctx.createLinearGradient(0, 0, 0, rect.height);
      grad.addColorStop(0, "rgba(231, 76, 60, 0.25)");
      grad.addColorStop(1, "rgba(52, 152, 219, 0.25)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }

  function onMapChanged() {
    render();
  }

  return {
    init,
    setLayerEnabled,
    onMapChanged
  };
})();

// -------------------------------
// Radius Tool Engine
// -------------------------------
const radiusToolEngine = (() => {
  let overlayLayer = null;
  let canvas = null;
  let ctx = null;
  let centerLatLng = null;
  let radiusMeters = 0;

  function init() {
    overlayLayer = mapEngine.getOverlayLayer();
    if (!overlayLayer) return;

    canvas = document.createElement("canvas");
    canvas.className = "radius-canvas";
    overlayLayer.appendChild(canvas);
    ctx = canvas.getContext("2d");

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas || !overlayLayer) return;
    const rect = overlayLayer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    render();
  }

  function setRadius(lat, lng, meters) {
    centerLatLng = { lat, lng };
    radiusMeters = meters;
    render();
  }

  function clearRadius() {
    centerLatLng = null;
    radiusMeters = 0;
    render();
  }

  function render() {
    if (!ctx || !canvas || !overlayLayer) return;
    const rect = overlayLayer.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!centerLatLng || radiusMeters <= 0) return;

    const centerPixel = latLngToPixel(centerLatLng.lat, centerLatLng.lng);
    const edgePixel = latLngToPixel(
      centerLatLng.lat + metersToLatDelta(radiusMeters),
      centerLatLng.lng
    );

    const pxRadius = Math.hypot(edgePixel.x - centerPixel.x, edgePixel.y - centerPixel.y);

    ctx.beginPath();
    ctx.arc(centerPixel.x, centerPixel.y, pxRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(151, 216, 114, 0.15)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(151, 216, 114, 0.85)";
    ctx.stroke();
  }

  function latLngToPixel(lat, lng) {
    const center = mapEngine.getCenter();
    const zoom = mapEngine.getZoom();
    const TILE_SIZE = 256;
    const scale = Math.pow(2, zoom);

    function lngToX(lngVal) {
      return ((lngVal + 180) / 360) * TILE_SIZE * scale;
    }
    function latToY(latVal) {
      const rad = (latVal * Math.PI) / 180;
      return (
        (0.5 -
          Math.log((1 + Math.sin(rad)) / (1 - Math.sin(rad))) /
            (4 * Math.PI)) *
        TILE_SIZE *
        scale
      );
    }

    const centerX = lngToX(center.lng);
    const centerY = latToY(center.lat);
    const mapRect = overlayLayer.getBoundingClientRect();

    const worldX = lngToX(lng);
    const worldY = latToY(lat);
    const dx = worldX - centerX;
    const dy = worldY - centerY;

    return {
      x: mapRect.width / 2 + dx,
      y: mapRect.height / 2 + dy
    };
  }

  function metersToLatDelta(meters) {
    const earthRadius = 6378137;
    return (meters / earthRadius) * (180 / Math.PI);
  }

  function onMapChanged() {
    render();
  }

  return {
    init,
    setRadius,
    clearRadius,
    onMapChanged
  };
})();

// -------------------------------
// Store / Supply Finder Engine
// -------------------------------
const storeEngine = (() => {
  const stores = [
    {
      id: 1,
      name: "TreePro Supplies",
      lat: 33.76,
      lng: -84.4,
      items: ["bar oil", "helmet", "rope", "saw chain"]
    },
    {
      id: 2,
      name: "Arbor Gear ATL",
      lat: 33.74,
      lng: -84.36,
      items: ["rigging rope", "saddle", "helmet", "lanyard"]
    },
    {
      id: 3,
      name: "Climber's Corner",
      lat: 33.73,
      lng: -84.42,
      items: ["saw chain", "bar", "files", "chaps"]
    }
  ];

  function toRad(val) {
    return (val * Math.PI) / 180;
  }

  function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function searchStores(query, centerLat, centerLng) {
    const q = query.toLowerCase();
    const results = [];

    for (const store of stores) {
      const hasItem = store.items.some((item) => item.toLowerCase().includes(q));
      if (!hasItem) continue;

      const distKm = distanceKm(centerLat, centerLng, store.lat, store.lng);
      results.push({
        ...store,
        distanceKm: distKm
      });
    }

    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return results;
  }

  return {
    searchStores
  };
})();

// -------------------------------
// Parts Finder Engine
// -------------------------------
const partsEngine = (() => {
  const partsCatalog = [
    {
      type: "chainsaw",
      brand: "stihl",
      model: "ms 362",
      parts: [
        { code: "CH-18-325", name: '18" .325 Chain' },
        { code: "BR-18-STIHL", name: '18" Bar' },
        { code: "AF-STIHL-01", name: "Air Filter" }
      ]
    },
    {
      type: "chainsaw",
      brand: "husqvarna",
      model: "372xp",
      parts: [
        { code: "CH-20-38", name: '20" 3/8 Chain' },
        { code: "BR-20-HUSQ", name: '20" Bar' },
        { code: "AF-HUSQ-01", name: "Air Filter" }
      ]
    }
  ];

  function normalize(text) {
    return text.trim().toLowerCase();
  }

  function findParts(type, brand, model) {
    const t = normalize(type);
    const b = normalize(brand);
    const m = normalize(model);

    const entry = partsCatalog.find(
      (item) => item.type === t && item.brand === b && item.model === m
    );

    if (!entry) return [];
    return entry.parts;
  }

  return {
    findParts
  };
})();

// -------------------------------
// Job View Engine
// -------------------------------
const jobViewEngine = (() => {
  async function showJobView({
    name,
    address,
    notes,
    radiusMeters = 0,
    enableWeather = true,
    enableRoute = false
  }) {
    if (!address) return;

    const { lat, lng } = await geocodeEngine.geocodeAddress(address);

    mapEngine.setCenter(lat, lng);

    markerEngine.clearJobMarker();
    markerEngine.addJobMarker(lat, lng, { name, address, notes });

    if (radiusMeters > 0) {
      radiusToolEngine.setRadius(lat, lng, radiusMeters);
    } else {
      radiusToolEngine.clearRadius();
    }

    if (enableWeather) {
      weatherOverlayEngine.setLayerEnabled("radar", true);
    }

    if (enableRoute) {
      const currentCenter = mapEngine.getCenter();
      routeEngine.setRoute(currentCenter.lat, currentCenter.lng, lat, lng);
    } else {
      routeEngine.clearRoute();
    }

    console.log("Job View applied:", { lat, lng, name, address, notes });
  }

  function clearJobView() {
    markerEngine.clearJobMarker();
    routeEngine.clearRoute();
    radiusToolEngine.clearRadius();
  }

  return {
    showJobView,
    clearJobView
  };
})();

// ============================================================
// Map init entry point
// ============================================================
function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  mapEngine.init(mapEl);
  mapEngine.setCenter(33.749, -84.388); // Atlanta default
}

// ============================================================
// Boot
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  setupLeaves();
  setupScrollLinks();
  setupPanelTabs();
  setupWeatherLayerControls();
  setupBaseLayerControls();
  setupWeatherCenterIntegration();
  setupClientView();
  setupSupplyFinder();
  setupEquipmentFinder();
  initMap();
  markerEngine.init();
  routeEngine.init();
  weatherOverlayEngine.init();
  radiusToolEngine.init();
});
