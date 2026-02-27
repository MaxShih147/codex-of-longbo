## Game state and logic — root node of the scene
extends Node3D

signal tile_placed(hexes: Array)       # array of {q, r, terrain}
signal player_moved(q: int, r: int)
signal hand_changed(hand: Array)
signal ghost_updated(hexes: Array, valid: bool)
signal selection_changed(index: int)

const INITIAL_HAND_SIZE = 7

var board: BoardState
var hand: Array = []
var player_pos: Vector2i = Vector2i.ZERO
var selected_tile: int = -1
var ghost_anchor: Variant = null  # Vector2i or null
var ghost_valid: bool = false
var moves: int = 0
var tiles_placed: int = 0


func _ready() -> void:
	board = BoardState.new()
	hand = TileDefs.generate_hand(INITIAL_HAND_SIZE)

	# Place starting tile at origin
	var start_tile: Dictionary = TileDefs.create_tile("start", "road", "wild")
	start_tile["rotation"] = 0
	board.place_tile(start_tile, 0, 0)

	# Defer signal emissions to after all children are ready
	call_deferred("_emit_initial_state", start_tile)


func _emit_initial_state(start_tile: Dictionary) -> void:
	var start_hexes: Array = TileDefs.tile_hex_positions(start_tile, 0, 0)
	tile_placed.emit(start_hexes)
	player_moved.emit(0, 0)
	hand_changed.emit(hand)
	_update_hud()


func _update_hud() -> void:
	var hud: Node = get_node_or_null("UILayer/HUD")
	if hud == null:
		return
	hud.get_node("StepsLabel").text = "步數: %d" % moves
	hud.get_node("HandLabel").text = "手牌: %d" % hand.size()
	hud.get_node("BoardLabel").text = "格數: %d" % board.cells.size()
	if selected_tile >= 0:
		hud.get_node("SelectedLabel").text = "已選: #%d" % (selected_tile + 1)
	else:
		hud.get_node("SelectedLabel").text = ""


func select_tile(index: int) -> void:
	if index >= 0 and index < hand.size():
		selected_tile = index
	else:
		selected_tile = -1
	ghost_anchor = null
	selection_changed.emit(selected_tile)
	_update_hud()


func rotate_tile() -> void:
	if selected_tile < 0:
		return
	var tile: Dictionary = hand[selected_tile]
	tile["rotation"] = (tile["rotation"] + 1) % 6
	# Refresh ghost if active
	if ghost_anchor != null:
		update_ghost(ghost_anchor.x, ghost_anchor.y)


func update_ghost(anchor_q: int, anchor_r: int) -> void:
	if selected_tile < 0:
		ghost_anchor = null
		ghost_updated.emit([], false)
		return
	ghost_anchor = Vector2i(anchor_q, anchor_r)
	var tile: Dictionary = hand[selected_tile]
	ghost_valid = board.can_place(tile, anchor_q, anchor_r,
		player_pos.x, player_pos.y)
	var hexes: Array = TileDefs.tile_hex_positions(tile, anchor_q, anchor_r)
	ghost_updated.emit(hexes, ghost_valid)


func try_place() -> bool:
	if selected_tile < 0 or ghost_anchor == null or not ghost_valid:
		return false

	var tile: Dictionary = hand[selected_tile]
	var q: int = ghost_anchor.x
	var r: int = ghost_anchor.y

	# Place the tile
	board.place_tile(tile, q, r)
	var hexes: Array = TileDefs.tile_hex_positions(tile, q, r)
	tile_placed.emit(hexes)

	# Move player to adjacent hex in the new tile
	var target: Variant = board.find_move_target(tile, q, r, player_pos.x, player_pos.y)
	if target != null:
		player_pos = target
		player_moved.emit(target.x, target.y)

	# Remove tile from hand
	hand.remove_at(selected_tile)
	selected_tile = -1
	ghost_anchor = null
	moves += 1
	tiles_placed += 1

	# Replenish hand if empty
	if hand.is_empty():
		hand = TileDefs.generate_hand(INITIAL_HAND_SIZE)

	hand_changed.emit(hand)
	selection_changed.emit(selected_tile)
	_update_hud()
	return true


## Walk to an adjacent board hex (no tile selected)
func try_walk(q: int, r: int) -> bool:
	if not board.can_walk(q, r, player_pos.x, player_pos.y):
		return false
	player_pos = Vector2i(q, r)
	player_moved.emit(q, r)
	moves += 1
	_update_hud()
	return true
