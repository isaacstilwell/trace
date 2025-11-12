from haversine import haversine

def distance(lat_A, lon_A, lat_B, lon_B):
    pos_A = (lat_A, lon_A)
    pos_B = (lat_B, lon_B)
    dist = abs(haversine(pos_A, pos_B))
    return dist
