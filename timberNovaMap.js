// timberNovaMap.js
export const timberNovaMap = {
  id: "timber-nova-worker-map",
  width: 256,
  height: 256,
  tileSize: 4, // 4px per meter for visibility
  meta: {
    orientation: "north-up",
    style: "top-down-blueprint",
    oshaSafe: true
  },
  layers: {
    terrain: [
      {
        id: "forest_high_density",
        type: "forest",
        density: "heavy",
        area: { x: 0, y: 0, w: 256, h: 64 }
      },
      {
        id: "mid_slope_cut_zone",
        type: "cut_zone",
        density: "medium",
        area: { x: 0, y: 64, w: 256, h: 64 }
      },
      {
        id: "valley_floor",
        type: "operations_ground",
        surface: "compacted_soil",
        area: { x: 0, y: 128, w: 256, h: 64 }
      },
      {
        id: "base_camp",
        type: "base",
        surface: "gravel",
        area: { x: 0, y: 192, w: 256, h: 64 }
      }
    ],
    elevation: [
      { area: { x: 0, y: 0, w: 256, h: 64 }, height: 4 },
      { area: { x: 0, y: 64, w: 256, h: 64 }, height: 3 },
      { area: { x: 0, y: 128, w: 256, h: 64 }, height: 2 },
      { area: { x: 0, y: 192, w: 256, h: 64 }, height: 1 }
    ],
    zones: [
      {
        id: "zone_high_ridge_forest",
        label: "High Ridge Forest",
        type: "restricted",
        area: { x: 0, y: 0, w: 256, h: 64 }
      },
      {
        id: "zone_mid_slope_cutting",
        label: "Mid-Slope Cutting Zone",
        type: "cutting",
        blocks: [
          { blockId: "cut_block_1", area: { x: 16, y: 72, w: 64, h: 40 } },
          { blockId: "cut_block_2", area: { x: 96, y: 72, w: 64, h: 40 } }
        ]
      },
      {
        id: "zone_valley_operations",
        label: "Valley Floor Operations",
        type: "operations",
        subzones: [
          { id: "log_deck", area: { x: 32, y: 140, w: 64, h: 24 } },
          { id: "loader_staging", area: { x: 112, y: 140, w: 48, h: 24 } },
          { id: "truck_loading_bay", area: { x: 176, y: 140, w: 64, h: 24 } }
        ]
      },
      {
        id: "zone_base_camp",
        label: "Base Camp",
        type: "support",
        subzones: [
          { id: "parking", area: { x: 16, y: 204, w: 64, h: 24 } },
          { id: "check_in", area: { x: 96, y: 204, w: 32, h: 16 } },
          { id: "first_aid", area: { x: 136, y: 204, w: 24, h: 16 } },
          { id: "fuel_depot", area: { x: 168, y: 204, w: 32, h: 16 } },
          { id: "ppe_checkpoint", area: { x: 112, y: 224, w: 32, h: 16 } }
        ]
      }
    ],
    paths: [
      {
        id: "worker_path_base_to_cut_zone",
        type: "worker",
        safe: true,
        points: [
          { x: 128, y: 220 },
          { x: 128, y: 180 },
          { x: 128, y: 140 },
          { x: 128, y: 100 }
        ]
      },
      {
        id: "skidder_loop_mid_to_valley",
        type: "machine",
        direction: "one-way",
        points: [
          { x: 64, y: 100 },
          { x: 80, y: 120 },
          { x: 96, y: 140 },
          { x: 80, y: 160 },
          { x: 64, y: 140 },
          { x: 64, y: 100 }
        ]
      },
      {
        id: "truck_route",
        type: "machine",
        vehicle: "log_truck",
        points: [
          { x: 220, y: 256 },
          { x: 220, y: 180 },
          { x: 200, y: 150 },
          { x: 220, y: 180 },
          { x: 220, y: 256 }
        ]
      }
    ],
    hazards: [
      {
        id: "falling_trees_zone",
        type: "falling_objects",
        area: { x: 16, y: 72, w: 64, h: 40 },
        label: "Falling Trees",
        severity: "high"
      },
      {
        id: "slope_hazard_mid_slope",
        type: "slope",
        area: { x: 0, y: 64, w: 256, h: 16 },
        label: "Steep Slope",
        severity: "medium"
      },
      {
        id: "noise_zone_operations",
        type: "noise",
        area: { x: 32, y: 140, w: 144, h: 24 },
        label: "High Noise Area",
        severity: "medium"
      },
      {
        id: "muster_point",
        type: "emergency_muster",
        point: { x: 40, y: 220 },
        label: "Emergency Muster Point"
      },
      {
        id: "first_aid_station",
        type: "first_aid",
        point: { x: 148, y: 212 },
        label: "First Aid / AED"
      }
    ],
    entities: [
      {
        id: "worker_1",
        type: "worker",
        icon: "osha_pictogram",
        ppe: ["helmet", "vest", "boots"],
        position: { x: 128, y: 220 },
        assignedZone: "zone_mid_slope_cutting"
      },
      {
        id: "skidder_1",
        type: "machine",
        machineType: "skidder",
        position: { x: 64, y: 100 },
        pathId: "skidder_loop_mid_to_valley"
      },
      {
        id: "loader_1",
        type: "machine",
        machineType: "loader",
        position: { x: 120, y: 144 },
        zoneId: "log_deck"
      },
      {
        id: "sign_ppe_required",
        type: "sign",
        signType: "ppe_required",
        position: { x: 112, y: 224 },
        label: "PPE Required Beyond This Point"
      }
    ]
  }
};
