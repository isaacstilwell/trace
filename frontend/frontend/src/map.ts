import mapboxgl, { Map, Marker, type MapOptions } from 'mapbox-gl'
import { CableManager, type SubcableEndpoint } from './cableManager';

interface CableData {
  id: string;
  entry_point: {
    lat: number,
    lon: number,
  },
}

export interface Location {
  ips: string[];
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  facility: any | null;
  isp: string;
  source_cable: CableData | null;
  dest_cable: CableData | null;
  distance_to: number,
  distance_from: number,
}

class CableMap extends Map {
  public cableManager?: CableManager;
  private idling: boolean = true;
  private secondsPerRev = 180;
  private idleDPS = 360 / this.secondsPerRev;
  private locations: Location[] = [];
  private markers: Marker[] = [];
  private markedCoords: [number, number][] = [];
  private currentLocation: number = 0;

  constructor(options: MapOptions) {
    super(options);

    this.on('load', () => {
      this.rotateIdle();
      setInterval(this.rotateIdle, 1000);

      this.cableManager = new CableManager(this);
    });

    this.on('style.load', () => {
      this.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0 // Background star brightness (default 0.35 at low zoooms )
      });
    })
  }

  rotateIdle = () => {
    const center = this.getCenter();
    if (this.idling) {
      center.lng -= this.idleDPS * 0.75;
      center.lat += this.idleDPS * 0.25;
      this.easeTo({center, duration: 1000, easing: (n) => n});
    }
  }

  mapLocations = (locations: Location[]) => {
    this.idling = false;
    // this.cableManager?.clearFilter();
    this.setLocations(locations);
    this.currentLocation = 0;
    this.moveToLocation(locations[0]);

    return {
        location: locations[0],
        index: this.currentLocation,
        count: this.locations.length,
      }
  }

  private setLocations = (locations: Location[]) => {
    this.locations = locations;
    for (let m of this.markers) {
      m.remove();
    }
    this.markedCoords = [];
    this.markers = [];
  }

  nextLocation = () => {
    if (this.locations.length > 0) {
      this.currentLocation = (this.currentLocation + 1) % this.locations.length;
      const loc = this.locations[this.currentLocation];

      this.showCable(loc);
      this.moveToLocation(loc);

      return {
        location: loc,
        index: this.currentLocation,
        count: this.locations.length,
      }
    }
  }

  prevLocation = () => {
    if (this.locations.length > 0) {
      this.currentLocation = (this.currentLocation - 1) % this.locations.length;
      const loc = this.locations[this.currentLocation];

      this.showCable(loc);
      this.moveToLocation(loc);

      return {
        location: loc,
        index: this.currentLocation,
        count: this.locations.length,
      }
    }
  }

  private moveToLocation = (location: Location) => {
    const [lat, lon] = getLocationLatLon(location);
    this.addMarker(location);

    this.flyTo({
      center: [lon, lat],
      zoom: 16,
      speed: 1,
      curve: 3,
      pitch: 70,
      easing(t) {
        return t;
      }
    });
  }

  private addMarker = (location: Location) => {
    const [lat, lon] = getLocationLatLon(location);

    if (!this.markedCoords.find(([lat1, lon1]) => lat1 === lat && lon1 === lon)) {
      const marker = new mapboxgl.Marker({
        color: "#e04c4c",
      })
        .setLngLat([lon, lat])
        .addTo(this);

      console.log(`adding marker ${marker}`);

      this.markers.push(marker);
      this.markedCoords.push([lat, lon]);
    }
  }

  private showCable = (location: Location) => {
    if (location["dest_cable"] !== null) {
      const cable = location["dest_cable"];
      const cableId = location["dest_cable"]["id"];
      console.log(`appending ${cableId} to map`)
      const endpoints: SubcableEndpoint[] = [cable.entry_point]
      const src_cable = this.locations[this.currentLocation - 1]["source_cable"]
      if (src_cable) {
        endpoints.push(src_cable.entry_point);
      }
      this.cableManager?.addCable(cableId);
    }
  }
}

const getLocationLatLon = (location: Location) => {
  const hasFac = location["facility"] !== null;
  const lat = hasFac ? location["facility"]!["latitude"] : location["latitude"];
  const lon = hasFac ? location["facility"]!["longitude"] : location["longitude"];
  return [lat, lon]
}

export const initMap = (containerId: string) => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
  const map = new CableMap({
    container: containerId, // container ID
    style: 'mapbox://styles/mapbox/standard', // style URL
    config: {
      basemap: {
        showPointOfInterestLabels: false,
        showRoadLabels: false,
        showTransitLabels: false,
        theme: "default",
      }
    },
    center: [-74.5, 40],
    zoom: 1,
    bearing: 0,
    pitch: 0,
  });

  return map;
}