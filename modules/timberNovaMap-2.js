// /modules/timbernova-map2/timberNovaMap2.js
// Requires Leaflet (CDN or bundled) in the page using this module.

export function createTimberNovaMap2(options = {}) {
  const {
    containerId = 'timbernova-map2',
    defaultCenter = [33.7756, -84.3963], // Atlanta-ish
    defaultZoom = 13
  } = options;

  const map = L.map(containerId).setView(defaultCenter, defaultZoom);

  // --- BASE TILE LAYER (OpenStreetMap) ---
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  }).addTo(map);

  // --- STATE ---
  let radiusCircle = null;
  let userMarker = null;
  let addressMarker = null;

  // --- HELPERS ---

  function setRadius(centerLatLng, meters) {
    if (radiusCircle) {
      map.removeLayer(radiusCircle);
    }
    radiusCircle = L.circle(centerLatLng, {
      radius: meters,
      color: '#00ff88',
      fillColor: '#00ff88',
      fillOpacity: 0.1
    }).addTo(map);
  }

  function setUserLocation(lat, lng) {
    const latlng = [lat, lng];
    if (!userMarker) {
      userMarker = L.marker(latlng, {
        title: 'Your Location'
      }).addTo(map);
    } else {
      userMarker.setLatLng(latlng);
    }
    map.setView(latlng, 15);
  }

  function setAddressLocation(lat, lng, label = 'Job Location') {
    const latlng = [lat, lng];
    if (!addressMarker) {
      addressMarker = L.marker(latlng, {
        title: label
      }).addTo(map);
    } else {
      addressMarker.setLatLng(latlng);
    }
    map.setView(latlng, 16);
  }

  function openGoogleMapsDirections(fromLatLng, toLatLng) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${fromLatLng[0]},${fromLatLng[1]}&destination=${toLatLng[0]},${toLatLng[1]}&travelmode=driving`;
    window.open(url, '_blank');
  }

  function openAppleMapsDirections(fromLatLng, toLatLng) {
    const url = `https://maps.apple.com/?saddr=${fromLatLng[0]},${fromLatLng[1]}&daddr=${toLatLng[0]},${toLatLng[1]}&dirflg=d`;
    window.open(url, '_blank');
  }

  // --- GEOCODING (ADDRESS → COORDS) USING NOMINATIM ---
  async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    if (!data || !data.length) return null;
    const first = data[0];
    return {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      displayName: first.display_name
    };
  }

  // --- LUMBERJACK: POWERLINES & STRUCTURES (OVERPASS API) ---
  async function fetchLumberjackData(lat, lon, radiusMeters = 200) {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json];
      (
        way(around:${radiusMeters},${lat},${lon})["power"="line"];
        way(around:${radiusMeters},${lat},${lon})["building"];
      );
      out center;
    `;
    const res = await fetch(overpassUrl, {
      method: 'POST',
      body: query
    });
    const data = await res.json();
    return data;
  }

  function parseLumberjackData(osmData, centerLat, centerLon) {
    if (!osmData || !osmData.elements) return { powerlines: [], structures: [] };

    const powerlines = [];
    const structures = [];

    osmData.elements.forEach(el => {
      if (!el.center) return;
      const dLat = el.center.lat - centerLat;
      const dLon = el.center.lon - centerLon;
      const approxMeters =
        Math.sqrt(dLat * dLat + dLon * dLon) * 111320; // rough

      if (el.tags && el.tags.power === 'line') {
        powerlines.push({
          type: 'powerline',
          distanceMeters: approxMeters,
          tags: el.tags
        });
      } else if (el.tags && el.tags.building) {
        structures.push({
          type: 'structure',
          distanceMeters: approxMeters,
          tags: el.tags
        });
      }
    });

    powerlines.sort((a, b) => a.distanceMeters - b.distanceMeters);
    structures.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return { powerlines, structures };
  }

  // --- LUMBERJACK: NEARBY STORES (NOMINATIM SEARCH) ---
  async function fetchNearbyStores(lat, lon, query = 'chainsaw') {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=10&viewbox=${lon - 0.05},${lat + 0.05},${lon + 0.05},${
      lat - 0.05
    }&bounded=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    }));
  }

  // --- WEATHER HOOK (YOU CAN PLUG IN YOUR PROVIDER) ---
  async function fetchWeather(lat, lon) {
    // Placeholder: you can plug in Open-Meteo, NOAA, etc.
    // Example (Open-Meteo, no key required):
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    const data = await res.json();
    return data.current_weather || null;
  }

  // --- PUBLIC API ---

  return {
    map,

    async useMyLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setUserLocation(latitude, longitude);
        },
        err => {
          console.error(err);
          alert('Unable to get location');
        }
      );
    },

    setRadiusMeters(meters) {
      const center = map.getCenter();
      setRadius(center, meters);
    },

    async goToAddress(address) {
      const result = await geocodeAddress(address);
      if (!result) {
        alert('Address not found');
        return null;
      }
      setAddressLocation(result.lat, result.lon, result.displayName);
      return result;
    },

    async getLumberjackIntelForAddress(address) {
      const geo = await geocodeAddress(address);
      if (!geo) return null;
      setAddressLocation(geo.lat, geo.lon, geo.displayName);

      const osmData = await fetchLumberjackData(geo.lat, geo.lon, 250);
      const parsed = parseLumberjackData(osmData, geo.lat, geo.lon);

      const storesChainsaw = await fetchNearbyStores(
        geo.lat,
        geo.lon,
        'chainsaw'
      );
      const storesRope = await fetchNearbyStores(geo.lat, geo.lon, 'rope');
      const storesTree = await fetchNearbyStores(
        geo.lat,
        geo.lon,
        'tree service equipment'
      );

      return {
        address: geo.displayName,
        center: { lat: geo.lat, lon: geo.lon },
        powerlines: parsed.powerlines,
        structures: parsed.structures,
        stores: {
          chainsaw: storesChainsaw,
          rope: storesRope,
          tree: storesTree
        }
      };
    },

    async getWeatherAtCenter() {
      const c = map.getCenter();
      return await fetchWeather(c.lat, c.lng);
    },

    openDirectionsToAddressInGoogleMaps(fromLatLng, toLatLng) {
      openGoogleMapsDirections(fromLatLng, toLatLng);
    },

    openDirectionsToAddressInAppleMaps(fromLatLng, toLatLng) {
      openAppleMapsDirections(fromLatLng, toLatLng);
    }
  };
}
