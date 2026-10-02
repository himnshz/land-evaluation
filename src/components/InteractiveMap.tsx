import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  SiteBoundary,
  ElevationProfile,
  HydrologyData,
  Finding,
  LatLng
} from '../types/site';
import { calculatePolygonMetrics, computePolygonCentroid } from '../utils/geometry';
import {
  Layers,
  MapPin,
  Compass,
  Crosshair,
  Droplets,
  Mountain,
  Edit3,
  Plus,
  Trash2,
  Undo2,
  Check,
  X,
  Maximize2,
  Square,
  HelpCircle,
  Move
} from 'lucide-react';

interface Props {
  boundary: SiteBoundary | null;
  elevation?: ElevationProfile | null;
  hydrology?: HydrologyData | null;
  findings?: Finding[];
  selectedFindingId?: string | null;
  onSelectFinding?: (findingId: string) => void;
  isDrawingMode?: boolean;
  onBoundaryUpdate?: (coords: [number, number][], center: LatLng) => void;
  onFinishEditing?: () => void;
  center?: LatLng;
}

export type BaseMapLayerType = 'satellite' | 'street' | 'topo' | 'dark';
export type EditSubMode = 'drag_vertices' | 'draw_freehand';

export const InteractiveMap: React.FC<Props> = ({
  boundary,
  elevation,
  hydrology,
  findings = [],
  selectedFindingId,
  onSelectFinding,
  isDrawingMode = false,
  onBoundaryUpdate,
  onFinishEditing,
  center = { lat: 30.2742, lng: -97.8015 }
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs
  const baseLayersRef = useRef<{ [key in BaseMapLayerType]?: L.TileLayer }>({});
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const drawingPolylineRef = useRef<L.Polyline | null>(null);
  const drawingPolygonRef = useRef<L.Polygon | null>(null);
  const gridMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const hydroLayerRef = useRef<L.LayerGroup | null>(null);
  const findingMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const vertexMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const midpointMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const drawingMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // Map state
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseMapLayerType>('satellite');
  const [showSlopeOverlay, setShowSlopeOverlay] = useState(true);
  const [showHydroOverlay, setShowHydroOverlay] = useState(true);
  const [showFindingMarkers, setShowFindingMarkers] = useState(true);

  // Edit sub-mode: 'drag_vertices' (move/add/delete existing) vs 'draw_freehand' (click map point by point)
  const [editMode, setEditMode] = useState<EditSubMode>('drag_vertices');
  const [freehandPoints, setFreehandPoints] = useState<[number, number][]>([]);

  // Live coordinates and dragging feedback
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(16);
  const [liveMetrics, setLiveMetrics] = useState<{ areaAcres: number; areaSqM: number; perimeterM: number } | null>(null);

  // Ref to hold current coordinates while dragging
  const currentCoordsRef = useRef<[number, number][]>(boundary?.coordinates || []);

  // Sync ref with incoming boundary
  useEffect(() => {
    if (boundary?.coordinates) {
      currentCoordsRef.current = [...boundary.coordinates];
      setLiveMetrics({
        areaAcres: boundary.areaAcres,
        areaSqM: boundary.areaSquareMeters,
        perimeterM: boundary.perimeterMeters
      });
    }
  }, [boundary]);

  // Keep latest props in refs to avoid stale closures in map events
  const isDrawingModeRef = useRef(isDrawingMode);
  isDrawingModeRef.current = isDrawingMode;

  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;

  const onBoundaryUpdateRef = useRef(onBoundaryUpdate);
  onBoundaryUpdateRef.current = onBoundaryUpdate;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = boundary?.center.lat || center.lat;
    const initialLng = boundary?.center.lng || center.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Create Tile Layers
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19 }
    );

    const topoLayer = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { maxZoom: 17 }
    );

    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    );

    baseLayersRef.current = {
      satellite: satelliteLayer,
      street: streetLayer,
      topo: topoLayer,
      dark: darkLayer
    };

    satelliteLayer.addTo(map);

    // Create Overlays layer groups
    gridMarkersLayerRef.current = L.layerGroup().addTo(map);
    hydroLayerRef.current = L.layerGroup().addTo(map);
    findingMarkersLayerRef.current = L.layerGroup().addTo(map);
    vertexMarkersLayerRef.current = L.layerGroup().addTo(map);
    midpointMarkersLayerRef.current = L.layerGroup().addTo(map);
    drawingMarkersLayerRef.current = L.layerGroup().addTo(map);

    // Mouse coordinates tracker
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Math.round(e.latlng.lat * 100000) / 100000,
        lng: Math.round(e.latlng.lng * 100000) / 100000
      });
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    // Handle Map Click for Freehand Drawing
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isDrawingModeRef.current && editModeRef.current === 'draw_freehand') {
        const newPt: [number, number] = [
          Math.round(e.latlng.lat * 100000) / 100000,
          Math.round(e.latlng.lng * 100000) / 100000
        ];
        setFreehandPoints((prev) => [...prev, newPt]);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.entries(baseLayersRef.current).forEach(([key, layer]) => {
      if (layer) {
        if (key === activeBaseLayer) {
          if (!map.hasLayer(layer)) layer.addTo(map);
        } else {
          if (map.hasLayer(layer)) map.removeLayer(layer);
        }
      }
    });
  }, [activeBaseLayer]);

  // Redraw Boundary Polygon
  const redrawPolygon = useCallback((coords: [number, number][]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (coords.length >= 3) {
      const polygon = L.polygon(coords, {
        color: '#f59e0b',
        weight: 3,
        opacity: 0.95,
        fillColor: '#d97706',
        fillOpacity: 0.22,
        dashArray: isDrawingMode ? '6, 6' : undefined
      }).addTo(map);

      polygonLayerRef.current = polygon;
    }
  }, [isDrawingMode]);

  // Render Polygon and Handles when boundary or drawing mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !boundary) return;

    const coords = currentCoordsRef.current;
    redrawPolygon(coords);

    // Initial fit bounds when not in editing mode
    if (!isDrawingMode && coords.length >= 3) {
      const poly = L.polygon(coords);
      map.fitBounds(poly.getBounds(), { padding: [60, 60], maxZoom: 18 });
    }
  }, [boundary, isDrawingMode, redrawPolygon]);

  // Create Interactive Draggable Vertex & Midpoint Handles in 'drag_vertices' edit mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !vertexMarkersLayerRef.current || !midpointMarkersLayerRef.current) return;

    vertexMarkersLayerRef.current.clearLayers();
    midpointMarkersLayerRef.current.clearLayers();

    if (!isDrawingMode || editMode !== 'drag_vertices') return;

    const coords = currentCoordsRef.current;
    if (coords.length < 3) return;

    // 1. DRAGGABLE VERTEX MARKERS
    coords.forEach((coord, idx) => {
      // Custom stylish draggable vertex icon
      const vertexIcon = L.divIcon({
        className: 'custom-vertex-marker',
        html: `
          <div style="
            width: 18px;
            height: 18px;
            background: #f59e0b;
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            color: #000;
            font-family: monospace;
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker(coord, {
        draggable: true,
        icon: vertexIcon,
        zIndexOffset: 1000
      });

      // DRAG EVENT: Live polygon redraw as user drags!
      marker.on('drag', (e: L.LeafletEvent) => {
        const latlng = (e.target as L.Marker).getLatLng();
        const updated = [...currentCoordsRef.current];
        updated[idx] = [latlng.lat, latlng.lng];
        currentCoordsRef.current = updated;

        // Live update the polygon line on screen
        if (polygonLayerRef.current) {
          polygonLayerRef.current.setLatLngs(updated);
        }

        // Live update metrics HUD
        const metrics = calculatePolygonMetrics(updated);
        setLiveMetrics({
          areaAcres: metrics.areaAcres,
          areaSqM: metrics.areaSquareMeters,
          perimeterM: metrics.perimeterMeters
        });
      });

      // DRAGEND EVENT: Commit new coordinates
      marker.on('dragend', () => {
        const finalCoords = currentCoordsRef.current.map(([lat, lng]) => [
          Math.round(lat * 100000) / 100000,
          Math.round(lng * 100000) / 100000
        ] as [number, number]);

        currentCoordsRef.current = finalCoords;
        const newCenter = computePolygonCentroid(finalCoords);
        if (onBoundaryUpdateRef.current) {
          onBoundaryUpdateRef.current(finalCoords, newCenter);
        }
      });

      // Click to delete vertex if > 3 vertices exist
      marker.on('click', () => {
        if (currentCoordsRef.current.length > 3) {
          const filtered = currentCoordsRef.current.filter((_, i) => i !== idx);
          currentCoordsRef.current = filtered;
          const newCenter = computePolygonCentroid(filtered);
          if (onBoundaryUpdateRef.current) {
            onBoundaryUpdateRef.current(filtered, newCenter);
          }
        }
      });

      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <strong>Vertex ${idx + 1}</strong><br/>
          Drag to move freely<br/>
          ${coords.length > 3 ? '<span style="color:#f87171">Click to remove vertex</span>' : ''}
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      vertexMarkersLayerRef.current?.addLayer(marker);
    });

    // 2. MIDPOINT INSERTION HANDLES (Between Vertex i and i+1)
    coords.forEach((p1, idx) => {
      const p2 = coords[(idx + 1) % coords.length];
      const midLat = (p1[0] + p2[0]) / 2;
      const midLng = (p1[1] + p2[1]) / 2;

      const midIcon = L.divIcon({
        className: 'custom-midpoint-marker',
        html: `
          <div style="
            width: 14px;
            height: 14px;
            background: #ffffff;
            border: 2px solid #f59e0b;
            border-radius: 50%;
            box-shadow: 0 1px 5px rgba(0,0,0,0.5);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: #d97706;
          ">
            +
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const midMarker = L.marker([midLat, midLng], {
        icon: midIcon,
        zIndexOffset: 500
      });

      midMarker.bindTooltip(
        '<span style="font-family: monospace; font-size: 10px;">Click to insert new vertex here</span>',
        { direction: 'top', offset: [0, -8] }
      );

      // Clicking midpoint inserts a new vertex right there!
      midMarker.on('click', () => {
        const updated: [number, number][] = [
          ...coords.slice(0, idx + 1),
          [Math.round(midLat * 100000) / 100000, Math.round(midLng * 100000) / 100000],
          ...coords.slice(idx + 1)
        ];
        currentCoordsRef.current = updated;
        const newCenter = computePolygonCentroid(updated);
        if (onBoundaryUpdateRef.current) {
          onBoundaryUpdateRef.current(updated, newCenter);
        }
      });

      midpointMarkersLayerRef.current?.addLayer(midMarker);
    });
  }, [isDrawingMode, editMode, boundary]);

  // Handle Freehand Drawing Layer Updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !drawingMarkersLayerRef.current) return;

    drawingMarkersLayerRef.current.clearLayers();

    if (drawingPolylineRef.current) {
      map.removeLayer(drawingPolylineRef.current);
      drawingPolylineRef.current = null;
    }
    if (drawingPolygonRef.current) {
      map.removeLayer(drawingPolygonRef.current);
      drawingPolygonRef.current = null;
    }

    if (!isDrawingMode || editMode !== 'draw_freehand') return;

    // Draw active polyline
    if (freehandPoints.length > 0) {
      if (freehandPoints.length >= 3) {
        // Show translucent filled polygon preview
        drawingPolygonRef.current = L.polygon(freehandPoints, {
          color: '#38bdf8',
          weight: 2.5,
          opacity: 0.9,
          fillColor: '#0284c7',
          fillOpacity: 0.25,
          dashArray: '5, 5'
        }).addTo(map);
      } else {
        // Show connecting line
        drawingPolylineRef.current = L.polyline(freehandPoints, {
          color: '#38bdf8',
          weight: 2.5,
          dashArray: '5, 5'
        }).addTo(map);
      }

      // Draw point markers
      freehandPoints.forEach((pt, idx) => {
        const isFirst = idx === 0;
        const marker = L.circleMarker(pt, {
          radius: isFirst ? 8 : 6,
          color: isFirst ? '#38bdf8' : '#ffffff',
          weight: 2,
          fillColor: isFirst ? '#0284c7' : '#38bdf8',
          fillOpacity: 1
        });

        if (isFirst) {
          marker.bindTooltip(
            `<span style="font-family: monospace; font-size: 11px; font-weight: bold; color: #38bdf8;">
              First Point: Click here to close polygon
            </span>`,
            { permanent: freehandPoints.length >= 3, direction: 'top' }
          );

          // Clicking the first point closes the shape!
          marker.on('click', () => {
            if (freehandPoints.length >= 3) {
              completeFreehandDrawing();
            }
          });
        }

        drawingMarkersLayerRef.current?.addLayer(marker);
      });
    }
  }, [freehandPoints, isDrawingMode, editMode]);

  // Complete Freehand Drawing
  const completeFreehandDrawing = () => {
    if (freehandPoints.length >= 3 && onBoundaryUpdateRef.current) {
      const newCenter = computePolygonCentroid(freehandPoints);
      onBoundaryUpdateRef.current(freehandPoints, newCenter);
      setFreehandPoints([]);
      setEditMode('drag_vertices');
    }
  };

  // Reset / Clear Freehand Drawing
  const clearFreehandDrawing = () => {
    setFreehandPoints([]);
  };

  // Undo Last Placed Point
  const undoLastPoint = () => {
    setFreehandPoints((prev) => prev.slice(0, -1));
  };

  // Shape Presets Quick Generation
  const applyShapePreset = (type: 'rectangle' | 'pentagon' | 'natural_curve') => {
    if (!boundary) return;
    const centerPt = boundary.center;
    const radius = Math.sqrt(boundary.areaSquareMeters || 4000) / 2;
    const R = 6378137;

    let points: [number, number][] = [];

    if (type === 'rectangle') {
      // 4-point rectangle
      const dLat = (radius / R) * (180 / Math.PI);
      const dLng = (radius / (R * Math.cos((centerPt.lat * Math.PI) / 180))) * (180 / Math.PI);

      points = [
        [centerPt.lat + dLat * 0.7, centerPt.lng - dLng * 1.1],
        [centerPt.lat + dLat * 0.7, centerPt.lng + dLng * 1.1],
        [centerPt.lat - dLat * 0.7, centerPt.lng + dLng * 1.1],
        [centerPt.lat - dLat * 0.7, centerPt.lng - dLng * 1.1]
      ];
    } else if (type === 'pentagon') {
      // 5-point irregular property shape
      const angles = [0, 68, 140, 220, 290];
      const radiiFactors = [1.1, 0.9, 1.15, 0.85, 1.05];

      points = angles.map((ang, i) => {
        const rad = (ang * Math.PI) / 180;
        const r = radius * radiiFactors[i];
        const dx = r * Math.cos(rad);
        const dy = r * Math.sin(rad);
        const latOffset = (dy / R) * (180 / Math.PI);
        const lngOffset = (dx / (R * Math.cos((centerPt.lat * Math.PI) / 180))) * (180 / Math.PI);
        return [centerPt.lat + latOffset, centerPt.lng + lngOffset];
      });
    } else {
      // 7-point natural curved boundary
      const sides = 7;
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        const r = radius * (0.8 + 0.4 * Math.sin(i * 1.8));
        const dx = r * Math.cos(angle);
        const dy = r * Math.sin(angle);
        const latOffset = (dy / R) * (180 / Math.PI);
        const lngOffset = (dx / (R * Math.cos((centerPt.lat * Math.PI) / 180))) * (180 / Math.PI);
        points.push([centerPt.lat + latOffset, centerPt.lng + lngOffset]);
      }
    }

    const rounded = points.map(([lat, lng]) => [
      Math.round(lat * 100000) / 100000,
      Math.round(lng * 100000) / 100000
    ] as [number, number]);

    currentCoordsRef.current = rounded;
    const newCenter = computePolygonCentroid(rounded);
    if (onBoundaryUpdateRef.current) {
      onBoundaryUpdateRef.current(rounded, newCenter);
    }
  };

  // Update Slope / Elevation Grid Nodes Overlay
  useEffect(() => {
    if (!gridMarkersLayerRef.current) return;
    gridMarkersLayerRef.current.clearLayers();

    if (!showSlopeOverlay || !elevation?.gridPoints || isDrawingMode) return;

    elevation.gridPoints.forEach((pt) => {
      let slopeColor = '#10b981';
      if (pt.slopePercent >= 15) slopeColor = '#f43f5e';
      else if (pt.slopePercent >= 8) slopeColor = '#f59e0b';
      else if (pt.slopePercent >= 3) slopeColor = '#06b6d4';

      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: 7,
        color: '#ffffff',
        weight: 1.5,
        fillColor: slopeColor,
        fillOpacity: 0.9
      });

      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <strong>${pt.position} Node</strong><br/>
          Elev: ${pt.elevationM}m (${pt.relativeHeightM >= 0 ? '+' : ''}${pt.relativeHeightM}m)<br/>
          Slope: ${pt.slopePercent}%
        </div>`,
        { direction: 'top', className: 'geotech-tooltip' }
      );

      gridMarkersLayerRef.current?.addLayer(marker);
    });
  }, [elevation, showSlopeOverlay, isDrawingMode]);

  // Update Hydrology Flow Vector & Low Point Overlay
  useEffect(() => {
    if (!hydroLayerRef.current) return;
    hydroLayerRef.current.clearLayers();

    if (!showHydroOverlay || !elevation?.gridPoints || !boundary || isDrawingMode) return;

    const pts = [...elevation.gridPoints].sort((a, b) => a.elevationM - b.elevationM);
    const lowPt = pts[0];
    const highPt = pts[pts.length - 1];

    if (lowPt && highPt) {
      const flowLine = L.polyline(
        [
          [highPt.lat, highPt.lng],
          [lowPt.lat, lowPt.lng]
        ],
        {
          color: '#38bdf8',
          weight: 2.5,
          dashArray: '5, 8',
          opacity: 0.85
        }
      );
      hydroLayerRef.current.addLayer(flowLine);

      const lowZone = L.circle([lowPt.lat, lowPt.lng], {
        radius: 18,
        color: '#0284c7',
        weight: 1.5,
        fillColor: '#38bdf8',
        fillOpacity: 0.25
      });

      lowZone.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px;">
          <strong>Topographic Drainage Low Point</strong><br/>
          ${lowPt.elevationM}m MSL (${Math.abs(lowPt.relativeHeightM).toFixed(1)}m below mean)<br/>
          Accumulation / ponding vulnerability zone
        </div>`,
        { direction: 'bottom' }
      );

      hydroLayerRef.current.addLayer(lowZone);
    }
  }, [elevation, showHydroOverlay, boundary, isDrawingMode]);

  // Update Finding Markers
  useEffect(() => {
    if (!findingMarkersLayerRef.current) return;
    findingMarkersLayerRef.current.clearLayers();

    if (!showFindingMarkers || !findings || isDrawingMode) return;

    findings.forEach((finding) => {
      if (!finding.location) return;

      const isSelected = selectedFindingId === finding.id;

      const icon = L.divIcon({
        className: 'finding-map-marker',
        html: `
          <div style="
            background-color: ${isSelected ? '#f59e0b' : '#18181b'};
            border: 2px solid ${isSelected ? '#ffffff' : '#f59e0b'};
            color: ${isSelected ? '#000000' : '#ffffff'};
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-family: monospace;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${finding.domain[0].toUpperCase()}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([finding.location.lat, finding.location.lng], { icon });

      marker.bindTooltip(
        `<div style="font-family: system-ui, sans-serif; font-size: 11px; max-width: 220px; padding: 4px;">
          <div style="font-weight: bold; color: #f59e0b; margin-bottom: 2px;">${finding.title}</div>
          <div style="color: #cbd5e1; font-size: 10px;">${finding.location.label}</div>
          <div style="font-family: monospace; color: #94a3b8; font-size: 9px; margin-top: 3px;">
            [${finding.evidenceTag}] · ${finding.confidence} Confidence
          </div>
        </div>`,
        { direction: 'top', offset: [0, -10] }
      );

      marker.on('click', () => {
        if (onSelectFinding) onSelectFinding(finding.id);
      });

      findingMarkersLayerRef.current?.addLayer(marker);
    });
  }, [findings, selectedFindingId, showFindingMarkers, isDrawingMode]);

  // Recenter map
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (polygonLayerRef.current) {
      map.fitBounds(polygonLayerRef.current.getBounds(), { padding: [50, 50], maxZoom: 18 });
    } else if (boundary) {
      map.setView([boundary.center.lat, boundary.center.lng], 16);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[440px] bg-white rounded-3xl overflow-hidden border-2 border-[#1E293B] shadow-[6px_6px_0px_0px_#1E293B]">
      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${isDrawingMode && editMode === 'draw_freehand' ? 'cursor-crosshair' : ''}`}
      />

      {/* Top Left: Base Layer Selector & Toggles */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-2.5">
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-full border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] flex items-center gap-1 text-xs">
          <span className="font-mono text-[10px] uppercase text-[#1E293B] font-extrabold px-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#8B5CF6] stroke-[2.5]" />
            <span className="hidden sm:inline">Map</span>
          </span>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${activeBaseLayer === 'satellite'
                ? 'bg-[#8B5CF6] text-white shadow-[1px_1px_0px_#1E293B]'
                : 'text-[#1E293B] hover:bg-[#F1F5F9]'
              }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBaseLayer('street')}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${activeBaseLayer === 'street'
                ? 'bg-[#8B5CF6] text-white shadow-[1px_1px_0px_#1E293B]'
                : 'text-[#1E293B] hover:bg-[#F1F5F9]'
              }`}
          >
            Street
          </button>
          <button
            onClick={() => setActiveBaseLayer('topo')}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${activeBaseLayer === 'topo'
                ? 'bg-[#8B5CF6] text-white shadow-[1px_1px_0px_#1E293B]'
                : 'text-[#1E293B] hover:bg-[#F1F5F9]'
              }`}
          >
            Topo
          </button>
          <button
            onClick={() => setActiveBaseLayer('dark')}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${activeBaseLayer === 'dark'
                ? 'bg-[#8B5CF6] text-white shadow-[1px_1px_0px_#1E293B]'
                : 'text-[#1E293B] hover:bg-[#F1F5F9]'
              }`}
          >
            GIS Dark
          </button>
        </div>

        {/* Overlays toggle (hidden in edit mode to avoid clutter) */}
        {!isDrawingMode && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border-2 border-[#1E293B] shadow-[3px_3px_0px_#1E293B] flex flex-wrap items-center gap-3 text-xs">
            <span className="font-mono text-[10px] text-[#64748B] uppercase font-bold">
              Overlays:
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#1E293B] font-bold select-none">
              <input
                type="checkbox"
                checked={showSlopeOverlay}
                onChange={(e) => setShowSlopeOverlay(e.target.checked)}
                className="accent-[#8B5CF6] rounded w-3.5 h-3.5"
              />
              <Mountain className="w-3.5 h-3.5 text-[#10B981] stroke-[2.5]" />
              <span>Slope</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#1E293B] font-bold select-none">
              <input
                type="checkbox"
                checked={showHydroOverlay}
                onChange={(e) => setShowHydroOverlay(e.target.checked)}
                className="accent-[#8B5CF6] rounded w-3.5 h-3.5"
              />
              <Droplets className="w-3.5 h-3.5 text-[#0284C7] stroke-[2.5]" />
              <span>Drainage</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#1E293B] font-bold select-none">
              <input
                type="checkbox"
                checked={showFindingMarkers}
                onChange={(e) => setShowFindingMarkers(e.target.checked)}
                className="accent-[#8B5CF6] rounded w-3.5 h-3.5"
              />
              <MapPin className="w-3.5 h-3.5 text-[#F472B6] stroke-[2.5]" />
              <span>Findings ({findings.length})</span>
            </label>
          </div>
        )}
      </div>

      {/* FLOATING FREESTYLE BOUNDARY EDITOR TOOLBAR (Visible when isDrawingMode is true) */}
      {isDrawingMode && (
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl bg-white border-2 border-[#1E293B] rounded-2xl shadow-[6px_6px_0px_#1E293B] p-3.5 text-xs text-[#1E293B] space-y-2.5">
          {/* Header & Submode Switcher */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-[#1E293B] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-[#FBBF24] border border-[#1E293B] text-[#1E293B] shadow-[1px_1px_0px_#1E293B]">
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-['Outfit'] font-bold text-[#1E293B] uppercase text-xs">
                Boundary Editor
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#FFFDF5] p-1 rounded-full border-2 border-[#1E293B] text-[11px] font-mono">
              <button
                onClick={() => setEditMode('drag_vertices')}
                className={`px-3 py-1 rounded-full transition-all font-bold flex items-center gap-1 cursor-pointer ${editMode === 'drag_vertices'
                    ? 'bg-[#FBBF24] text-[#1E293B] shadow-[1px_1px_0px_#1E293B]'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
              >
                <Move className="w-3 h-3 stroke-[2.5]" />
                Move & Add
              </button>
              <button
                onClick={() => {
                  setEditMode('draw_freehand');
                  setFreehandPoints([]);
                }}
                className={`px-3 py-1 rounded-full transition-all font-bold flex items-center gap-1 cursor-pointer ${editMode === 'draw_freehand'
                    ? 'bg-[#8B5CF6] text-white shadow-[1px_1px_0px_#1E293B]'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
              >
                <Crosshair className="w-3 h-3 stroke-[2.5]" />
                Draw Freehand
              </button>
            </div>
          </div>

          {/* Submode 1: Move & Add Vertices */}
          {editMode === 'drag_vertices' && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="text-[#1E293B] flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#F472B6] border border-[#1E293B] animate-ping inline-block" />
                <span>
                  <strong>Drag vertices</strong> to reshape • Click <strong>(+)</strong> midpoints to add • Click vertex to remove
                </span>
              </div>

              {/* Quick Shape Presets */}
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="text-[#64748B] font-bold">Presets:</span>
                <button
                  onClick={() => applyShapePreset('rectangle')}
                  className="px-2 py-0.5 rounded-full bg-[#FFFDF5] hover:bg-[#FBBF24] border border-[#1E293B] text-[#1E293B] font-bold shadow-[1px_1px_0px_#1E293B] transition cursor-pointer"
                  title="Make 4-corner rectangle"
                >
                  Rectangle
                </button>
                <button
                  onClick={() => applyShapePreset('pentagon')}
                  className="px-2 py-0.5 rounded-full bg-[#FFFDF5] hover:bg-[#FBBF24] border border-[#1E293B] text-[#1E293B] font-bold shadow-[1px_1px_0px_#1E293B] transition cursor-pointer"
                  title="Make 5-corner irregular polygon"
                >
                  5-Sided
                </button>
                <button
                  onClick={() => applyShapePreset('natural_curve')}
                  className="px-2 py-0.5 rounded-full bg-[#FFFDF5] hover:bg-[#FBBF24] border border-[#1E293B] text-[#1E293B] font-bold shadow-[1px_1px_0px_#1E293B] transition cursor-pointer"
                  title="Make 7-corner natural polygon"
                >
                  7-Sided
                </button>
              </div>
            </div>
          )}

          {/* Submode 2: Draw from Scratch */}
          {editMode === 'draw_freehand' && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="text-[#8B5CF6] flex items-center gap-1.5 font-bold">
                <Crosshair className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>
                  Click map to place boundary points ({freehandPoints.length} placed). Min 3 points.
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <button
                  onClick={undoLastPoint}
                  disabled={freehandPoints.length === 0}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F1F5F9] border border-[#1E293B] text-[#1E293B] font-bold disabled:opacity-40 transition flex items-center gap-1 shadow-[1px_1px_0px_#1E293B] cursor-pointer"
                >
                  <Undo2 className="w-3 h-3 stroke-[2.5]" /> Undo
                </button>
                <button
                  onClick={clearFreehandDrawing}
                  disabled={freehandPoints.length === 0}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-[#FEE2E2] border border-[#1E293B] text-[#EF4444] font-bold disabled:opacity-40 transition flex items-center gap-1 shadow-[1px_1px_0px_#1E293B] cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 stroke-[2.5]" /> Clear
                </button>
                <button
                  onClick={completeFreehandDrawing}
                  disabled={freehandPoints.length < 3}
                  className="px-3 py-1 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-extrabold disabled:opacity-40 transition flex items-center gap-1 border border-[#1E293B] shadow-[2px_2px_0px_#1E293B] cursor-pointer"
                >
                  <Check className="w-3 h-3 stroke-[2.5]" /> Complete
                </button>
              </div>
            </div>
          )}

          {/* Live Calculated Geometry HUD in Edit Mode + Apply Button */}
          <div className="pt-2 border-t-2 border-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#64748B]">
            <div className="flex items-center gap-3">
              <span>Points: <strong className="text-[#1E293B]">{currentCoordsRef.current.length}</strong></span>
              {liveMetrics && (
                <>
                  <span>Area: <strong className="text-[#8B5CF6] font-bold">{liveMetrics.areaAcres} ac</strong></span>
                  <span className="hidden sm:inline">Perimeter: <strong className="text-[#1E293B]">{liveMetrics.perimeterM} m</strong></span>
                </>
              )}
            </div>

            {onFinishEditing && (
              <button
                onClick={onFinishEditing}
                className="candy-btn-yellow px-3.5 py-1 text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                Done & Re-analyze
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Right: Map Controls */}
      <div className="absolute top-3.5 right-3.5 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleRecenter}
          className="w-9 h-9 rounded-full bg-white hover:bg-[#FBBF24] border-2 border-[#1E293B] text-[#1E293B] shadow-[3px_3px_0px_#1E293B] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Recenter Map on Parcel"
        >
          <Crosshair className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Left: Geographic HUD */}
      <div className="absolute bottom-3.5 left-3.5 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-[#1E293B] shadow-[4px_4px_0px_#1E293B] text-[11px] font-mono text-[#1E293B] space-y-1">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[#64748B] uppercase text-[9px] font-bold block">Parcel Center</span>
            <span className="text-[#8B5CF6] font-extrabold">
              {boundary ? `${boundary.center.lat.toFixed(5)}°N, ${boundary.center.lng.toFixed(5)}°W` : 'None'}
            </span>
          </div>
          {boundary && (
            <div className="border-l-2 border-[#CBD5E1] pl-3">
              <span className="text-[#64748B] uppercase text-[9px] font-bold block">Acreage</span>
              <span className="text-[#1E293B] font-extrabold">
                {liveMetrics ? `${liveMetrics.areaAcres} ac` : `${boundary.areaAcres} ac`}
              </span>
            </div>
          )}
          <div className="border-l-2 border-[#CBD5E1] pl-3 hidden sm:block">
            <span className="text-[#64748B] uppercase text-[9px] font-bold block">Zoom</span>
            <span className="text-[#1E293B] font-bold">z{zoomLevel}</span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Cursor Coordinates Tracker */}
      <div className="absolute bottom-3.5 right-3.5 z-10 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border-2 border-[#1E293B] shadow-[2px_2px_0px_#1E293B] text-[10px] font-mono font-bold text-[#1E293B] hidden md:block">
        {cursorCoords ? `${cursorCoords.lat.toFixed(5)}°, ${cursorCoords.lng.toFixed(5)}°` : 'Cursor outside bounds'}
      </div>
    </div>
  );

};
