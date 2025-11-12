import asyncio
from typing import Union
import re
from fastapi import Body, FastAPI, HTTPException, status
import logging_config
from traceroute import get_route
from ip_location import IPLocation
from fastapi.middleware.cors import CORSMiddleware
from location_math import distance

from undersea_cables import CableMapper

# Create a logger instance
logging_config.setup_logging()
logger = logging_config.get_logger()

logger.debug("Logger active!")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cableMapper = CableMapper()

@app.get("/debug/user")
def check_user():
    """Log which user is running commands"""
    import os
    import subprocess
    return {
        "os_user": os.getenv("USER"),
        "effective_uid": os.geteuid(),
        "whoami": subprocess.run(["whoami"], capture_output=True, text=True).stdout.strip(),
    }

@app.get("/debug/sudoTest")
def test_sudo():
    """Temporary test to check if sudo works without password"""
    import subprocess
    try:
        result = subprocess.run(
            ["sudo", "tcptraceroute", "-m", "50", "-q", "1", "-w", "1", "google.com", "443"],
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            "returncode": result.returncode,
            "stdout": result.stdout[:500],
            "stderr": result.stderr[:500]
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug/cableData")
def get_cables():
    return cableMapper.cable_map

@app.post("/debug/getCables")
async def get_cables(latA: float, lonA: float, latB: float, lonB: float, tol: float):
    logger.debug(f"getCables input: {latA=}, {lonA=}, {latB=}, {lonB=}, {tol=}")
    return cableMapper.find_nearest_cable(latA, lonA, latB, lonB, tol=tol)

@app.post("/api/traceroute")
def traceroute(host: str, hops: int):
    """
    Perform a traceroute and return the list of visited IP addresses
    """

    # if host is not a web address does not start with alphas and end with .[a-zA-Z]{2,}, the address
    # is invalid. NOTE that IP addresses are not supported (functionality may change).

    # TODO: handle this on the frontend.
    if not host or not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9\.-]*\.[a-zA-Z]{2,}$', host):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="invalid web address"
        )

    return get_route(host, hops)

@app.post("/api/getLocations")
async def get_locations(ip_addresses: list = Body(...)):
    """
    Given a list of IP addresses, create complete IP
    Location objects and return them
    """

    # create IPLocation instance for each IP address in list
    ip_locations = await asyncio.gather(
        *[IPLocation.create(ip) for ip in ip_addresses]
    )

    # get facilities for each IPLocation object
    await asyncio.gather(
        *[ip_location.find_facility() for ip_location in ip_locations]
    )

    # use sliding window to setup cable info and compute distances
    for i in range(len(ip_locations) - 1):
        loc_A = ip_locations[i]
        loc_B = ip_locations[i + 1]
        cable_info = cableMapper.find_nearest_cable(
            loc_A.latitude,
            loc_A.longitude,
            loc_B.latitude,
            loc_B.longitude,
            tol=30
        )
        if cable_info:
            logger.debug(f"{cable_info=}")
            loc_A.set_source_cable_info(cable_info["id"], cable_info["endpoint_A"])
            loc_B.set_destination_cable_info(cable_info["id"], cable_info["endpoint_B"])

        dist = distance(
            loc_A.latitude,
            loc_A.longitude,
            loc_B.latitude,
            loc_B.longitude
        )

        loc_A.set_distance_from(dist)
        loc_B.set_distance_to(dist)

    completed_locations = [loc.get_frontend_format() for loc in ip_locations]
    return completed_locations













