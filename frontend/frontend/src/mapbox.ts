import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiaXNhYWNzdGlsd2VsbCIsImEiOiJjbWlwcmJ3dWMwOGY0M2Nva3ZvODQ4YnMwIn0.ni4G7yJU2L5T0VYAoFXdFw';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/standard', // style URL
    config: {
        basemap: {

        }
    },
    center: [-87.644642, 41.898951], // starting position [lng, lat]
    zoom: 16, // starting zoom
    bearing: -35.37,
    pitch: 63.41,
});

const marker = new mapboxgl.Marker({
    color: "#e04c4c",
  })
    .setLngLat([-87.644642, 41.898951])
    .addTo(map);