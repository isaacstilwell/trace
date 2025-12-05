from haversine import haversine
from undersea_cables import CableMapper
from logging_config import get_logger

logger = get_logger()
cableMapper = CableMapper()

def _distance(lat_A, lon_A, lat_B, lon_B):
    """
    Computes the haversine distance between two locations A and B
    given the latitude and longitude for each

    :param lat_A: Latitude of location A
    :param lon_A: Longitude of location A
    :param lat_B: Latitude of location B
    :param lon_B: Longitude of location B
    """
    pos_A = (lat_A, lon_A)
    pos_B = (lat_B, lon_B)
    dist = abs(haversine(pos_A, pos_B))
    return dist

def populate_neighbor_information(loc_A, loc_B):
    """
    Finds nearest valid undersea cable connection between two locations
    and computes the haversine distance between two locations

    :param loc_A: Location object A
    :param loc_B: Location object B
    """
    # find info about nearest cable
    cable_info = cableMapper.find_nearest_cable(
        loc_A.latitude,
        loc_A.longitude,
        loc_B.latitude,
        loc_B.longitude,
        tol=30
    )

    # location A is the source of the cable connection and location B is the destination
    if cable_info:
        logger.info(f"{cable_info=}") #TODO: Remove
        loc_A.set_source_cable_info(cable_info["id"], cable_info["endpoint_A"])
        loc_B.set_destination_cable_info(cable_info["id"], cable_info["endpoint_B"])

    # compute haversine distance between locations A and B
    dist = _distance(
        loc_A.latitude,
        loc_A.longitude,
        loc_B.latitude,
        loc_B.longitude
    )

    # the computed distance is the distance leaving location A and coming to location B
    loc_A.set_distance_from(dist)
    loc_B.set_distance_to(dist)

def merge_frontend_locations(frontend_locations):
    """
    Merges duplicate locations in frontend format

    inputs:
        frontend_locations (list): list of unmerged locations in frontend format

    outputs (list): list of merged locations in frontend format. locations are only
        merged if they have the same network facility or the same longitude and latitude.
    """

    # initialize sliding window
    merged_locations = []
    idx1 = 0
    idx2 = 1

    while idx1 in range(len(frontend_locations)):
        loc1 = frontend_locations[idx1]

        while idx2 in range(len(frontend_locations)):
            loc2 = frontend_locations[idx2]

            # extend dynamic sliding window while locations are equivalent
            if _check_same_location(loc1, loc2):

                # add ip(s) in loc2 to loc1
                loc1["ips"].extend(loc2["ips"])

                # if loc2 is a source of a cable transfer, loc1 becomes the source by proxy
                if loc2["source_cable"]:
                    loc1["source_cable"] = loc2["source_cable"]

                # since they are the same location, loc1 should have 0 distance_from
                if loc2["distance_from"] > loc1["distance_from"]:
                    loc1["distance_from"] = loc2["distance_from"]

                # increment sliding window
                idx2 += 1
            else:
                # if the locations are different, we can move onto the next window
                break
        # we've considered all consecutive equivalent locations for loc1, so it is now a
        # merged location
        merged_locations.append(loc1)

        # since loc2 ≠ loc1, we consider loc2 now
        idx1 = idx2
        idx2 = idx1 + 1

    return merged_locations

def _check_same_location(loc1, loc2):
    # if the facilities are the same, they have the same location
    if loc2["facility"] != None and loc2["facility"] == loc1["facility"]:
        return True

    # if the longitude and latitude are the same, they have the same location
    elif loc2["latitude"] == loc1["latitude"] and loc2["longitude"] == loc1["longitude"]:
        return True

    # otherwise, they do not have the same location
    else:
        return False