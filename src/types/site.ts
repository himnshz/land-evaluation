export type EvidenceCategory =
  | 'VERIFIED'
  | 'DATA-DERIVED'
  | 'REGIONAL'
  | 'INFERRED'
  | 'UNKNOWN'
  | 'FIELD-VERIFICATION-REQUIRED';

export type ConfidenceLevel = 'High' | 'Moderate' | 'Low' | 'Unknown';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SiteBoundary {
  type: 'Polygon';
  coordinates: [number, number][]; // [lat, lng] array
  center: LatLng;
  bbox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  areaSquareMeters: number;
  areaAcres: number;
  perimeterMeters: number;
}

export interface DataProvenance {
  id: string;
  sourceName: string;
  datasetName: string;
  retrievalDate: string;
  geographicCoverage: string;
  resolution: string;
  dataType: string;
  processingPerformed: string;
  limitations: string;
  status: 'available' | 'partially_available' | 'unavailable';
}

export interface Finding {
  id: string;
  title: string;
  domain: 'terrain' | 'hydrology' | 'surface' | 'geology' | 'soil' | 'subsurface';
  evidenceTag: EvidenceCategory;
  finding: string;
  evidence: string;
  source: string;
  reasoning: string;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  unknowns: string;
  recommendedVerification: string;
  severity: 'neutral' | 'advisory' | 'investigate' | 'constraint';
  location?: {
    lat: number;
    lng: number;
    label: string;
    zoneDescription?: string;
  };
}

export interface GridElevationPoint {
  lat: number;
  lng: number;
  elevationM: number;
  relativeHeightM: number;
  slopePercent: number;
  position: 'NW' | 'N' | 'NE' | 'W' | 'Center' | 'E' | 'SW' | 'S' | 'SE';
}

export interface ElevationProfile {
  minElevationM: number;
  maxElevationM: number;
  meanElevationM: number;
  elevationDeltaM: number;
  slopePercentMean: number;
  slopePercentMax: number;
  slopeCategory: 'Flat (<3%)' | 'Gentle (3-8%)' | 'Moderate (8-15%)' | 'Steep (>15%)';
  aspectDegree: number;
  aspectCompass: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'Flat';
  terrainForm: string;
  localReliefDescription: string;
  gridPoints: GridElevationPoint[];
  provenance: DataProvenance;
}

export interface SurfaceData {
  visibleLandCover: string;
  vegetationDensity: string;
  exposedGround: string;
  visibleWater: string;
  surfaceDisturbanceNotes: string;
  canopyCoverageEstPercent: number;
  imperviousEstPercent: number;
  evidenceProvenance: DataProvenance;
}

export interface WaterBody {
  name: string;
  type: string;
  distanceM: number;
  direction: string;
  approxElevationDeltaM?: number;
}

export interface HydrologyData {
  nearbyWaterBodies: WaterBody[];
  drainageDirection: string;
  surfaceRunoffTendency: string;
  waterAccumulationZone: string;
  floodSusceptibilityIndicator: string;
  floodEvidenceTag: EvidenceCategory;
  groundwaterDepthContext: string;
  evidenceProvenance: DataProvenance;
}

export interface GeologyData {
  macroFormation: string;
  regionalGeologicalUnit: string;
  lithologyType: string;
  geologicalAge: string;
  knownFaultDistanceKm: number | null;
  faultContext: string;
  karstSolubleRockIndicator: boolean;
  seismicContext: string;
  evidenceProvenance: DataProvenance;
}

export interface SoilData {
  soilContextSummary: string;
  parentMaterial: string;
  drainageClass: string;
  shrinkSwellExpansiveRisk: 'Low' | 'Moderate' | 'High' | 'Unknown';
  bedrockDepthRegionalEstimateM: string;
  isSiteSpecificInvestigationAvailable: boolean; // strictly false without physical borehole
  soilDisclaimer: string;
  evidenceProvenance: DataProvenance;
}

export interface StratigraphicLayer {
  layerId: string;
  name: string;
  material: string;
  depthRangeM: string | null;
  thicknessM?: string | null;
  evidenceTag: EvidenceCategory;
  confidence: ConfidenceLevel;
  source: string;
  description: string;
  depthResolved: boolean;
  color: string;
}

export interface SubsurfaceData {
  depthResolvedAvailable: boolean;
  depthResolvedExplanation: string;
  stratigraphicLayers: StratigraphicLayer[];
  regionalAquiferContext: string;
  boreholeDataAvailable: boolean;
  boreholeDisclaimer: string;
  evidenceProvenance: DataProvenance;
}

export interface MissingDataItem {
  id: string;
  domain: string;
  missingItem: string;
  impactOnSiteDueDiligence: string;
  recommendedInvestigation: string;
}

export interface FieldInvestigationRecommendation {
  id: string;
  priority: 'Essential' | 'Recommended' | 'Conditional';
  discipline: string;
  investigationType: string;
  scope: string;
  triggerFinding: string;
  suggestedTiming: string;
}

export interface SiteIntelligenceProfile {
  siteId: string;
  timestamp: string;
  location: {
    addressName: string;
    lat: number;
    lng: number;
    areaSquareMeters: number;
    areaAcres: number;
    perimeterMeters: number;
    boundary: SiteBoundary;
  };
  elevation: ElevationProfile;
  surface: SurfaceData;
  hydrology: HydrologyData;
  geology: GeologyData;
  soil: SoilData;
  subsurface: SubsurfaceData;
  findings: Finding[];
  missingDataInventory: MissingDataItem[];
  recommendedFieldInvestigations: FieldInvestigationRecommendation[];
  dataProvenances: DataProvenance[];
  llmInterpretation: {
    executiveSummary: string;
    terrainAndDrainageSynthesis: string;
    geologySubsurfaceSynthesis: string;
    uncertaintyAndRiskBoundary: string;
  };
}

export interface PresetSite {
  id: string;
  name: string;
  region: string;
  coordinates: LatLng;
  defaultRadiusMeters: number;
  geologicalHighlights: string;
  terrainType: string;
  description: string;
}
