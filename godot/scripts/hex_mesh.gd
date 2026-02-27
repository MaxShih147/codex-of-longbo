## Generates a pointy-top hexagonal prism mesh using SurfaceTool
class_name HexMesh

const HEX_HEIGHT = 0.3  # prism thickness


## Build a hexagonal prism mesh with given color
static func create_hex_prism(color: Color, size: float = HexUtil.HEX_SIZE,
		height: float = HEX_HEIGHT) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)

	# Calculate 6 vertices (pointy-top)
	var top_y: float = height / 2.0
	var bot_y: float = -height / 2.0
	var top_verts := []
	var bot_verts := []

	for i in 6:
		var angle: float = deg_to_rad(60.0 * i - 30.0)
		var x: float = size * cos(angle)
		var z: float = size * sin(angle)
		top_verts.append(Vector3(x, top_y, z))
		bot_verts.append(Vector3(x, bot_y, z))

	var center_top := Vector3(0, top_y, 0)
	var center_bot := Vector3(0, bot_y, 0)

	# --- Top face (6 triangles, fan from center) ---
	st.set_normal(Vector3.UP)
	st.set_color(color)
	for i in 6:
		st.add_vertex(center_top)
		st.add_vertex(top_verts[i])
		st.add_vertex(top_verts[(i + 1) % 6])

	# --- Bottom face (6 triangles, fan from center, reversed winding) ---
	st.set_normal(Vector3.DOWN)
	var dark_bottom: Color = color.darkened(0.4)
	st.set_color(dark_bottom)
	for i in 6:
		st.add_vertex(center_bot)
		st.add_vertex(bot_verts[(i + 1) % 6])
		st.add_vertex(bot_verts[i])

	# --- Side faces (6 quads = 12 triangles) ---
	for i in 6:
		var next: int = (i + 1) % 6
		# Side face normal: outward from center
		var side_mid: Vector3 = (top_verts[i] + top_verts[next]) / 2.0
		var side_normal: Vector3 = Vector3(side_mid.x, 0, side_mid.z).normalized()
		st.set_normal(side_normal)

		var dark_side: Color = color.darkened(0.25)
		st.set_color(dark_side)

		# Triangle 1
		st.add_vertex(top_verts[i])
		st.add_vertex(bot_verts[i])
		st.add_vertex(bot_verts[next])
		# Triangle 2
		st.add_vertex(top_verts[i])
		st.add_vertex(bot_verts[next])
		st.add_vertex(top_verts[next])

	return st.commit()


## Create a StandardMaterial3D for a hex with given color
static func create_material(color: Color, transparent: bool = false) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.vertex_color_use_as_albedo = true
	if transparent:
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.albedo_color.a = 0.5
	return mat


## Create a complete MeshInstance3D for a hex cell
static func create_hex_instance(color: Color, world_pos: Vector3,
		transparent: bool = false) -> MeshInstance3D:
	var mesh_inst := MeshInstance3D.new()
	mesh_inst.mesh = create_hex_prism(color)
	mesh_inst.material_override = create_material(color, transparent)
	mesh_inst.position = world_pos
	return mesh_inst
