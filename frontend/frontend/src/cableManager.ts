import { Map } from 'mapbox-gl';

// Basic GeoJSON type definitions for your cable features

export interface Position {
  lon: number;
  lat: number;
}

export interface SubcableEndpoint {
  lat: number;
  lon: number;
}

// GeoJSON Geometry types
export interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface LineString {
  type: 'LineString';
  coordinates: Array<[number, number]>; // Array of [longitude, latitude]
}

export interface MultiLineString {
  type: 'MultiLineString';
  coordinates: Array<Array<[number, number]>>; // Array of LineStrings
}

// You can add other geometry types as needed
export type Geometry = Point | LineString | MultiLineString;

// GeoJSON Feature
export interface Feature<G extends Geometry = Geometry, P = any> {
  type: 'Feature';
  geometry: G;
  properties: P;
}

// Specific type for your cable features
export interface CableProperties {
  id: string;
  name: string;
  color: string;
  feature_id: string;
  coordinates: [number, number]; // Looks like this is a reference point
}

export interface CableFeature extends Feature<MultiLineString, CableProperties> {
  type: 'Feature';
  geometry: MultiLineString;
  properties: CableProperties;
}

// GeoJSON FeatureCollection
export interface FeatureCollection<G extends Geometry = Geometry, P = any> {
  type: 'FeatureCollection';
  features: Array<Feature<G, P>>;
}

export interface CableFeatureCollection extends FeatureCollection<MultiLineString, CableProperties> {
  type: 'FeatureCollection';
  features: CableFeature[];
}

export class CableManager {
  private visibleCableIds: Set<string> = new Set();
  private map: Map;
  private highlightSourceId = 'highlight-data';
  private highlightLayerId = 'highlights';

  constructor(map: Map) {
    this.map = map;


    map.addSource('cable-data', {
      type: 'geojson',
      data: '../cable-geo.json'
    });

    map.addLayer({
      id: 'cables',
      source: 'cable-data',
      type: 'line',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1
      }
    });

    map.addSource(this.highlightSourceId, {
      type: 'geojson',
      data: '../cable-geo.json'
    });

    this.map.addLayer({
      id: this.highlightLayerId,
      type: 'line',
      source: this.highlightSourceId,
      paint: {
        'line-color': '#ff0000', // Red highlight
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    this.updateFilter();

  }

  // highlightSubcables(cableId: string, endpoints: SubcableEndpoint[]) {
  //   fetch('./cable-map.json').then(r => r.json()).then(cableMap => {
  //     const subcables = cableMap[cableId]["coordinates"];
  //     const highlightFeatures: Feature<LineString>[] = [];

  //     // Find which subcables contain the endpoints
  //     endpoints.forEach(endpoint => {
  //       const subcableIndex = this.findSubcableContainingPoint(
  //         subcables,
  //         [endpoint.lon, endpoint.lat]
  //       );

  //       if (subcableIndex !== -1) {
  //         // Create a LineString feature for this subcable
  //         highlightFeatures.push({
  //           type: 'Feature',
  //           properties: {
  //             cableId: cableId,
  //             subcableIndex
  //           },
  //           geometry: {
  //             type: 'LineString',
  //             coordinates: subcables[subcableIndex]
  //           }
  //         });
  //       }
  //     });

  //     const source = this.map.getSource(this.highlightSourceId) as mapboxgl.GeoJSONSource;
  //     source.setData({
  //       type: 'FeatureCollection',
  //       features: highlightFeatures
  //     });
  //   })

  // }

  // private findSubcableContainingPoint(
  //   subcables: number[][][],
  //   point: [number, number]
  // ): number {
  //   const [targetLon, targetLat] = point;
  //   const tolerance = 0.0001;

  //   for (let i = 0; i < subcables.length; i++) {
  //     const subcable = subcables[i];

  //     // Check if any coordinate in this subcable matches our point
  //     const found = subcable.some(coord => {
  //       const [lon, lat] = coord;
  //       return Math.abs(lon - targetLon) < tolerance &&
  //              Math.abs(lat - targetLat) < tolerance;
  //     });

  //     if (found) {
  //       return i;
  //     }
  //   }

  //   return -1;
  // }

  clearHighlights() {
    const source = this.map.getSource(this.highlightSourceId) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
  }

  addCable = (cableId: string) => {
    this.visibleCableIds.add(cableId);
    this.updateFilter();
  }

  removeCable = (cableId: string) => {
    this.visibleCableIds.delete(cableId);
    this.updateFilter();
  }

  clearFilter = () => {
    this.visibleCableIds.clear();
    this.updateFilter();
  }

  showAll = () => {
    this.visibleCableIds.clear();
    this.map.setFilter('cables', null);
  }

  private updateFilter = () => {
    if (this.visibleCableIds.size === 0) {
      this.map.setFilter(this.highlightLayerId, ['==', ['get', 'id'], '']);
    } else {
      this.map.setFilter(this.highlightLayerId, [
        'in',
        ['get', 'id'],
        ['literal', Array.from(this.visibleCableIds)]
      ]);
    }
  }
}