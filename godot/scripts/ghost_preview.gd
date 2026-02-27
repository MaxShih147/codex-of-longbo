## Ghost preview — semi-transparent hex prisms showing where a tile would be placed
extends Node3D

var ghost_meshes: Array = []
var game: Node


func _ready() -> void:
	# game_logic is grandparent (Main -> BoardView -> GhostPreview)
	game = get_parent().get_parent()
	game.ghost_updated.connect(_on_ghost_updated)
	game.selection_changed.connect(_on_selection_changed)


func _on_ghost_updated(hexes: Array, valid: bool) -> void:
	_clear_ghosts()

	if hexes.is_empty():
		return

	for h: Dictionary in hexes:
		var q: int = h["q"]
		var r: int = h["r"]
		var terrain: String = h["terrain"]
		var world_pos: Vector3 = HexUtil.hex_to_world(q, r)

		var color: Color
		if valid:
			color = TileDefs.TERRAIN[terrain]["color"]
		else:
			color = Color(0.8, 0.2, 0.2)  # red for invalid

		var mesh_inst: MeshInstance3D = HexMesh.create_hex_instance(color, world_pos, true)
		# Raise ghost slightly above board to avoid z-fighting
		mesh_inst.position.y += 0.02
		add_child(mesh_inst)
		ghost_meshes.append(mesh_inst)


func _on_selection_changed(index: int) -> void:
	if index < 0:
		_clear_ghosts()


func _clear_ghosts() -> void:
	for m: MeshInstance3D in ghost_meshes:
		m.queue_free()
	ghost_meshes.clear()
