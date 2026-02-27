# Codex of Longbo / 龍伯事典

> 殘局之後，廢土之上，一位錄事踏入地底，尋找武學的真正起源。

AI 驅動的後末日武俠探索遊戲，以板塊拼放生成地圖、Claude API 即時生成敘事。

---

## 世界觀

### 核心前提：「殘局」後末日武俠

十年前，一場被稱為「**天崩**」的災變摧毀了整個武林。所有宗師隕落，門派化為廢墟，秘笈散落四方。玩家是倖存者，在這片武學的廢土上行走。

### 天崩的真相

- **武學本不屬於人** — 數百年前，最早的「祖師」們其實是考古者，他們在地底發現了某個遠古文明的遺跡，從中挖掘出不屬於人類的力量體系。
- 各門各派的武學，本質上都是對這些遠古碎片的不同詮釋。
- 天崩發生在有人試圖回到源頭、取得完整力量的那一刻。
- **玩家正在走和當年祖師們同樣的路。**

### 命名典故

來自《列子·湯問》— 龍伯國的巨人把馱著仙山的巨鰲釣走了，導致仙山沉入海底。象徵遠古超越常人的力量失落/崩塌，而玩家去考古挖掘這些遺跡。

**Codex** = 古抄本 + code（密碼/解碼），兼具考古文獻和破譯感。

### 地層結構

| 層 | 名稱 | 時代 | 氛圍 | 特色 |
|---|------|------|------|------|
| 地表 | 灰燼 | 現在 | 末日生存 | 倖存者營地、盜匪、殘破城鎮 |
| 第一層 | 遺響 | ~50年前 | 華麗廢墟 | 全盛期門派遺址，機關仍運作 |
| 第二層 | 初脈 | ~200年前 | 原始粗獷 | 創派時代，武學原型更粗糙但更猛烈 |
| 第三層 | 異紋 | ??? | 詭異不安 | 非人類建築、無法辨識的文字 |
| 深處 | 源 | ??? | ??? | 武學的真正起源，天崩的根源 |

### 主角定位：「錄事」

- 專門記錄、調查、拾遺的職業
- 靠替人尋找失落之物、調查舊事維生
- 不是傳統武林高手，但擁有獨特的考古技能（辨識、解讀、機關破解）
- 武學是後天從廢墟中拼湊習得的

### 「逆修」

第二層某位祖師接觸過「源」後領悟的技藝：

> 「力量是借來的，與其被奪走，不如主動歸還。」

- 一系列**極強但永久消耗屬性**的招式
- 玩家可選擇學習，在關鍵時刻以犧牲換取突破
- 是策略選擇，不是必須

---

## 遊戲設計

### 核心定義

單人板塊拼放探索遊戲。從城鎮出發，逐張翻開地形板塊、拼出前往崩心的路徑，每塊探明的板塊都帶來一段 AI 生成的敘事。

### 玩法模式

- **板塊拼放**：六角板塊，邊緣顏色匹配（裂色為萬用）
- **卡牌驅動**：手牌選取、旋轉、放置
- **AI 敘事**：Claude API 驅動的動態文本（規劃中）

### 故事推進結構

- **地層制為骨架** — 「越深越危險越古老」的大方向
- **每層內部自由探索** — 網絡制的輕量版，線索互相連結但範圍限定在該層
- **穿插委託單元劇** — NPC 或發現觸發，有頭有尾的小故事弧
- **跨層線索** — 某些線索貫穿多層，形成主線推進感

### 輸入設計

- 數字鍵選手牌、R 旋轉、左鍵放置/行走
- 右鍵拖拽旋轉攝影機、滾輪縮放、中鍵平移
- Esc 取消選取

---

## 技術架構

### Tech Stack

| 用途 | 技術 |
|------|------|
| 引擎 | Godot 4.6（GDScript） |
| 渲染 | Forward+ 3D（六角柱 SurfaceTool mesh） |
| AI 整合 | Claude API + tool_use（規劃中） |
| 存檔 | JSON |
| 目標平台 | Steam macOS |

### 專案結構

```
codex-of-longbo/
├── CLAUDE.md               # 專案上下文（給 AI 助手）
├── README.md               # 本文件
├── godot/                  # Godot 4 專案（當前主力）
│   ├── project.godot
│   ├── scenes/
│   │   └── main.tscn       # 主場景
│   ├── scripts/
│   │   ├── hex_util.gd     # 六角數學
│   │   ├── tile_data.gd    # 板塊定義（class_name TileDefs）
│   │   ├── board_state.gd  # 棋盤狀態
│   │   ├── game_logic.gd   # 遊戲狀態機
│   │   ├── hex_mesh.gd     # 六角柱 mesh 生成
│   │   ├── board_view.gd   # 3D 棋盤渲染
│   │   ├── ghost_preview.gd # 板塊預覽
│   │   ├── orbit_camera.gd # 軌道攝影機
│   │   ├── player_piece.gd # 龍伯棋子
│   │   ├── hand_ui.gd      # 手牌 UI
│   │   └── tile_card_preview.gd
│   └── resources/
├── game/                   # Phase 1 HTML5 Canvas 原型（已遷移）
│   ├── index.html
│   └── js/
├── doc/
│   ├── demo-design.md      # Demo 版規則與機制架構
│   ├── references.md       # 神話學、地質學、桌遊文獻
│   ├── tommy-proposal.md   # Tommy 遊戲機制提案
│   └── game-rules-reference.md # Cthulhu DMD + Beacon Patrol 規則
├── mcp/                    # BoardGameGeek MCP server
│   └── bgg-server.mjs
├── gen_map.py              # 地形圖產生器
└── map.txt                 # 地形圖輸出
```

### 架構層次

```
┌──────────────────────────────────────┐
│       表現層 Presentation             │
│  Godot 4 真 3D：六角柱 mesh、軌道     │
│  攝影機、CanvasLayer 手牌 UI、HUD     │
├──────────────────────────────────────┤
│       規則層 Rules Engine             │
│  hex_util / tile_data / board_state  │
│  / game_logic — 純邏輯 GDScript      │
│  ·六角座標 + 鄰居查詢                  │
│  ·邊緣匹配（裂色萬用）                  │
│  ·板塊放置驗證 + 龍伯移動               │
├──────────────────────────────────────┤
│       敘事層 Narrative（規劃中）        │
│  Claude API + tool_use               │
│  ·板塊探明時觸發 AI 敘事               │
│  ·NPC 遭遇 + 天象描述                 │
│  ·AI 詮釋不決定（不影響數值）           │
├──────────────────────────────────────┤
│       持久層 Persistence（規劃中）     │
│  JSON 存檔/讀檔                       │
└──────────────────────────────────────┘
```

### Claude API 整合策略（規劃中）

使用 `tool_use` 取得結構化回應：

```json
{
  "name": "discovery_event",
  "input_schema": {
    "properties": {
      "narrative":      { "type": "string", "description": "2~3 句發現敘事" },
      "discovery_type": { "enum": ["clue", "supply", "lore", "anomaly"] },
      "codex_entry":    { "type": "object", "nullable": true },
      "mood":           { "enum": ["neutral", "ominous", "hopeful", "mysterious", "unsettling"] }
    }
  }
}
```

---

## 開發

### 啟動

```bash
# 用 Godot 編輯器開啟
/Applications/Godot.app/Contents/MacOS/Godot --path godot/

# 或直接執行（F5）
/Applications/Godot.app/Contents/MacOS/Godot --path godot/ --quit-after 0
```

### 操作

| 操作 | 按鍵 |
|------|------|
| 選手牌 | `1`–`7` 或點擊底部卡片 |
| 旋轉板塊 | `R` |
| 放置板塊 | 左鍵點擊棋盤 |
| 行走 | 左鍵點擊相鄰格子（未選牌時） |
| 旋轉攝影機 | 右鍵拖拽 |
| 縮放 | 滾輪 |
| 平移 | 中鍵拖拽 |
| 取消選取 | `Esc` |

### 驗證

1. Godot 開啟無腳本錯誤
2. F5 執行 → 看到 3D 六角柱棋盤（起始板塊 3 格）
3. 選牌 → 旋轉 → hover 看到 ghost → 點擊放置
4. 裂色萬用匹配生效
5. 龍伯棋子自動移動 + 可自由行走到相鄰格

---

## 參考文獻

詳見 `doc/references.md`（27+ 筆含摘要與連結），涵蓋：

- 《列子·湯問》— 歸墟、龍伯、岱輿、員嶠等核心神話
- 《山海經》— 禺強（玄冥）、蒼梧等地理
- 板塊拼放機制 — Beacon Patrol、Carcassonne、Taluva
- 考古與地質學 — 喀斯特地貌、Danxia 地形
