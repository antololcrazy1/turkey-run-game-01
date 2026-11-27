# Gobble Dash: Thanksgiving Escape

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/antololcrazy1/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/antololcrazy1/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Entry for the make.fun bounty [Make the best turkey escape game](https://make.fun/bounty/turkey-run-game-01).

A turkey escape game for the make.fun bounty `turkey-run-game-01`.

You are the turkey. The farmer wants you for Thanksgiving dinner — run from the
farmyard, through the barn, across the kitchen, and reach the escape gate at
1200m before time runs out.

- **Steer:** Arrow keys / WASD, mouse drag, or touch buttons
- **Dash:** Space (watch the dash meter)
- **Collect** corn for score; golden corn gives a speed boost
- **Dodge** the farmer's carving knives, crates and oven flames
- **Hide** in hay bales to shake the farmer off your tail

## Run it

Static files, no build step, no network:

```sh
node serve.ts
# open http://localhost:8080
```

Hand-in program (writes `game/`, `screenshots/` and `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

MIT licensed.
