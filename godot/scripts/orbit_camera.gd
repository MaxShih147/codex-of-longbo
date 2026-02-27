## Orbit camera — right-drag rotate, scroll zoom, middle-drag pan
extends Camera3D

## Orbit settings
@export var orbit_target: Vector3 = Vector3.ZERO
@export var orbit_distance: float = 15.0
@export var orbit_yaw: float = 0.0       # radians
@export var orbit_pitch: float = -0.785   # -45° (looking down)
@export var min_pitch: float = -1.4       # ~-80°
@export var max_pitch: float = -0.15      # ~-9°
@export var min_distance: float = 5.0
@export var max_distance: float = 40.0
@export var zoom_speed: float = 1.5
@export var rotate_sensitivity: float = 0.005
@export var pan_sensitivity: float = 0.02

var _is_rotating: bool = false
var _is_panning: bool = false
var _prev_mouse: Vector2 = Vector2.ZERO

## Reference to game logic
var game: Node


func _ready() -> void:
	game = get_parent()
	_update_transform()


func _update_transform() -> void:
	# Spherical coordinates -> camera position
	var offset := Vector3.ZERO
	offset.x = orbit_distance * cos(orbit_pitch) * sin(orbit_yaw)
	offset.y = orbit_distance * -sin(orbit_pitch)
	offset.z = orbit_distance * cos(orbit_pitch) * cos(orbit_yaw)
	position = orbit_target + offset
	look_at(orbit_target, Vector3.UP)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		match mb.button_index:
			MOUSE_BUTTON_RIGHT:
				_is_rotating = mb.pressed
				_prev_mouse = mb.position
			MOUSE_BUTTON_MIDDLE:
				_is_panning = mb.pressed
				_prev_mouse = mb.position
			MOUSE_BUTTON_WHEEL_UP:
				if mb.pressed:
					orbit_distance = max(min_distance, orbit_distance - zoom_speed)
					_update_transform()
			MOUSE_BUTTON_WHEEL_DOWN:
				if mb.pressed:
					orbit_distance = min(max_distance, orbit_distance + zoom_speed)
					_update_transform()
			MOUSE_BUTTON_LEFT:
				if mb.pressed:
					_handle_left_click(mb.position)

	elif event is InputEventMouseMotion:
		var mm: InputEventMouseMotion = event as InputEventMouseMotion
		if _is_rotating:
			var delta: Vector2 = mm.position - _prev_mouse
			_prev_mouse = mm.position
			orbit_yaw -= delta.x * rotate_sensitivity
			orbit_pitch = clamp(orbit_pitch - delta.y * rotate_sensitivity,
				min_pitch, max_pitch)
			_update_transform()
		elif _is_panning:
			var delta: Vector2 = mm.position - _prev_mouse
			_prev_mouse = mm.position
			# Pan along camera's local XZ in world space
			var right: Vector3 = global_transform.basis.x
			var forward: Vector3 = Vector3(global_transform.basis.z.x, 0,
				global_transform.basis.z.z).normalized()
			orbit_target -= right * delta.x * pan_sensitivity
			orbit_target += forward * delta.y * pan_sensitivity
			_update_transform()
		else:
			# Hover — update ghost preview
			_handle_hover(mm.position)

	elif event is InputEventKey:
		var ek: InputEventKey = event as InputEventKey
		if not ek.pressed:
			return
		match ek.keycode:
			KEY_R:
				game.rotate_tile()
			KEY_ESCAPE:
				game.select_tile(-1)
			KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6, KEY_7:
				var idx: int = ek.keycode - KEY_1
				game.select_tile(idx)


func _handle_left_click(screen_pos: Vector2) -> void:
	var hex: Variant = _raycast_hex(screen_pos)
	if hex == null:
		return

	if game.selected_tile >= 0:
		game.update_ghost(hex.x, hex.y)
		game.try_place()
	else:
		game.try_walk(hex.x, hex.y)


func _handle_hover(screen_pos: Vector2) -> void:
	if game.selected_tile < 0:
		return
	var hex: Variant = _raycast_hex(screen_pos)
	if hex != null:
		game.update_ghost(hex.x, hex.y)


func _raycast_hex(screen_pos: Vector2) -> Variant:
	var from: Vector3 = project_ray_origin(screen_pos)
	var dir: Vector3 = project_ray_normal(screen_pos)
	var space: PhysicsDirectSpaceState3D = get_world_3d().direct_space_state
	var query: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.create(from, from + dir * 100.0)
	var result: Dictionary = space.intersect_ray(query)

	if result.is_empty():
		# Fallback: intersect with Y=0 plane
		if abs(dir.y) < 0.001:
			return null
		var t: float = -from.y / dir.y
		if t < 0:
			return null
		var hit_pos: Vector3 = from + dir * t
		return HexUtil.world_to_hex(hit_pos)

	var collider: Object = result["collider"]
	if collider is StaticBody3D and collider.has_meta("hex_q"):
		return Vector2i(collider.get_meta("hex_q"), collider.get_meta("hex_r"))

	return null
