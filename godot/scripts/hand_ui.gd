## Hand UI — displays the player's hand of tiles at the bottom of the screen
extends Control

var game: Node
var card_container: HBoxContainer
var cards: Array = []
var selected_index: int = -1

const CARD_WIDTH = 120
const CARD_HEIGHT = 120
const CARD_MARGIN = 8
const HEX_MINI_SIZE = 16.0


func _ready() -> void:
	# Find game_logic node (Main)
	game = get_node("/root/Main")
	game.hand_changed.connect(_on_hand_changed)
	game.selection_changed.connect(_on_selection_changed)

	card_container = HBoxContainer.new()
	card_container.alignment = BoxContainer.ALIGNMENT_CENTER
	card_container.set_anchors_preset(PRESET_FULL_RECT)
	card_container.add_theme_constant_override("separation", CARD_MARGIN)
	add_child(card_container)


func _on_hand_changed(hand: Array) -> void:
	# Clear existing cards
	for c in cards:
		c.queue_free()
	cards.clear()

	for i in hand.size():
		var tile: Dictionary = hand[i]
		var card := _create_card(tile, i)
		card_container.add_child(card)
		cards.append(card)

	_update_highlight()


func _on_selection_changed(index: int) -> void:
	selected_index = index
	_update_highlight()


func _create_card(tile: Dictionary, index: int) -> Panel:
	var panel := Panel.new()
	panel.custom_minimum_size = Vector2(CARD_WIDTH, CARD_HEIGHT)

	# Background style
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.15, 0.15, 0.22, 0.9)
	style.border_width_bottom = 2
	style.border_width_top = 2
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_color = Color(0.3, 0.3, 0.4)
	style.corner_radius_top_left = 6
	style.corner_radius_top_right = 6
	style.corner_radius_bottom_left = 6
	style.corner_radius_bottom_right = 6
	panel.add_theme_stylebox_override("panel", style)

	# Tile preview using colored rectangles
	var preview := Control.new()
	preview.set_anchors_preset(PRESET_FULL_RECT)
	preview.set_script(TileCardPreview)
	preview.set_meta("tile", tile)
	panel.add_child(preview)

	# Tile number label
	var label := Label.new()
	label.text = str(index + 1)
	label.position = Vector2(4, 2)
	label.add_theme_font_size_override("font_size", 12)
	label.add_theme_color_override("font_color", Color(0.6, 0.6, 0.7))
	panel.add_child(label)

	# Click handler
	panel.gui_input.connect(func(event: InputEvent) -> void:
		if event is InputEventMouseButton and event.pressed and \
				event.button_index == MOUSE_BUTTON_LEFT:
			game.select_tile(index)
	)

	return panel


func _update_highlight() -> void:
	for i in cards.size():
		var panel: Panel = cards[i]
		var style: StyleBoxFlat = panel.get_theme_stylebox("panel").duplicate()
		if i == selected_index:
			style.border_color = Color(1.0, 0.85, 0.3)
			style.border_width_bottom = 3
			style.border_width_top = 3
			style.border_width_left = 3
			style.border_width_right = 3
		else:
			style.border_color = Color(0.3, 0.3, 0.4)
			style.border_width_bottom = 2
			style.border_width_top = 2
			style.border_width_left = 2
			style.border_width_right = 2
		panel.add_theme_stylebox_override("panel", style)
