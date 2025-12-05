import asyncio
from typing import Union
import re
from fastapi import Body, FastAPI, HTTPException, status
import logging_config
from traceroute import get_route
from ip_location import IPLocation
from fastapi.middleware.cors import CORSMiddleware
from location_operations import merge_frontend_locations, populate_neighbor_information

# Create a logger instance
logging_config.setup_logging()
logger = logging_config.get_logger()

logger.debug("Logger active!")

# initialize app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/traceroute")
def traceroute(host: str, hops: int):
    """
    Perform a traceroute and return the list of visited IP addresses
    """

    # if host is not a web address does not start with alphas and end with .[a-zA-Z]{2,}, the address
    # is invalid. NOTE that IP addresses are not supported (functionality may change).

    # validate input is a valid web address
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
    Location objects and return frontend representations
    """

    # create IPLocation instance for each IP address in list
    ip_locations = await asyncio.gather(
        *[IPLocation.create(ip) for ip in ip_addresses]
    )

    ip_locations = [ip_location for ip_location in ip_locations if not ip_location.is_private]

    # get facilities for each IPLocation object
    await asyncio.gather(
        *[ip_location.find_facility() for ip_location in ip_locations]
    )

    # use sliding window to setup cable info and compute distances
    for i in range(len(ip_locations) - 1):
        # get sliding window locations
        loc_A = ip_locations[i]
        loc_B = ip_locations[i + 1]

        # populate neighbor info for locations A and B
        populate_neighbor_information(loc_A, loc_B)

    # convert locations to frontend format
    frontend_form_locations = [loc.get_frontend_format() for loc in ip_locations]

    # merge duplicate locations and return
    return merge_frontend_locations(frontend_form_locations)
