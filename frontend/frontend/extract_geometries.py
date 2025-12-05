import json

# Read the GeoJSON file
with open('./cable-geo.json', 'r') as f:
    geojson_data = json.load(f)

# Create a dictionary mapping IDs to geometries
id_to_geometry = {}

for feature in geojson_data['features']:
    feature_id = feature['properties']['id']
    geometry = feature['geometry']
    id_to_geometry[feature_id] = geometry

# Write the mapping to a new JSON file
with open('./cable-map.json', 'w') as f:
    json.dump(id_to_geometry, f, indent=2)

print(f"Successfully created cable-map.json with {len(id_to_geometry)} entries")
