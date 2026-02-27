## Board state — tracks placed hexes on the infinite grid
class_name BoardState

var cells: Dictionary = {}   # Vector2i -> { terrain, tile_id, height, q, r }
var tile_count: int = 0


func place_tile(tile: Dictionary, anchor_q: int, anchor_r: int) -> void:
	var hexes: Array = TileDefs.tile_hex_positions(tile, anchor_q, anchor_r)
	for h: Dictionary in hexes:
		var key := Vector2i(h["q"], h["r"])
		cells[key] = {
			"q": h["q"],
			"r": h["r"],
			"terrain": h["terrain"],
			"tile_id": tile["id"],
			"height": 0,
		}
	tile_count += 1


## Check if a tile can be placed at anchor position
## Rules: no overlap, adjacency with terrain color matching (crack is wildcard),
## at least one hex adjacent to player
func can_place(tile: Dictionary, anchor_q: int, anchor_r: int,
		player_q: int, player_r: int) -> bool:
	var hexes: Array = TileDefs.tile_hex_positions(tile, anchor_q, anchor_r)

	# Check no overlap
	for h: Dictionary in hexes:
		if cells.has(Vector2i(h["q"], h["r"])):
			return false

	# Check adjacency + terrain color matching
	# 裂 (crack) is a wildcard — matches any terrain
	var has_neighbor := false
	for h: Dictionary in hexes:
		for n: Vector2i in HexUtil.hex_neighbors(h["q"], h["r"]):
			if cells.has(n):
				has_neighbor = true
				var cell: Dictionary = cells[n]
				if cell["terrain"] != "crack" and h["terrain"] != "crack" \
						and cell["terrain"] != h["terrain"]:
					return false
	if not has_neighbor:
		return false

	# Check at least one hex is adjacent to the player
	var player_nbrs: Array = HexUtil.hex_neighbors(player_q, player_r)
	var player_nbr_set := {}
	for n: Vector2i in player_nbrs:
		player_nbr_set[n] = true

	for h: Dictionary in hexes:
		if player_nbr_set.has(Vector2i(h["q"], h["r"])):
			return true

	return false


## Check if player can walk to a hex
func can_walk(target_q: int, target_r: int, player_q: int, player_r: int) -> bool:
	if not cells.has(Vector2i(target_q, target_r)):
		return false
	for n: Vector2i in HexUtil.hex_neighbors(player_q, player_r):
		if n.x == target_q and n.y == target_r:
			return true
	return false


## Find which hex in the new tile the player should move to
func find_move_target(tile: Dictionary, anchor_q: int, anchor_r: int,
		player_q: int, player_r: int) -> Variant:
	var hexes: Array = TileDefs.tile_hex_positions(tile, anchor_q, anchor_r)
	var player_nbrs: Array = HexUtil.hex_neighbors(player_q, player_r)
	var player_nbr_set := {}
	for n: Vector2i in player_nbrs:
		player_nbr_set[n] = true

	# Prefer the center hex (crack) if adjacent
	for h: Dictionary in hexes:
		if h["terrain"] == "crack" and player_nbr_set.has(Vector2i(h["q"], h["r"])):
			return Vector2i(h["q"], h["r"])
	# Otherwise first adjacent hex
	for h: Dictionary in hexes:
		if player_nbr_set.has(Vector2i(h["q"], h["r"])):
			return Vector2i(h["q"], h["r"])
	return null
