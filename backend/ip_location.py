import json
import re
import httpx
from logging_config import get_logger
from api_keys import get_pdb_api_key
import asyncio
import haversine

logger = get_logger()

class IPLocation():
    @classmethod
    async def create(cls, ip):
        instance = cls(ip)
        await instance._get_geolocation()
        return instance

    def __init__(self, ip):
        self.ip = ip
        self.country_code = None
        self.region = None
        self.regionName = None
        self.city = None
        self.zip_code = None
        self.latitude = None
        self.longitude = None
        self.isp = None
        self.asn = None
        self._netfac_candidates = None
        self._fac_candidates = None
        self.fac = None

        # cable data if this address is the source of an undersea cable connection
        self.source_cable_info = None

        # cable data if this address is the destination of an undersea cable connection
        self.destination_cable_info = None

        # distance from previous node to current node
        self.distance_to = 0

        # distance from current node to next node
        self.distance_from = 0

        self._get_geolocation()

    def get_frontend_format(self):
        return {
            "ip": self.ip,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "city": self.city,
            "country": self.country_code,
            "facility": self.fac,
            "isp": self.isp,
            "source_cable": self.source_cable_info,
            "dest_cable": self.destination_cable_info,
            "distance_to": self.distance_to,
            "distance_from": self.distance_from,
        }

    async def find_facility(self):
        """
        Wrapper function for getting the nearest facility.
        NOTE: Flow of this is subject to change.
        """

        await self._find_netfac_candidates()
        await self._find_fac_candidates()
        self._compute_nearest_fac()

    async def _get_geolocation(self):
        """
        Uses ip-api to get location information about an instance's IP address

        Called asynchronously as part of class initialization
        """
        async with httpx.AsyncClient() as client:
            ip_api_response = await client.get(
                f"http://ip-api.com/json/{self.ip}"
            )
            geo_dict = ip_api_response.json()
            self.country = geo_dict.get("country")
            self.country_code = geo_dict.get("countryCode")
            self.region = geo_dict.get("region")
            self.regionName = geo_dict.get("regionName")
            self.city = geo_dict.get("city")
            self.zip_code = geo_dict.get("zip")
            self.latitude = geo_dict.get("lat")
            self.longitude = geo_dict.get("lon")
            self.isp = geo_dict.get("isp")

            asn_reg = re.compile(r'[0-9]+')
            self.asn = geo_dict.get("as")
            match = asn_reg.search(self.asn)
            if match:
                self.asn = match.group()
            else:
                logger.error(f"[_get_geolocation]: failed to match ASN in {self.asn}")
                return

    async def _find_netfac_candidates(self):
        """
        Uses PeeringDB to search for netfac objects using ASN and region
        """
        async with httpx.AsyncClient() as client:
            peering_db_response = await client.get(
                f"https://www.peeringdb.com/api/netfac?net__asn={self.asn}&fac__state={self.region}",
                headers={"Authorization": f"Api-Key {get_pdb_api_key()}"}
            )

            self._netfac_candidates = peering_db_response.json().get('data')

    @staticmethod
    async def _find_fac_by_id(fac_id):
        """
        Uses PeeringDB to get fac object using netfac object fac_id
        """
        async with httpx.AsyncClient() as client:
            peering_db_response = await client.get(
                f"https://www.peeringdb.com/api/fac?id={fac_id}",
                headers={"Authorization": f"Api-Key {get_pdb_api_key()}"}
            )
            data = peering_db_response.json().get('data')
            return data[0] if data else None

    async def _find_fac_candidates(self):
        fac_ids = [netfac["fac_id"] for netfac in self._netfac_candidates]

        self._fac_candidates = await asyncio.gather(
            *[self._find_fac_by_id(fac_id) for fac_id in fac_ids]
        )

    def _compute_nearest_fac(self):
        """
        Uses haversine distance formula to find the nearest candidate facility
        to original IP location
        """

        min_dist = float("inf")
        nearest_fac = None
        for fac in self._fac_candidates:
            fac_pos = (fac['latitude'], fac['longitude'])
            ip_pos = (self.latitude, self.longitude)

            distance = abs(haversine.haversine(fac_pos, ip_pos))
            if distance < min_dist:
                nearest_fac = fac

        self.fac = nearest_fac

    def set_source_cable_info(self, cable_id, entry_point):
        self.source_cable_info = {"id": cable_id, "entry_point": entry_point}

    def set_destination_cable_info(self, cable_id, entry_point):
        self.destination_cable_info = {"id": cable_id, "entry_point": entry_point}

    def set_distance_to(self, dist):
        self.distance_to = dist

    def set_distance_from(self, dist):
        self.distance_from = dist









