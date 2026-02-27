## Hex math — axial coordinates, pointy-top orientation
## Reference: https://www.redblobgames.com/grids/hexagons/
class_name HexUtil

## sqrt(3) as literal — can't use sqrt() in const
const SQRT3 = 1.7320508075688772

## 6 neighbor directions in axial coords (pointy-top)
## Order: E, NE, NW, W, SW, SE
const DIR = [
	Vector2i(1, 0),   # 0: E
	Vector2i(1, -1),  # 1: NE
	Vector2i(0, -1),  # 2: NW
	Vector2i(-1, 0),  # 3: W
	Vector2i(-1, 1),  # 4: SW
	Vector2i(0, 1),   # 5: SE
]

## Hex size in world units
const HEX_SIZE = 1.0


static func hex_key(q: int, r: int) -> Vector2i:
	return Vector2i(q, r)


static func hex_neighbor(q: int, r: int, dir_idx: int) -> Vector2i:
	var d: Vector2i = DIR[dir_idx]
	return Vector2i(q + d.x, r + d.y)


static func hex_neighbors(q: int, r: int) -> Array:
	var result := []
	for d: Vector2i in DIR:
		result.append(Vector2i(q + d.x, r + d.y))
	return result


static func hex_distance(q1: int, r1: int, q2: int, r2: int) -> int:
	var dq: int = q1 - q2
	var dr: int = r1 - r2
	return (absi(dq) + absi(dq + dr) + absi(dr)) / 2


## Axial hex → 3D world position (pointy-top, Y=0 plane)
static func hex_to_world(q: int, r: int, size: float = HEX_SIZE) -> Vector3:
	var x: float = size * (SQRT3 * q + SQRT3 / 2.0 * r)
	var z: float = size * (1.5 * r)
	return Vector3(x, 0.0, z)


## 3D world position → nearest axial hex
static func world_to_hex(world_pos: Vector3, size: float = HEX_SIZE) -> Vector2i:
	var px: float = world_pos.x
	var pz: float = world_pos.z
	var q: float = (SQRT3 / 3.0 * px - 1.0 / 3.0 * pz) / size
	var r: float = (2.0 / 3.0 * pz) / size
	return hex_round(q, r)


## Round fractional axial to nearest hex
static func hex_round(q: float, r: float) -> Vector2i:
	var s: float = -q - r
	var rq: int = roundi(q)
	var rr: int = roundi(r)
	var rs: int = roundi(s)
	var dq: float = absf(rq - q)
	var dr: float = absf(rr - r)
	var ds: float = absf(rs - s)
	if dq > dr and dq > ds:
		rq = -rr - rs
	elif dr > ds:
		rr = -rq - rs
	return Vector2i(rq, rr)


## Vertices of a pointy-top hex at origin (XZ plane)
static func hex_vertices_3d(size: float = HEX_SIZE) -> Array:
	var verts := []
	for i in 6:
		var angle: float = deg_to_rad(60.0 * i - 30.0)
		verts.append(Vector3(size * cos(angle), 0.0, size * sin(angle)))
	return verts
