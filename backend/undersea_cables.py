import json
import timeit
from logging_config import get_logger
from haversine import haversine

logger = get_logger()
cable_json_path = "./cable-geo.json"

class CableMapper:
    def __init__(self):
        self.cable_map = self._get_cable_map(cable_json_path)

    def _map_cable_endpoints(self, cable_data):
        """
        Maps cable id (ascii name) to all endpoints in cable path

        Inputs:
            cable_data (dict): unpacked json of cable data via www.submarinecablemap.com API

        Outputs:
            cable_map (dict): mapping of cable id to all endpoints in cable path.
                cable paths may have >2 endpoints if cable has multiple docking points
        """
        # NOTE(s): there is a tradeoff here with how cable endpoints are being stored. Cables with many
        # docking points typically only have one docking point per subpath. However, which of the endpoints
        # (first or last) is the docking point is ambigious and fluctuates for different cables in the JSON
        # as such, the code currently gets both potential docking points. The code does this instead of
        # implementing complicated and time consuming logic to determine which endpoint is the docking point
        # because it's unlikely that a datacenter will ever find itself close to the endpoint that isn't a
        # docking point anyways, since that endpoint will always be further from land than the endpoint that
        # is a docking point, and there are no undersea datacenters (yet).

        features = cable_data["features"]
        # features should be an array of undersea cables
        assert type(features) == list

        cable_map = {}
        for cable_info in features:
            # every undersea cable has a name
            cid = cable_info["properties"]["id"]

            # some cables have multiple starting and ending points when they dock at more than 2 locations.
            # each subpath has at least one docking location
            cable_subpaths = cable_info["geometry"]["coordinates"]

            endpoints = []
            for sp in cable_subpaths:
                # we only need the endpoints, the structure of the json guarantees that a cable never doubles
                # back on itself in the same subpath

                # start point is the first point in the subpath
                start_point = sp[0]

                # end point is the last point in the subpath
                end_point = sp[-1]

                # each point in geometry array is [lon, lat]. unpack to avoid order confusion.
                start = {"lat": start_point[1], "lon": start_point[0]}
                end = {"lat": end_point[1], "lon": end_point[0]}

                endpoints.append(start)
                endpoints.append(end)

            endpoints = tuple(endpoints)

            # map name of cable to start and endpoints
            cable_map[cid] = endpoints

        return cable_map

    def find_nearest_cable(self, lat_A, lon_A, lat_B, lon_B, tol):
        """
        uses the haversine formula to determine the closest undersea cable to two ping locations

        inputs:
            lat_A (float): latitude of the first IP location
            lon_A (float): longitude of the first IP location
            lat_B (float): latitude of the second IP location
            lon_B (float): longitude of the second IP location
            tol (float): largest acceptable distance from the closest cable

        outputs:
            None if the minimum average distance is greater than tol;
            (float, string, dict, dict): tuple containing the minimum
                average distance between the two endpoints and a cable,
                the id of the closest cable, the nearest endpoint in
                that cable to the first IP location, and the nearest
                endpoint in that cable to the second IP location
        """
        pos_A = (lat_A, lon_A)
        pos_B = (lat_B, lon_B)

        min_avg_dist = float("inf")
        nearest_cable_id = None
        nearest_endpoint_A = None
        nearest_endpoint_B = None

        for id, endpoints in self.cable_map.items():
            min_distance_A = float("inf")
            min_endpoint_A = None
            min_distance_B = float("inf")
            min_endpoint_B = None
            for endpoint in endpoints:
                endpoint_pos = (endpoint["lat"], endpoint["lon"])

                distance_A = abs(haversine(pos_A, endpoint_pos))
                distance_B = abs(haversine(pos_B, endpoint_pos))

                if distance_A < min_distance_A:
                    min_distance_A = distance_A
                    min_endpoint_A = endpoint

                if distance_B < min_distance_B:
                    min_distance_B = distance_B
                    min_endpoint_B = endpoint

            avg_dist = (min_distance_A + min_distance_B) / 2

            # if the endpoints are the same, the datacenters are not connected by the cable.
            if min_endpoint_B != min_endpoint_A and avg_dist < min_avg_dist:
                min_avg_dist = avg_dist
                nearest_cable_id = id
                nearest_endpoint_A = min_endpoint_A
                nearest_endpoint_B = min_endpoint_B

        return {
            "id": nearest_cable_id,
            "endpoint_A": nearest_endpoint_A,
            "endpoint_B": nearest_endpoint_B
        } if min_avg_dist <= tol else None

    def _get_cable_map(self, path):
        with open(path, 'r') as f:
            data = json.load(f)

        return self._map_cable_endpoints(data)