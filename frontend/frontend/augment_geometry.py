import json

# Read the GeoJSON file
with open('./cable-geo-2.json', 'r') as f:
    geojson_data = json.load(f)

# Create a dictionary mapping IDs to geometries
id_to_geometry = {}

augmented_subcables = []

for feature in geojson_data['features']:
    subcables = feature['geometry']
    for subcable in subcables:
        non_endpoints = subcable[1:-1]
        split_idxs = []
        for s in subcables:
            assert type(s) == list
            if s == subcable:
                continue
            (start_lon, start_lat), (end_lon, end_lat) = s[0], s[-1]
            for idx, (lon, lat) in enumerate(non_endpoints):
                if (lon == start_lon and lat == start_lat) or (lon == end_lon and lat == end_lat):
                    split_idxs.append(idx)
    ## split between idxs etc. TODO later....






# Write the mapping to a new JSON file
with open('./cable-map.json', 'w') as f:
    json.dump(id_to_geometry, f, indent=2)

print(f"Successfully created cable-map.json with {len(id_to_geometry)} entries")
