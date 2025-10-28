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

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/api/traceroute")
def traceroute(host: str, hops: int):
    # if host is not a web address does not start with alphas and end with .**[2+], the address
    # is invalid. NOTE that IP addresses are not supported currently.

    # TODO: handle this on the frontend.
    if not host or not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9\.-]*\.[a-zA-Z]{2,}$', host):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="invalid web address"
        )

    return get_route(host, hops)

@app.post("/api/getLocations")
async def get_locations(ip_addresses: list = Body(...)):
    ip_locations = await asyncio.gather(
        *[IPLocation.create(ip) for ip in ip_addresses]
    )

    # await ip_locations[0].get_facility()
    await asyncio.gather(
        *[ip_location.get_facility() for ip_location in ip_locations]
    )
    return ip_locations













