declare const OSMBuildings: any;

const loadingWrapper = document.getElementById('loading-wrapper') as HTMLDivElement;
const nextButton = document.getElementById('next-button') as HTMLButtonElement;

interface Location {
  ip: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  facility: {
    latitude: number;
    longitude: number;
    name: string;
    address1: string;
  } | null;
  isp: string;
  source_cable: any;
  dest_cable: any;
}

let locations: Location[] = [];
let currentLocation = -1;


export const showMap = (locOutput: Location[], containerId: string) => {
  locations = locOutput;
  const map = initMap(containerId);
  nextButton.addEventListener('click', () => loadNextLocation(map))
  loadNextLocation(map);
}

const loadNextLocation = (map: any) => {
  currentLocation = (currentLocation + 1) % locations.length;
  const loc = locations[currentLocation];
  const hasFac = loc["facility"] !== null;
  console.log(`location ${currentLocation} has facility? ${hasFac}.`);
  if (loadingWrapper) {
    loadingWrapper.innerText = `${currentLocation + 1} / ${locations.length}: ${loc["city"]}, ${loc["country"]}\nIP ${loc["ip"]}\nISP: ${loc["isp"]}`;
  }
  const lat = hasFac ? loc["facility"]!["latitude"] : loc["latitude"];
  const lon = hasFac ? loc["facility"]!["longitude"] : loc["longitude"];
  setMapPosition(map, lat, lon, 16);
  setMapTilt(map, 45);
  const marker = addMarker(map, lat, lon);
}

const initMap = (containerId?: string) => {
  const map = new OSMBuildings({
    container: containerId,
    position: { latitude: 52.51836, longitude: 13.40438 },
    zoom: 16,
    minZoom: 15,
    maxZoom: 20,
    attribution: '© Data <a href="https://openstreetmap.org/copyright/">OpenStreetMap</a> © Map <a href="https://osmbuildings.org/copyright/">OSM Buildings</a>'
  })

  map.addMapTiles('https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png');

  map.addGeoJSONTiles('https://{s}.data.osmbuildings.org/0.2/59fcc2e8/tile/{z}/{x}/{y}.json');

  return map;
}

const setMapPosition = (map: any, lat: number, lon: number, zoom: number) => {
  if (map) {
    map.setPosition({ latitude: lat, longitude: lon });
    map.setZoom(zoom);
    return map
  }
}

const setMapTilt = (map: any, tilt: number) => {
  if (map) {
    map.setTilt(tilt);
    return map;
  }
}

const addMarker = (map: any, lat: number, lon: number, altitude: number = 100) => {
  const pos = {latitude: lat, longitude: lon, altitude}
  const data = {
    title: "test"
  };

  const options = {
    color: ""  // Try hex format
  };
  const marker = map.addMarker(pos, data, options);


  console.log(marker);
  return marker
}

const addBuilding = (map: any, geoJSON: any) => {
  if (map) {
    map.addGeoJSON(geoJSON);
  }
}