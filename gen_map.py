"""Generate a dithered ASCII topographic map for Codex of Longbo."""
import math

W, H = 82, 46
RAMP = "  ·░▒▓█"  # sparse → dense = low → high elevation (block chars)

# 4x4 Bayer ordered dithering matrix
BAYER = [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5],
]

def gauss(x, y, cx, cy, sigma):
    return math.exp(-((x - cx)**2 + (y - cy)**2) / (2 * sigma**2))

def ridge(x, y, x0, y0, x1, y1, sigma, strength):
    """A ridge line from (x0,y0) to (x1,y1)."""
    dx, dy = x1 - x0, y1 - y0
    length_sq = dx*dx + dy*dy
    if length_sq == 0:
        return strength * gauss(x, y, x0, y0, sigma)
    t = max(0, min(1, ((x - x0)*dx + (y - y0)*dy) / length_sq))
    px, py = x0 + t*dx, y0 + t*dy
    dist = math.sqrt((x - px)**2 + (y - py)**2)
    return strength * math.exp(-(dist**2) / (2 * sigma**2))

def heightmap(x, y):
    h = 0.12 + 0.08 * (1 - y / H)

    # === 蒼梧嶺 mountain range (NW) ===
    h += 0.92 * gauss(x, y, 17, 9, 5.5)
    h += 0.40 * gauss(x, y, 12, 6, 3.5)
    h += 0.30 * gauss(x, y, 23, 7, 3)
    h += ridge(x, y, 12, 6, 24, 11, 3.5, 0.25)

    # === 鶴嶺 mountain (NE) ===
    h += 0.70 * gauss(x, y, 54, 10, 5)
    h += 0.25 * gauss(x, y, 50, 7, 3)
    h += 0.20 * gauss(x, y, 58, 13, 3)

    # === Connecting ridge between ranges ===
    h += ridge(x, y, 24, 11, 50, 10, 4, 0.15)
    h += 0.10 * gauss(x, y, 37, 10, 5)

    # === Foothills ===
    h += 0.10 * gauss(x, y, 28, 18, 4.5)
    h += 0.08 * gauss(x, y, 45, 20, 4)
    h += 0.06 * gauss(x, y, 15, 20, 3)

    # === 鐵劍門 hill (SW) ===
    h += 0.14 * gauss(x, y, 20, 34, 3.5)
    h += 0.06 * gauss(x, y, 25, 36, 3)

    # === 崩心 crater (center-east) ===
    h -= 0.60 * gauss(x, y, 44, 27, 4.5)
    h -= 0.20 * gauss(x, y, 44, 27, 9)
    # Crater rim (slight elevation ring)
    crater_dist = math.sqrt((x - 44)**2 + (y - 27)**2)
    if 5 < crater_dist < 9:
        h += 0.06 * gauss(crater_dist, 0, 7, 0, 1.5)

    # === 斷魂澤 depression (W) ===
    h -= 0.15 * gauss(x, y, 8, 27, 5)
    h -= 0.05 * gauss(x, y, 6, 23, 4)

    # === River valley (subtle depression) ===
    for rx in range(10, 60):
        ry = 16 + 2.5 * math.sin(rx * 0.12)
        h -= 0.03 * gauss(x, y, rx, ry, 1.8)

    # === Southern lowlands ===
    h -= 0.04 * gauss(x, y, 35, 40, 8)

    return max(0, min(1, h))


def coast_x(y):
    """Irregular coastline on the east side."""
    base = W - 12
    return int(base + 3.5 * math.sin(y * 0.22) + 2 * math.sin(y * 0.55 + 1)
               + 1.5 * math.sin(y * 0.9 + 2))


def is_river(x, y):
    """Check if (x,y) is on the river path."""
    # River flows from 蒼梧嶺 foothills east toward crater area, then south to sea
    # Segment 1: west to east
    if 22 <= x <= 55:
        ry = 16 + 2.5 * math.sin(x * 0.12)
        if abs(y - ry) < 0.6:
            return True
    # Segment 2: south branch near crater
    if 50 <= x <= 56:
        ry2 = 16 + (y - 16) * 0.5
        rx_center = 54
        if abs(x - rx_center) < 0.6 and 16 <= y <= 30:
            return True
    return False


def is_marsh(x, y, val):
    """Check if position should render as marsh."""
    return x < 15 and 20 < y < 34 and val < 0.32


def main():
    # Build heightmap
    hm = [[heightmap(x, y) for x in range(W)] for y in range(H)]

    # Normalize
    flat = [hm[y][x] for y in range(H) for x in range(W)]
    lo, hi = min(flat), max(flat)
    rng = hi - lo if hi != lo else 1
    for y in range(H):
        for x in range(W):
            hm[y][x] = (hm[y][x] - lo) / rng

    n = len(RAMP) - 1

    # Render with ordered dithering
    grid = []
    for y in range(H):
        row = []
        sea = coast_x(y)
        for x in range(W):
            # Sea
            if x >= sea:
                row.append('~')
                continue

            v = hm[y][x]
            threshold = BAYER[y % 4][x % 4] / 16.0

            # River
            if is_river(x, y):
                row.append('≈')
                continue

            # Marsh
            if is_marsh(x, y, v):
                if threshold < 0.35:
                    row.append('≈')
                elif threshold < 0.6:
                    row.append('░')
                else:
                    row.append(' ')
                continue

            # Ordered dithering
            scaled = v * n
            base_idx = int(scaled)
            frac = scaled - base_idx
            if frac > threshold and base_idx < n:
                idx = base_idx + 1
            else:
                idx = base_idx
            row.append(RAMP[idx])
        grid.append(row)

    # Place markers (single-width Unicode)
    markers = [
        (17, 9,  '▲'),  # A: 蒼梧嶺 peak
        (54, 10, '▲'),  # B: 鶴嶺 peak
        (52, 12, '☒'),  # C: 鶴鳴殿 ruins
        (51, 13, '⊙'),  # D: 鶴嶺 underground entrance
        (44, 27, '⊙'),  # E: 崩心 main entrance
        (12, 20, '☒'),  # F: 玄甲塢 ruins
        (10, 22, '⊙'),  # G: 斷魂澤 underground entrance
        (20, 34, '☒'),  # H: 鐵劍門 ruins
        (19, 35, '⊙'),  # I: 鐵劍門 underground entrance
        (36, 40, '○'),  # J: 灰燼鎮
    ]
    for mx, my, ch in markers:
        if 0 <= mx < W and 0 <= my < H:
            grid[my][mx] = ch

    # Output
    print()
    print("            ┌──────────────────────────────────┐")
    print("            │   龍 伯 事 典  ──  灰 燼 輿 圖   │")
    print("            └──────────────────────────────────┘")
    print()
    for row in grid:
        print("  " + "".join(row))
    print()
    print("  ┌─────────────────────────────────────────────────────────────┐")
    print("  │  符號密度 = 海拔高度    疏  ·░▒▓█ 密                       │")
    print("  │                                                             │")
    print("  │  ▲ 蒼梧嶺 (NW)    ▲ 鶴嶺 (NE)    ⊙ 地淵入口 ×4          │")
    print("  │  ☒ 鶴鳴殿遺址     ☒ 玄甲塢遺址    ☒ 鐵劍門遺址          │")
    print("  │  ○ 灰燼鎮 (玩家起點)              ~ 龍伯海 / 河 / 沼      │")
    print("  └─────────────────────────────────────────────────────────────┘")


if __name__ == "__main__":
    main()
