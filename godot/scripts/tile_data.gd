## Tile definitions — Taluva-style 3-hex tiles
## Each tile: 1 center hex (裂/crack) + 2 terrain hexes on adjacent directions
class_name TileDefs

## Terrain types and their display colors
const TERRAIN = {
	"crack":  { "label": "裂", "color": Color(0.545, 0.145, 0.0),   "glow": true },
	"road":   { "label": "路", "color": Color(0.722, 0.604, 0.353), "glow": false },
	"wild":   { "label": "野", "color": Color(0.227, 0.420, 0.208), "glow": false },
	"ruin":   { "label": "墟", "color": Color(0.478, 0.431, 0.353), "glow": false },
	"rock":   { "label": "岩", "color": Color(0.290, 0.290, 0.290), "glow": false },
	"water":  { "label": "水", "color": Color(0.165, 0.290, 0.478), "glow": false },
	"sigil":  { "label": "紋", "color": Color(0.227, 0.102, 0.290), "glow": false },
}

## Phase 1 terrain pool
const PHASE1_TERRAINS = ["road", "wild", "ruin"]


## Tile shape offsets: center (0,0) + two hexes at adjacent directions
static func tile_offsets(rotation: int) -> Array:
	var d1: int = rotation % 6
	var d2: int = (rotation + 1) % 6
	var dir1: Vector2i = HexUtil.DIR[d1]
	var dir2: Vector2i = HexUtil.DIR[d2]
	return [
		Vector2i(0, 0),                    # center (裂)
		Vector2i(dir1.x, dir1.y),          # terrain A
		Vector2i(dir2.x, dir2.y),          # terrain B
	]


## Create a tile definition
static func create_tile(id: String, terrain_a: String, terrain_b: String) -> Dictionary:
	return {
		"id": id,
		"terrains": ["crack", terrain_a, terrain_b],
		"rotation": 0,
	}


## Get world hex positions of a tile's 3 hexes given anchor (center) position
static func tile_hex_positions(tile: Dictionary, anchor_q: int, anchor_r: int) -> Array:
	var offsets: Array = tile_offsets(tile["rotation"])
	var result := []
	for i in offsets.size():
		var off: Vector2i = offsets[i]
		result.append({
			"q": anchor_q + off.x,
			"r": anchor_r + off.y,
			"terrain": tile["terrains"][i],
		})
	return result


## Generate a random hand of tiles for Phase 1
static func generate_hand(count: int) -> Array:
	var hand := []
	for i in count:
		var a: String = PHASE1_TERRAINS[randi() % PHASE1_TERRAINS.size()]
		var b: String = PHASE1_TERRAINS[randi() % PHASE1_TERRAINS.size()]
		hand.append(create_tile("tile-%d" % i, a, b))
	return hand
