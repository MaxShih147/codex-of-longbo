## Draws a mini 2D preview of a 3-hex tile inside a hand card
extends Control
class_name TileCardPreview

const MINI_HEX_SIZE = 16.0


func _draw() -> void:
	var tile: Dictionary = get_meta("tile") if has_meta("tile") else {}
	if tile.is_empty():
		return

	var terrains: Array = tile.get("terrains", [])
	var rotation: int = tile.get("rotation", 0)
	if terrains.is_empty():
		return

	var offsets: Array = TileDefs.tile_offsets(rotation)
	var center: Vector2 = size / 2.0

	for i in offsets.size():
		var off: Vector2i = offsets[i]
		# Axial -> 2D pixel (pointy-top, simplified)
		var px: float = MINI_HEX_SIZE * (HexUtil.SQRT3 * off.x + HexUtil.SQRT3 / 2.0 * off.y)
		var py: float = MINI_HEX_SIZE * (1.5 * off.y)
		var pos: Vector2 = center + Vector2(px, py)

		var terrain: String = terrains[i]
		var color: Color = TileDefs.TERRAIN[terrain]["color"]

		# Draw hexagon polygon
		var verts := PackedVector2Array()
		for v in 6:
			var angle: float = deg_to_rad(60.0 * v - 30.0)
			verts.append(pos + Vector2(MINI_HEX_SIZE * cos(angle),
				MINI_HEX_SIZE * sin(angle)))
		draw_colored_polygon(verts, color)

		# Draw terrain label
		var label_text: String = TileDefs.TERRAIN[terrain]["label"]
		var font: Font = ThemeDB.fallback_font
		var font_size: int = 11
		var text_size: Vector2 = font.get_string_size(label_text, HORIZONTAL_ALIGNMENT_CENTER,
			-1, font_size)
		draw_string(font, pos - text_size / 2.0 + Vector2(0, text_size.y * 0.35),
			label_text, HORIZONTAL_ALIGNMENT_CENTER, -1, font_size,
			Color(1, 1, 1, 0.8))
