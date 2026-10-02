import { LatLng, SiteBoundary } from '../types/site.ts';

// Generate an N-sided regular polygon around a center coordinate with a given radius in meters
export function createCircularPolygon(center: LatLng, radiusMeters: number, sides = 8): [number, number][] {
  const coords: [number, number][] = [];
  const R = 6378137; // Earth radius in meters

  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);

    const latOffset = (dy / R) * (180 / Math.PI);
    const lngOffset = (dx / (R * Math.cos((center.lat * Math.PI) / 180))) * (180 / Math.PI);

    coords.push([
      Math.round((center.lat + latOffset) * 100000) / 100000,
      Math.round((center.lng + lngOffset) * 100000) / 100000
    ]);
  }

  return coords;
}

// Calculate bounding box for coordinates
export function computeBoundingBox(coords: [number, number][]) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return { minLat, maxLat, minLng, maxLng };
}

// Calculate polygon area and perimeter
export function calculatePolygonMetrics(coords: [number, number][]): {
  areaSquareMeters: number;
  areaAcres: number;
  perimeterMeters: number;
} {
  if (coords.length < 3) {
    return { areaSquareMeters: 0, areaAcres: 0, perimeterMeters: 0 };
  }

  const R = 6378137;
  let area = 0;
  let perimeter = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];

    const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
    const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeter += R * c;

    const p1LngRad = (p1[1] * Math.PI) / 180;
    const p2LngRad = (p2[1] * Math.PI) / 180;
    const p1LatRad = (p1[0] * Math.PI) / 180;
    const p2LatRad = (p2[0] * Math.PI) / 180;
    area += (p2LngRad - p1LngRad) * (2 + Math.sin(p1LatRad) + Math.sin(p2LatRad));
  }

  area = Math.abs((area * R * R) / 2);
  const areaAcres = area / 4046.8564224;

  return {
    areaSquareMeters: Math.round(area * 10) / 10,
    areaAcres: Math.round(areaAcres * 100) / 100,
    perimeterMeters: Math.round(perimeter * 10) / 10
  };
}

// Calculate polygon centroid (average of coordinates)
export function computePolygonCentroid(coords: [number, number][]): LatLng {
  if (coords.length === 0) return { lat: 0, lng: 0 };
  let latSum = 0;
  let lngSum = 0;
  for (const [lat, lng] of coords) {
    latSum += lat;
    lngSum += lng;
  }
  return {
    lat: Math.round((latSum / coords.length) * 100000) / 100000,
    lng: Math.round((lngSum / coords.length) * 100000) / 100000
  };
}

export function buildSiteBoundary(coords: [number, number][], optionalCenter?: LatLng): SiteBoundary {
  const center = optionalCenter || computePolygonCentroid(coords);
  const bbox = computeBoundingBox(coords);
  const metrics = calculatePolygonMetrics(coords);

  return {
    type: 'Polygon',
    coordinates: coords,
    center,
    bbox,
    areaSquareMeters: metrics.areaSquareMeters,
    areaAcres: metrics.areaAcres,
    perimeterMeters: metrics.perimeterMeters
  };
}
