import asyncio
from typing import Union
import re
from fastapi import Body, FastAPI, HTTPException, status
import logging_config
from traceroute import get_route
from ip_location import IPLocation

# Create a logger instance
logging_config.setup_logging()
logger = logging_config.get_logger()

logger.debug("Logger active!")

app = FastAPI()

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
        *[ip_location.get_facility() for ip_location in ip_locations]
    )

    # TODO: make reduce data before returning - maybe write a getter
    # for the class that returns the frontend facing info only
    return ip_locations













