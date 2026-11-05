# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Tetris — a playable classic implemented in vanilla HTML/CSS/JS with zero dependencies, no build step. Open `index.html` in any browser to play. Full details in [README.md](README.md).

## Running the game

No build or install needed. In the browser:

```
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

Or serve locally (recommended for accurate canvas timing):

```
npx serve .             # Node
python3 -m http.server 8000   # Python
```

## Architecture

Three files, no framework:

- **[index.html](index.html)** — DOM shell. Two `<canvas>` elements (`#board` 300×600 for the game, `#next-canvas` 120×120 for the preview), score/level HUD, pause/game-over overlay.
- **[style.css](style.css)** — Dark retro arcade styling with flexbox layout and backdrop-blur overlays.
- **[game.js](game.js)** (~305 lines) — All game logic in a flat procedural script (no classes):
  - **Constants** at the top: `COLS=10`, `ROWS=20`, `BLOCK=30`, 8 piece shapes (incl. 3×3 NUT with center hole), color palette, line-clear scores.
  - **Core data**: `board` (2D array of color indices), `current`/`next` piece objects `{type, shape, x, y}`, score/lines/level state.
  - **Key functions** (order in file mirrors logical dependency): `createBoard()` → `randomPiece()` → `collide()` → `rotateCW()` / `tryRotate()` → `merge()` → `clearLines()` → `ghostY()` → `hardDrop()` / `softDrop()` → `lockPiece()` → `spawn()` → `updateHUD()` → `drawBlock()` → `drawGrid()` → `draw()` → `drawNext()` → `endGame()` → `togglePause()` → `loop()` → `init()` → keyboard event listener + restart button.
  - **Game loop**: `requestAnimationFrame`-based; accumulates delta time and drops the piece every `dropInterval` ms (starts at 1000ms, decreases by 90ms per level).

## Modifying game parameters

All tunable constants are at the top of [game.js](game.js:3-29):

| Constant | Default | Changes |
|---|---|---|
| `COLS` | 10 | Must also update canvas `width` in index.html (`COLS * BLOCK`) |
| `ROWS` | 20 | Must also update canvas `height` in index.html (`ROWS * BLOCK`) |
| `BLOCK` | 30 | Must also update both canvas dimensions in index.html |
| `COLORS` | 8-entry array | Change hex values to remap piece colors |
| `LINE_SCORES` | `[0,100,300,500,800]` | Adjust scoring per number of lines cleared |

## Weather / Clima

When the user asks about weather, forecast, or climate in **any language** (keywords: `weather`, `clima`, `templatura`, `temperature`, `lluvia`, `rain`, `nieve`, `snow`, `pronóstico`, `forecast`, `hace frio/calor`, etc.):

1. **Automatically invoke the `weather` skill** (via the Skill tool, `skill: "weather"`) to get current conditions and 3-day forecast for Valdivia, Chile. Do NOT run the curl fallback below directly unless the skill invocation fails or the skill is unavailable. Fallback command:
   ```bash
   curl -s --max-time 20 "https://api.open-meteo.com/v1/forecast?latitude=-39.8142&longitude=-73.2459&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,precipitation&hourly=temperature_2m,weather_code,precipitation_probability,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max&timezone=America%2FSantiago&forecast_days=3"
   ```

2. Interpret the WMO weather code and present:
   - Current conditions (temperature, feels-like, humidity, wind, condition) in a table
   - 3-day forecast with max/min temps, precipitation, wind
   - A one-line practical recommendation

3. If the API fails (>20s), show `wttr.in/Valdivia` as a manual fallback.

## Key files

- [game.js](game.js) — game logic, rendering, input handling
- [index.html](index.html) — DOM structure and canvases
- [style.css](style.css) — visual styling
- [README.md](README.md) — full documentation (controls, tech, customization)
