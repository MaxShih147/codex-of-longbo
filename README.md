# Codex of Longbo / 龍伯事典

> 殘局之後，廢土之上，一位錄事踏入地底，尋找武學的真正起源。

AI 驅動的後末日武俠文字 RPG，以 Claude API 即時生成敘事與遊戲邏輯。

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

AI-driven Interactive Fiction / AI Text RPG / TUI RPG

### 玩法模式

- **混合模式**：探索時自由輸入，戰鬥/事件時切換成選項 + 數值系統
- **DnD 武俠風格**：屬性、判定、自由行動 + 關鍵時刻選項分支
- **AI 即時生成**：文本由 Claude API 驅動，非預寫內容

### 故事推進結構

- **地層制為骨架** — 「越深越危險越古老」的大方向
- **每層內部自由探索** — 網絡制的輕量版，線索互相連結但範圍限定在該層
- **穿插委託單元劇** — NPC 或發現觸發，有頭有尾的小故事弧（「壬課制」— 調查某位大師的死亡/失蹤）
- **跨層線索** — 某些線索貫穿多層，形成主線推進感

### 武學拼圖系統

找到的不是完整秘笈，而是碎片。例：3 頁降龍掌 + 2 頁不明心法 = 玩家自己拼出一套殘缺但獨特的武功。

### 資源稀缺

- 藥材、食物、乾淨水源都很珍貴
- 每個門派遺址都是一個 dungeon，有機關、殘留的守護、和深藏的秘密

### 輸入設計

- 大部分時候給 AI 動態生成的選項（按數字鍵即可）
- 永遠保留自由輸入行
- 快捷指令：`/看`、`/包`、`/查 [線索名]`、`/話 [NPC名]`
- **95% 按數字鍵，5% 自由輸入**

### 戰鬥模式

- 顯示敵人資訊
- 選項：攻擊（選武功）、防禦、使用物品、逃跑
- 數值計算由 AI 參考玩家/敵人屬性進行

### 存檔系統

- 自動存檔：每回合結束後
- 手動存檔：多欄位
- 格式：JSON（GameState 直接 serialize）
- 位置：`~/.wuxia-game/saves/`

---

## 技術架構

### Tech Stack

| 用途 | 套件 |
|------|------|
| 語言 | Python |
| TUI 介面 | `textual`（基於 rich 的 async TUI 框架） |
| Claude API | `anthropic`（官方 Python SDK） |
| 資料模型 | `pydantic` |
| 存檔 | JSON 檔案 |
| 套件管理 | `pyproject.toml` + `pip` |
| 預設模型 | `claude-sonnet-4-6`（可切換 `claude-opus-4-6`） |

### 專案結構

```
codex-of-longbo/
├── pyproject.toml
└── src/
    └── wuxia/
        ├── __init__.py
        ├── main.py        # 入口 (python -m wuxia)
        ├── app.py         # Textual TUI 應用程式
        ├── widgets.py     # 自訂 UI 元件
        ├── engine.py      # 遊戲引擎 (回合處理、狀態轉換)
        ├── models.py      # Pydantic 資料模型
        ├── ai.py          # Claude API 整合 (streaming + tool_use)
        ├── prompts.py     # System prompt 與武俠世界觀設定
        └── saves.py       # 存檔/讀檔
```

### 架構層次

```
┌─────────────────────────────┐
│   Terminal UI (遊戲畫面)      │
├─────────────────────────────┤
│   Game Engine (狀態管理)      │
│   - 角色屬性 / 背包 / 地圖    │
│   - 戰鬥系統 / 事件觸發       │
├─────────────────────────────┤
│   Claude API (文本生成)       │
│   - System prompt: 武俠世界觀  │
│   - 帶入 game state 作 context │
│   - Streaming 逐字輸出        │
└─────────────────────────────┘
```

### Claude API 整合策略

使用 `tool_use` 取得結構化回應。定義 `game_update` tool，讓 Claude 每次回應時同時回傳敘事文本和遊戲數據：

```python
game_update_tool = {
    "name": "game_update",
    "description": "更新遊戲狀態並推進劇情",
    "input_schema": {
        "properties": {
            "narrative": "str          # 敘事文本",
            "scene_type": "enum        # explore / combat / dialogue / event",
            "choices": "list[str]      # 玩家可選行動 (2-4個)",
            "stat_changes": "{hp, mp, exp}",
            "items_gained": "list",
            "items_lost": "list",
            "new_skills": "list",
            "location": "str",
            "combat_log": "str | null"
        }
    }
}
```

### 資料模型

```python
class Player:
    name, title, hp/max_hp, mp/max_mp,
    attack, defense, agility, level, exp,
    skills: list[Skill], inventory: list[Item], location

class Skill:
    name, damage, mp_cost, description

class Item:
    name, item_type (weapon/armor/consumable/quest), effect: dict

class GameState:
    player, turn, story_summary,
    recent_events, current_scene,
    npcs_met: dict[str, NpcRelation], flags: dict
```

### Context 管理

- 每次請求帶入：system prompt + game state JSON + 最近 10 回合對話
- 每 20 回合讓 AI 壓縮一次 `story_summary`
- 每一層就是天然的「作用域」— 進入新層時舊層線索轉為壓縮摘要
- **調查板**結構化管理線索（`active_threads` / `resolved` / `dormant`）

### Token 成本控制

| 玩家操作 | 送給 AI 的內容 | Token 消耗 |
|---------|---------------|-----------|
| 按選項數字 | `{"action": "action_id", "context_id": 42}` | 極少 |
| 快捷指令如 `/查` | 本地查 game state，不呼叫 AI | 0 |
| 自由輸入 | 完整自然語言給 AI 解析 | 較多 |

### 遊戲引擎回合流程

```
1. 收集玩家輸入 (自由文字 or 選項編號)
2. 組裝 prompt (system + game_state + history + player_action)
3. 呼叫 Claude API (streaming)
4. 解析 tool_use 回應 → 取得 narrative + state changes
5. 套用 state changes 到 GameState
6. 更新 UI (顯示敘事、更新狀態列)
7. 自動存檔
```

---

## UI 方向

### 介面佈局（三欄式 TUI）

```
┌──────────────────────────────────┬──────────────┐
│                                  │  【角色資訊】  │
│         故事/敘事面板              │  張三丰       │
│      (ScrollableContainer)       │  HP: 80/100  │
│                                  │  MP: 50/80   │
│   你走進一座幽暗的竹林...          │  攻: 25      │
│   遠處傳來劍鳴之聲...             │  防: 18      │
│                                  │  敏: 22      │
│                                  │──────────────│
│                                  │  【武功】     │
│                                  │  太極劍法     │
│                                  │  太極拳       │
│                                  │──────────────│
│                                  │  【背包】     │
│                                  │  金創藥 x3   │
├──────────────────────────────────┤  九陽真經     │
│  > 你想做什麼？                   │              │
│  [輸入行動或選擇編號]              │              │
└──────────────────────────────────┴──────────────┘
```

### 關鍵 UI 元件

| 元件 | 說明 |
|------|------|
| `StoryPanel` | 可捲動的 RichLog，支援 streaming 逐字顯示 |
| `StatusPanel` | 右側角色狀態，即時更新 |
| `InputBar` | 底部輸入欄，支援自由輸入和選項模式切換 |

### 選項交互

```
北邊茶館傳來低語。

  [1] 進去聽
  [2] 繞到後門偷看
  [3] 先觀察周圍有沒有埋伏
  [>] _______________
```

- 1、2、3 按一個鍵就行，零摩擦
- `>` 永遠在，想打就打

### 快捷鍵

- `Ctrl+S` — 存檔
- `Ctrl+Q` — 離開

### 平台備註

目前技術架構為 Terminal/TUI，未來可能考慮手機端。

---

## 開發啟動

```bash
# 安裝
cd codex-of-longbo
pip install -e .

# 執行
python -m wuxia

# API Key 設定
export ANTHROPIC_API_KEY="your-key-here"
# 或首次啟動時互動輸入，儲存至 ~/.wuxia-game/config.json
```

### 驗證步驟

1. 確認 TUI 正常渲染（故事面板、狀態列、輸入區）
2. 輸入自由文字，確認 AI 回應正常 streaming 顯示
3. 觸發戰鬥，確認切換為選項模式且數值正確更新
4. 存檔後重啟，確認讀檔正常
