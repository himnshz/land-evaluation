import type { PresetSite } from '../types/site.ts';

export const PRESET_SITES: PresetSite[] = [
  {
    id: 'austin-karst',
    name: 'Barton Creek Bluffs, Austin',
    region: 'Texas, USA',
    coordinates: { lat: 30.2742, lng: -97.8015 },
    defaultRadiusMeters: 120,
    geologicalHighlights: 'Edwards Limestone formation, Karst dissolution features, Edwards Aquifer recharge zone',
    terrainType: 'Canyon rim with stepped limestone benches and moderate slope',
    description: 'Typical Texas Hill Country terrain with shallow stony clay soil over fractured Cretaceous limestone. High regional sensitivity to karst voids and groundwater recharge.'
  },
  {
    id: 'seattle-bluff',
    name: 'Magnolia Coastal Ridge, Seattle',
    region: 'Washington, USA',
    coordinates: { lat: 47.6448, lng: -122.3995 },
    defaultRadiusMeters: 100,
    geologicalHighlights: 'Vashon glacial till overlying Lawton Clay, Cascadia subduction zone seismicity',
    terrainType: 'Steep coastal terrace with westward aspect toward Puget Sound',
    description: 'Pacific Northwest glacial stratigraphy with permeable sand/gravel till over impermeable glaciolacustrine clay, creating historical perched water table and bluff slope instability.'
  },
  {
    id: 'ocala-karst',
    name: 'Marion County Farmland, Ocala',
    region: 'Florida, USA',
    coordinates: { lat: 29.1872, lng: -82.1401 },
    defaultRadiusMeters: 150,
    geologicalHighlights: 'Ocala & Suwannee Limestone, high cover-collapse sinkhole vulnerability, unconfined aquifer',
    terrainType: 'Gently undulating karst plain with subtle topographic depression',
    description: 'Thick permeable eolian and marine sands underlain by soluble Eocene limestone. Surface drainage is largely internal via subterranean sinkholes and solution conduits.'
  },
  {
    id: 'boulder-foothills',
    name: 'Sanitas Valley Foothills, Boulder',
    region: 'Colorado, USA',
    coordinates: { lat: 40.0351, lng: -105.2974 },
    defaultRadiusMeters: 110,
    geologicalHighlights: 'Fountain Formation arkosic sandstone adjacent to Precambrian crystalline granite',
    terrainType: 'Hogback ridge and alluvial fan sloping eastward from Front Range',
    description: 'Steep transition from Rocky Mountain crystalline basement to sedimentary plains, characterized by coarse colluvial gravels, high flash-flood runoff velocity, and shallow bedrock.'
  },
  {
    id: 'cotswolds-escarpment',
    name: 'Cotswold Edge, Gloucestershire',
    region: 'England, UK',
    coordinates: { lat: 51.7145, lng: -2.2536 },
    defaultRadiusMeters: 130,
    geologicalHighlights: 'Inferior Oolite Jurassic limestone resting on Whitby Mudstone/Lias Clay',
    terrainType: 'High limestone plateau edge sloping down toward Severn Vale',
    description: 'Classic British scarp-and-vale topography with spring-line emergence at the permeable limestone and impermeable mudstone contact, requiring investigation of relict solifluction and slope creep.'
  },
  {
    id: 'hudson-valley',
    name: 'Palisades Terrace, Nyack',
    region: 'New York, USA',
    coordinates: { lat: 41.0883, lng: -73.9185 },
    defaultRadiusMeters: 110,
    geologicalHighlights: 'Palisades Diabase sill intrusion overlying Newark Basin Triassic sandstone',
    terrainType: 'Colluvial talus slope transitioning to riverbank terrace',
    description: 'Dense mafic igneous rock with columnar jointing over sedimentary red beds, producing boulder-rich glacial till and steep break-in-slope near the Hudson estuary.'
  }
];
