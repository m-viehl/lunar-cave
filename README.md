# Lunar lander like game
Cool auto-generated caves!

# Build
- Clone this repo and run `npm install` and install the typescript compiler (e.g. `sudo apt install typescript`).
- Run `npm run build` or `npm run production`. To serve locally without building, run `python3 -m http.server -d build`.
- Visit the displayed URL.

# Game
- WSD or arrow keys to fly
- f5 or reaching the end creates new cave
- Shift+H toggles cave construction lines

# TODO
- some info/help text
- use Pixi
- implement cave zones with different creation parameters for more variability
- don't have the ship always centered (this one is probably difficult, maybe don't do it)
- Controller support
- mobile controls
- cave of the day; at least print seed (and version?) to console
- leaderboard
- first segment with low `start_inner_r` and `start_outer_r` for nicer cave end
- landing spots & fuel?
- short "overview" showing the whole cave and then zooming to the ship
- crash explosion
- handle overlapping caves correctly and remove direction constraints
- drawing style: polygon or strokes?
- make difficulty configurable -> different profiles/levels, easy mode

**✓ done**
- control zoom depending on speed
- Progress bar
- implement 2nd ship
- "debug mode" which draws some help lines