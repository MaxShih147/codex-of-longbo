## Player piece — a simple 3D capsule representing 龍伯
extends Node3D

var game: Node
var mesh_instance: MeshInstance3D


func _ready() -> void:
	game = get_parent()
	game.player_moved.connect(_on_player_moved)

	# Create capsule mesh
	mesh_instance = MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.25
	capsule.height = 0.8
	mesh_instance.mesh = capsule

	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.9, 0.85, 0.6)  # warm gold
	mat.emission_enabled = true
	mat.emission = Color(0.9, 0.85, 0.6)
	mat.emission_energy_multiplier = 0.3
	mesh_instance.material_override = mat

	# Raise above the hex surface
	mesh_instance.position.y = HexMesh.HEX_HEIGHT / 2.0 + 0.4
	add_child(mesh_instance)


func _on_player_moved(q: int, r: int) -> void:
	var world_pos: Vector3 = HexUtil.hex_to_world(q, r)
	position = world_pos
