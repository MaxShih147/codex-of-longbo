# Codex of Longbo / 龍伯事典

## 你的角色

你是龍伯事典的遊戲設計師與世界觀架構師。你熟悉桌遊機制設計、roguelike 設計、互動敘事，並且深入理解本專案的神話學基底。

## 專案概述

一款以中國神話「龍伯釣鰲」為靈感的探索遊戲。世界觀融合後末日武俠與考古探險，核心玩法採用**板塊拼放（tile-laying）生成地圖 + 卡牌驅動探索**。目標平台為 Steam macOS。

## 世界觀關鍵字

- **天崩**：2030 年的災變，摧毀舊文明
- **崩心**：天崩隕坑，無底深淵（原型＝《列子》歸墟）
- **先天性機能亢退症候群（亢退症）**：天崩後新生兒出生即擁有超常能力但逐漸退化的現象
- **天漏**：亢退症的民間俗稱
- **崩學家**：研究崩心的邊緣學科，主張崩心深處藏有能量
- **龍伯**：主角，崩學博士生，不交代是本名還是綽號
- **地層結構**：地表(0)→遺響→初脈→異紋→源，越深越古老越危險
- **逆修**：極強但永久消耗屬性的武學，源自對「力量是借來的」的理解

## 設計原則

1. **規則極簡，深度來自組合** — 不堆系統，一個核心循環做到底
2. **沉浸感優先** — 精神時光屋的閱讀感，停不下來的探索欲
3. **翻牌即探索** — 每一步都是未知，板塊拼放生成地圖
4. **AI 詮釋不決定** — AI 負責敘事與氛圍，底層規則負責數值與判定
5. **世界觀是外衣** — 機制可以很簡單，故事要有厚度

## 機制參考

- **Beacon Patrol**：板塊拼放、邊緣匹配（水接水陸接陸）、逐步揭露地圖
- **Cthulhu: Death May Die**：發現卡敘事、瘋狂累積不可逆、模組化劇本、AI/規則分離
- **Tommy 提案**：指令裁定三級制、精靈提問系統、詛咒/祝福動態生成

## 技術架構

- **引擎**：Godot 4.6（GDScript），真 3D 渲染
- **AI 整合**：Claude API + tool_use 取得結構化回應（規劃中）
- **MCP**：BoardGameGeek 查詢用 `bgg-server`

### Godot 專案結構

```
godot/
├── project.godot
├── scenes/
│   └── main.tscn           # Node3D root + Camera + Light + UI
├── scripts/
│   ├── hex_util.gd          # 六角數學（axial 座標、鄰居、座標轉換）
│   ├── tile_data.gd         # 板塊資料（地形、建板塊、生成手牌）— class_name TileDefs
│   ├── board_state.gd       # 棋盤邏輯（放置驗證、行走、邊緣匹配）
│   ├── game_logic.gd        # 遊戲狀態機（選牌、旋轉、放置、行走、信號）
│   ├── hex_mesh.gd          # SurfaceTool 六角柱 mesh 生成
│   ├── board_view.gd        # 3D 棋盤渲染（MeshInstance3D + StaticBody3D）
│   ├── ghost_preview.gd     # 半透明板塊預覽
│   ├── orbit_camera.gd      # 軌道攝影機（旋轉/縮放/平移）
│   ├── player_piece.gd      # 龍伯 3D 棋子（capsule）
│   ├── hand_ui.gd           # 手牌 UI（CanvasLayer）
│   └── tile_card_preview.gd # 手牌卡片內的 2D 六角預覽
└── resources/
```

### Phase 1 實作狀態（已完成）

六角板塊拼放 + 真 3D 棋盤。採用 Taluva-style 三格板塊（裂心 + 兩格地形），pointy-top 六角柱。功能：

- 板塊拼放（邊緣顏色匹配 + 裂色萬用）
- 龍伯自動移動 + 自由行走
- 軌道攝影機（右鍵旋轉、滾輪縮放、中鍵平移）
- 手牌 UI（點擊/數字鍵選取、R 旋轉）
- Ghost 預覽（合法=地形色半透明、非法=紅色）

## 文件結構

- `doc/demo-design.md` — Demo 版完整規則、機制架構、地名對照
- `doc/references.md` — 神話學、地質學、桌遊機制文獻（27+ 筆含摘要與連結）
- `doc/tommy-proposal.md` — Tommy 的遊戲機制提案
- `doc/game-rules-reference.md` — Cthulhu DMD + Beacon Patrol 完整規則
- `game/` — Phase 1 原始 HTML5 Canvas 版本（已遷移至 Godot）
- `godot/` — 當前 Godot 4 專案
- `gen_map.py` — Bayer ordered dithering 地形圖產生器
- `map.txt` — 地形圖輸出

## 注意事項

- `TileDefs`（非 `TileData`）：避免與 Godot 內建 TileData 類別衝突
- Godot const 不能用 `sqrt()` 等函式，須用字面值
- 信號需 `call_deferred` 確保子節點 ready 後才 emit
