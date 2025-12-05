import { initMap } from "./map.ts";
import { bbcCom, downloadOutput, fenwickHk, fenwickIps } from "./tests.ts";

const body = document.body;
const inputField = document.getElementById("trace-input") as HTMLInputElement;
const startButton = document.getElementById(
  "trace-button"
) as HTMLButtonElement;
const infoDisplay = document.getElementById(
  "loading-wrapper"
) as HTMLDivElement;
const staticInfoDisplay = document.getElementById(
  "static-info"
) as HTMLDivElement;
const controlsWrapper = document.getElementById(
  "controls-wrapper"
) as HTMLDivElement;
const nextButton = document.getElementById("next-button") as HTMLButtonElement;
const prevButton = document.getElementById("prev-button") as HTMLButtonElement;

const DEBUG_OUTPUT = false;

document.addEventListener("DOMContentLoaded", () => {
  const map = initMap("map");

  const showButtons = () => {
    body.style.justifyContent = "space-between";
    controlsWrapper.style.display = "flex";
  };

  const populateStaticInfo = (
    host: string,
    hopCount: number,
    longestDiff: number,
    totalTime: number
  ) => {
    staticInfoDisplay.innerText = `Target: ${host}
      Hops: ${hopCount}
      Max time between hops: ${longestDiff.toFixed(2)} ms
      Total time to target: ${totalTime.toFixed(2)} ms
      `;
    staticInfoDisplay.style.display = "block";
  };

  const doTraceroute = () => {
    const host = inputField.value;
    const hops = 50;
    let longestDiff: number;
    let totalTime: number;
    fetch(`http://127.0.0.1:8000/api/traceroute?host=${host}&hops=${hops}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((tracerouteData) => {
        const time_info = tracerouteData["time_info"];
        console.log(time_info);
        longestDiff = time_info["longest_diff"];
        totalTime = time_info["total_time"];
        return tracerouteData["ip_addresses"];
      })
      .then((locations) =>
        fetch(`http://127.0.0.1:8000/api/getLocations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(locations),
        })
      )
      .then((r) => r.json())
      .then(async (locationOutput) => {
        if (DEBUG_OUTPUT) {
          downloadOutput(host, locationOutput);
        }

        populateStaticInfo(host, locationOutput.length, longestDiff, totalTime)
        const locInfo = map.mapLocations(locationOutput);
        if (locInfo) {
          const location = locInfo.location;
          const locIdx = locInfo.index;
          const totalLen = locInfo.count;
          const fac = location.facility;
          const facName = fac ? fac["name"] : "Unavailable";
          const facOrg = fac && fac["org_name"] ? location.facility["org_name"] : "Unavailable"
          infoDisplay.innerText = `${locIdx + 1} / ${totalLen}:
            Location: ${location["city"]}, ${location["country"]}
            IP(s): ${location["ips"].join(", ")}
            ISP: ${location["isp"]}
            Data Facility Name: ${facName}
            Data Facility Org: ${facOrg}`;
          return location;
        }
      });
  };

  const validateInput = () => {
    const hostPattern = /^[a-zA-Z0-9][a-zA-Z0-9\.-]*\.[a-zA-Z]{2,}$/;
    const host = inputField.value;
    console.log("invalid pattern");
    return hostPattern.test(host);
  };

  startButton.addEventListener("click", () => {
    console.log("click logged!");
    const validInput = validateInput();
    if (validInput) {
      showButtons();
      doTraceroute();
      // testTraceroute();
    }
  });

  nextButton.addEventListener("click", () => {
    const locInfo = map.nextLocation();
    if (locInfo) {
      const location = locInfo.location;
      const locIdx = locInfo.index;
      const totalLen = locInfo.count;
      const fac = location.facility;
      const facName = fac ? fac["name"] : "Unavailable";
      const facOrg = fac && fac["org_name"] ? location.facility["org_name"] : "Unavailable"
      infoDisplay.innerText = `${locIdx + 1} / ${totalLen}:
        Location: ${location["city"]}, ${location["country"]}
        IP(s): ${location["ips"].join(", ")}
        ISP: ${location["isp"]}
        Data Facility Name: ${facName}
        Data Facility Org: ${facOrg}`;
        return location;
    }
  });

  prevButton.addEventListener("click", () => {
    const locInfo = map.prevLocation();
    if (locInfo) {
      const location = locInfo.location;
      const locIdx = locInfo.index;
      const totalLen = locInfo.count;
      const fac = location.facility;
      const facName = fac ? fac["name"] : "Unavailable";
      const facOrg = fac && fac["org_name"] ? location.facility["org_name"] : "Unavailable"
      infoDisplay.innerText = `${locIdx + 1} / ${totalLen}:
        Location: ${location["city"]}, ${location["country"]}
        IP(s): ${location["ips"].join(", ")}
        ISP: ${location["isp"]}
        Data Facility Name: ${facName}
        Data Facility Org: ${facOrg}`;
        return location;
    }
  });
});
