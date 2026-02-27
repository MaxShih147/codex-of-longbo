## 3D board renderer — creates hex prism MeshInstance3D nodes for placed tiles
extends Node3D

## Reference to game logic (set in _ready via parent)
var game: Node

## Map of Vector2i -> MeshInstance3D for placed cells
var cell_nodes: Dictionary = {}

## Collision bodies for hex picking
var collision_bodies: Dictionary = {}  # Vector2i -> StaticBody3D


func _ready() -> void:
	game = get_parent()
	game.tile_placed.connect(_on_tile_placed)


func _on_tile_placed(hexes: Array) -> void:
	for h: Dictionary in hexes:
		var q: int = h["q"]
		var r: int = h["r"]
		var terrain: String = h["terrain"]
		var key := Vector2i(q, r)

		if cell_nodes.has(key):
			continue

		var color: Color = TileDefs.TERRAIN[terrain]["color"]
		var world_pos: Vector3 = HexUtil.hex_to_world(q, r)

		# Create hex prism mesh
		var mesh_inst: MeshInstance3D = HexMesh.create_hex_instance(color, world_pos)
		add_child(mesh_inst)
		cell_nodes[key] = mesh_inst

		# Create collision body for raycast picking
		var body := StaticBody3D.new()
		body.position = world_pos
		body.set_meta("hex_q", q)
		body.set_meta("hex_r", r)

		var col_shape := CollisionShape3D.new()
		var shape := CylinderShape3D.new()
		shape.radius = HexUtil.HEX_SIZE * 0.87  # inner radius of hex
		shape.height = HexMesh.HEX_HEIGHT
		col_shape.shape = shape
		body.add_child(col_shape)

		add_child(body)
		collision_bodies[key] = body
