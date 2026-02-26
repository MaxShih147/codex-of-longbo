/**
 * BoardGameGeek MCP Server for Codex of Longbo
 *
 * Provides tools to search and query board game mechanics, rules,
 * and metadata from BoardGameGeek's XML API2.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BGG_API = "https://boardgamegeek.com/xmlapi2";

// --- helpers ---

async function fetchXml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BGG API error: ${res.status}`);
  return await res.text();
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const matches = [];
  let m;
  while ((m = re.exec(xml)) !== null) matches.push(m[1].trim());
  return matches;
}

function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "g");
  const matches = [];
  let m;
  while ((m = re.exec(xml)) !== null) matches.push(m[1]);
  return matches;
}

function extractTagWithAttr(xml, tag, attrFilter) {
  const re = new RegExp(`<${tag}[^>]*${attrFilter}[^>]*value="([^"]*)"`, "g");
  const matches = [];
  let m;
  while ((m = re.exec(xml)) !== null) matches.push(m[1]);
  return matches;
}

function stripHtml(str) {
  return str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#10;/g, "\n")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .trim();
}

// --- server ---

const server = new McpServer({
  name: "bgg-server",
  version: "1.0.0",
});

// Tool: search board games
server.tool(
  "bgg_search",
  "Search BoardGameGeek for board games by name. Returns game IDs, names, and year.",
  { query: z.string().describe("Board game name to search for") },
  async ({ query }) => {
    const url = `${BGG_API}/search?query=${encodeURIComponent(query)}&type=boardgame`;
    const xml = await fetchXml(url);

    const ids = extractAttr(xml, "item", "id");
    const names = extractAttr(xml, "name", "value");
    const years = extractAttr(xml, "yearpublished", "value");

    const results = ids.slice(0, 10).map((id, i) => ({
      id,
      name: names[i] || "?",
      year: years[i] || "?",
    }));

    return {
      content: [
        {
          type: "text",
          text:
            results.length === 0
              ? "No results found."
              : results
                  .map((r) => `[${r.id}] ${r.name} (${r.year})`)
                  .join("\n"),
        },
      ],
    };
  }
);

// Tool: get detailed game info
server.tool(
  "bgg_game_info",
  "Get detailed info about a board game from BGG by ID. Returns description, mechanics, categories, player count, play time, rating, weight.",
  { id: z.string().describe("BGG game ID (number)") },
  async ({ id }) => {
    const url = `${BGG_API}/thing?id=${id}&stats=1`;
    const xml = await fetchXml(url);

    const name = extractAttr(xml, "name", "value")[0] || "Unknown";
    const descRaw = extractTag(xml, "description")[0] || "";
    const description = stripHtml(descRaw).slice(0, 1500);
    const year = extractAttr(xml, "yearpublished", "value")[0] || "?";
    const minPlayers = extractAttr(xml, "minplayers", "value")[0] || "?";
    const maxPlayers = extractAttr(xml, "maxplayers", "value")[0] || "?";
    const playTime = extractAttr(xml, "playingtime", "value")[0] || "?";
    const minAge = extractAttr(xml, "minage", "value")[0] || "?";

    const mechanics = extractTagWithAttr(xml, "link", 'type="boardgamemechanic"');
    const categories = extractTagWithAttr(xml, "link", 'type="boardgamecategory"');
    const designers = extractTagWithAttr(xml, "link", 'type="boardgamedesigner"');

    // ratings
    const avgMatch = xml.match(/<average\s+value="([^"]*)"/);
    const weightMatch = xml.match(/<averageweight\s+value="([^"]*)"/);
    const rating = avgMatch ? parseFloat(avgMatch[1]).toFixed(1) : "?";
    const weight = weightMatch
      ? parseFloat(weightMatch[1]).toFixed(2)
      : "?";

    const info = [
      `# ${name} (${year})`,
      ``,
      `**Players:** ${minPlayers}-${maxPlayers} | **Time:** ${playTime} min | **Age:** ${minAge}+`,
      `**Rating:** ${rating}/10 | **Weight:** ${weight}/5`,
      `**Designer(s):** ${designers.join(", ") || "?"}`,
      ``,
      `## Mechanics`,
      mechanics.map((m) => `- ${m}`).join("\n") || "None listed",
      ``,
      `## Categories`,
      categories.map((c) => `- ${c}`).join("\n") || "None listed",
      ``,
      `## Description`,
      description || "No description available.",
    ];

    return { content: [{ type: "text", text: info.join("\n") }] };
  }
);

// Tool: get BGG hot list
server.tool(
  "bgg_hot",
  "Get the current BGG hot list (trending board games).",
  {},
  async () => {
    const url = `${BGG_API}/hot?type=boardgame`;
    const xml = await fetchXml(url);

    const ids = extractAttr(xml, "item", "id");
    const ranks = extractAttr(xml, "item", "rank");
    const names = extractAttr(xml, "name", "value");
    const years = extractAttr(xml, "yearpublished", "value");

    const results = ids.slice(0, 15).map((id, i) => ({
      rank: ranks[i] || i + 1,
      id,
      name: names[i] || "?",
      year: years[i] || "?",
    }));

    return {
      content: [
        {
          type: "text",
          text: results
            .map((r) => `#${r.rank} [${r.id}] ${r.name} (${r.year})`)
            .join("\n"),
        },
      ],
    };
  }
);

// Tool: search by mechanic
server.tool(
  "bgg_mechanic_games",
  "Search BGG for popular games that use a specific mechanic (e.g. 'Tile Placement', 'Deck Building', 'Dice Rolling'). Useful for finding reference games.",
  { mechanic: z.string().describe("Game mechanic name, e.g. 'Tile Placement'") },
  async ({ mechanic }) => {
    // BGG doesn't have a direct mechanic search API, so we search by the mechanic name
    // and filter results. This is a workaround.
    const url = `${BGG_API}/search?query=${encodeURIComponent(mechanic)}&type=boardgamemechanic`;
    const xml = await fetchXml(url);

    // If no mechanic search works, fall back to a general search hint
    const ids = extractAttr(xml, "item", "id");

    if (ids.length === 0) {
      // Provide a helpful list of common mechanics
      return {
        content: [
          {
            type: "text",
            text: [
              `No direct mechanic search available via API.`,
              ``,
              `Try using bgg_search to find specific games, then bgg_game_info to check their mechanics.`,
              ``,
              `Common mechanics relevant to our project:`,
              `- Tile Placement (板塊拼放)`,
              `- Modular Board (模組化版圖)`,
              `- Cooperative Game (合作遊戲)`,
              `- Deck/Bag Building (牌組構築)`,
              `- Push Your Luck (賭運氣)`,
              `- Variable Setup (可變設置)`,
              `- Exploration (探索)`,
              `- Narrative Choice (敘事選擇)`,
              `- Solo / Solitaire Game`,
              `- Campaign / Legacy`,
              ``,
              `Suggested reference games to look up:`,
              `- Carcassonne (tile placement classic)`,
              `- Betrayal at House on the Hill (tile-based exploration)`,
              `- Sub Terra (co-op tile exploration, horror)`,
              `- Cartographers (map drawing)`,
              `- The 7th Continent (exploration card game)`,
              `- Sleeping Gods (narrative exploration)`,
            ].join("\n"),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: ids.map((id, i) => `[${id}]`).join(", "),
        },
      ],
    };
  }
);

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
