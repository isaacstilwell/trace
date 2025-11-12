import { showMap } from "./map.ts";

const inputField = document.getElementById('ip-input') as HTMLInputElement;
const startButton = document.getElementById('start-button') as HTMLButtonElement;
const loadingWrapper = document.getElementById('loading-wrapper') as HTMLDivElement;
const mapContainer = document.getElementById('map-container') as HTMLDivElement;

const testOutput = [
  {
    "ip": "96.110.167.177",
    "latitude": 41.885,
    "longitude": -87.7845,
    "city": "Oak Park",
    "country": "US",
    "facility": {
      "id": 1730,
      "org_id": 682,
      "org_name": "Lumen Technologies Inc",
      "campus_id": null,
      "name": "Level(3) Chicago (Kingsbury)",
      "aka": "",
      "name_long": "",
      "website": "http://www.level3.com",
      "social_media": [
        {
          "service": "website",
          "identifier": "http://www.level3.com"
        }
      ],
      "clli": "",
      "rencode": "",
      "npanxx": "",
      "notes": "",
      "net_count": 15,
      "ix_count": 0,
      "sales_email": "",
      "sales_phone": "",
      "tech_email": "",
      "tech_phone": "",
      "available_voltage_services": [],
      "diverse_serving_substations": null,
      "property": "",
      "region_continent": "North America",
      "status_dashboard": "",
      "logo": null,
      "created": "2014-02-06T00:00:00Z",
      "updated": "2025-09-26T22:44:51Z",
      "status": "ok",
      "address1": "900 N Kingsbury St",
      "address2": "",
      "city": "Chicago",
      "country": "US",
      "state": "IL",
      "zipcode": "60606",
      "floor": "",
      "suite": "",
      "latitude": 41.898951,
      "longitude": -87.644642
    },
    "isp": "Comcast Cable Communications, LLC",
    "source_cable": null,
    "dest_cable": null
  },
  {
    "ip": "24.153.88.109",
    "latitude": 41.885,
    "longitude": -87.7845,
    "city": "Oak Park",
    "country": "US",
    "facility": {
      "id": 1730,
      "org_id": 682,
      "org_name": "Lumen Technologies Inc",
      "campus_id": null,
      "name": "Level(3) Chicago (Kingsbury)",
      "aka": "",
      "name_long": "",
      "website": "http://www.level3.com",
      "social_media": [
        {
          "service": "website",
          "identifier": "http://www.level3.com"
        }
      ],
      "clli": "",
      "rencode": "",
      "npanxx": "",
      "notes": "",
      "net_count": 15,
      "ix_count": 0,
      "sales_email": "",
      "sales_phone": "",
      "tech_email": "",
      "tech_phone": "",
      "available_voltage_services": [],
      "diverse_serving_substations": null,
      "property": "",
      "region_continent": "North America",
      "status_dashboard": "",
      "logo": null,
      "created": "2014-02-06T00:00:00Z",
      "updated": "2025-09-26T22:44:51Z",
      "status": "ok",
      "address1": "900 N Kingsbury St",
      "address2": "",
      "city": "Chicago",
      "country": "US",
      "state": "IL",
      "zipcode": "60606",
      "floor": "",
      "suite": "",
      "latitude": 41.898951,
      "longitude": -87.644642
    },
    "isp": "Comcast Cable Communications, LLC",
    "source_cable": null,
    "dest_cable": null
  },
  {
    "ip": "96.108.34.137",
    "latitude": 42.3256,
    "longitude": -87.8412,
    "city": "North Chicago",
    "country": "US",
    "facility": {
      "id": 1730,
      "org_id": 682,
      "org_name": "Lumen Technologies Inc",
      "campus_id": null,
      "name": "Level(3) Chicago (Kingsbury)",
      "aka": "",
      "name_long": "",
      "website": "http://www.level3.com",
      "social_media": [
        {
          "service": "website",
          "identifier": "http://www.level3.com"
        }
      ],
      "clli": "",
      "rencode": "",
      "npanxx": "",
      "notes": "",
      "net_count": 15,
      "ix_count": 0,
      "sales_email": "",
      "sales_phone": "",
      "tech_email": "",
      "tech_phone": "",
      "available_voltage_services": [],
      "diverse_serving_substations": null,
      "property": "",
      "region_continent": "North America",
      "status_dashboard": "",
      "logo": null,
      "created": "2014-02-06T00:00:00Z",
      "updated": "2025-09-26T22:44:51Z",
      "status": "ok",
      "address1": "900 N Kingsbury St",
      "address2": "",
      "city": "Chicago",
      "country": "US",
      "state": "IL",
      "zipcode": "60606",
      "floor": "",
      "suite": "",
      "latitude": 41.898951,
      "longitude": -87.644642
    },
    "isp": "Comcast Cable Communications, LLC",
    "source_cable": null,
    "dest_cable": null
  },
  {
    "ip": "96.110.40.49",
    "latitude": 33.9526,
    "longitude": -84.5499,
    "city": "Marietta",
    "country": "US",
    "facility": {
      "id": 3078,
      "org_id": 14515,
      "org_name": "H5 Data Centers",
      "campus_id": null,
      "name": "H5 Data Centers Atlanta",
      "aka": "",
      "name_long": "",
      "website": "http://h5datacenters.com/atlanta-colocation.html",
      "social_media": [
        {
          "service": "website",
          "identifier": "http://h5datacenters.com/atlanta-colocation.html"
        }
      ],
      "clli": "ATLNGAHP",
      "rencode": "",
      "npanxx": "404-986",
      "notes": "Carrier List: http://h5datacenters.com/carrier-list.html",
      "net_count": 4,
      "ix_count": 0,
      "sales_email": "",
      "sales_phone": "",
      "tech_email": "",
      "tech_phone": "",
      "available_voltage_services": [],
      "diverse_serving_substations": null,
      "property": "",
      "region_continent": "North America",
      "status_dashboard": "",
      "logo": null,
      "created": "2016-07-15T02:51:40Z",
      "updated": "2025-09-26T22:47:43Z",
      "status": "ok",
      "address1": "345 Courtland St NE",
      "address2": "",
      "city": "Atlanta",
      "country": "US",
      "state": "GA",
      "zipcode": "30308",
      "floor": "",
      "suite": "",
      "latitude": 33.765199,
      "longitude": -84.38365
    },
    "isp": "Comcast Cable Communications, LLC",
    "source_cable": null,
    "dest_cable": null
  },
  {
    "ip": "96.110.32.86",
    "latitude": 39.0152,
    "longitude": -77.4543,
    "city": "Ashburn",
    "country": "US",
    "facility": {
      "id": 1,
      "org_id": 2,
      "org_name": "Equinix, Inc.",
      "campus_id": 14,
      "name": "Equinix DC1-DC15, DC21 - Ashburn",
      "aka": "",
      "name_long": "",
      "website": "http://www.equinix.com/",
      "social_media": [
        {
          "service": "website",
          "identifier": "http://www.equinix.com/"
        }
      ],
      "clli": "ASBNVA",
      "rencode": "",
      "npanxx": "703-723",
      "notes": "",
      "net_count": 496,
      "ix_count": 8,
      "sales_email": "",
      "sales_phone": "",
      "tech_email": "",
      "tech_phone": "",
      "available_voltage_services": [],
      "diverse_serving_substations": null,
      "property": null,
      "region_continent": "North America",
      "status_dashboard": null,
      "logo": null,
      "created": "2010-07-29T00:00:00Z",
      "updated": "2025-09-26T22:42:02Z",
      "status": "ok",
      "address1": "21715 Filigree Ct",
      "address2": "Building F",
      "city": "Ashburn",
      "country": "US",
      "state": "VA",
      "zipcode": "20147-6205",
      "floor": "",
      "suite": "",
      "latitude": 39.016363,
      "longitude": -77.459023
    },
    "isp": "Comcast Cable Communications, LLC",
    "source_cable": null,
    "dest_cable": null
  },
  {
    "ip": "63.223.43.114",
    "latitude": 34.0549,
    "longitude": -118.243,
    "city": "Los Angeles",
    "country": "US",
    "facility": null,
    "isp": "Gateway Communications",
    "source_cable": null,
    "dest_cable": null
  },
  {
    "ip": "63.223.43.114",
    "latitude": 34.0549,
    "longitude": -118.243,
    "city": "Los Angeles",
    "country": "US",
    "facility": null,
    "isp": "Gateway Communications",
    "source_cable": {
      "id": "tabua",
      "entry_point": {
        "lat": 34.05348099999984,
        "lon": -118.24533600000012
      }
    },
    "dest_cable": null
  },
  {
    "ip": "150.107.73.53",
    "latitude": -33.8071,
    "longitude": 151.1289,
    "city": "Sydney",
    "country": "AU",
    "facility": {
      "id": 1660,
      "org_id": 7093,
      "org_name": "NEXTDC",
      "campus_id": null,
      "name": "NEXTDC S1",
      "aka": "",
      "name_long": "",
      "website": "http://www.nextdc.com",
      "social_media": [
        {
          "service": "website",
          "identifier": "http://www.nextdc.com"
        }
      ],
      "clli": "",
      "rencode": "",
      "npanxx": "",
      "notes": "",
      "net_count": 102,
      "ix_count": 3,
      "sales_email": "",
      "sales_phone": "",
      "tech_email": "",
      "tech_phone": "",
      "available_voltage_services": [],
      "diverse_serving_substations": null,
      "property": null,
      "region_continent": "Australia",
      "status_dashboard": null,
      "logo": null,
      "created": "2013-11-04T00:00:00Z",
      "updated": "2025-09-26T22:44:44Z",
      "status": "ok",
      "address1": "4 Eden Park Drive",
      "address2": "Macquarie Park",
      "city": "Sydney",
      "country": "AU",
      "state": "NSW",
      "zipcode": "2113",
      "floor": "",
      "suite": "",
      "latitude": -33.785263,
      "longitude": 151.13149
    },
    "isp": "Mammoth Media Pty Ltd",
    "source_cable": null,
    "dest_cable": {
      "id": "tabua",
      "entry_point": {
        "lat": -33.869695999999635,
        "lon": 151.20704000000026
      }
    }
  }
]

document.addEventListener('DOMContentLoaded', () => {
  const validateInput = () => {
    const hostPattern = /^[a-zA-Z0-9][a-zA-Z0-9\.-]*\.[a-zA-Z]{2,}$/;
    const host = inputField.value;
    console.log("invalid pattern")
    return hostPattern.test(host);
  }

  const doTraceroute = () => {
    const host = inputField.value
    const hops = 50 // update to use input later
    loadingWrapper.textContent = "loading..."
    fetch(
      `http://127.0.0.1:8000/api/traceroute?host=${host}&hops=${hops}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"}
    })
    .then(r => r.json())
    .then(tracerouteData => {
      loadingWrapper.textContent = `Done. ${JSON.stringify(tracerouteData)}`;
      console.log(tracerouteData);
      // TODO: handle time_info
      return tracerouteData["ip_addresses"];
    })
    .then(locations => fetch(
      `http://127.0.0.1:8000/api/getLocations`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(locations)
    }))
    .then(r => r.json())
    .then(locationOutput => {
      mapContainer.style.display = "flex";
      requestAnimationFrame(() => {
        showMap(locationOutput, 'map');
      });
    })
  };

  startButton.addEventListener('click', (e) => {
    const validInput = validateInput();
    if (validInput) {
      doTraceroute();
    }
  })
}
)

