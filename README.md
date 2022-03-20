# Lunar lander like game
Cool auto-generated caves!

# Build
- Clone this repo and run `npm install` and install the typescript compiler (e.g. `sudo apt install typescript`).
- Run `npm run build` or `npm run production`. To serve locally without building, run `python3 -m http.server -d build`.
- Visit the displayed URL.

# TODO
- Progress bar
- some info/help text
- use Pixi
- "debug mode" which draws some help lines
- implement cave zones with different creation parameters for more variability
- control zoom depending on speed
- don't have the ship always centered (this one is probably difficult, maybe don't do it)
- Controller support
- mobile controls
- cave of the day
- leaderboard
- first segment with low `start_inner_r` and `start_outer_r` for nicer cave end
- landing spots & fuel?
- short "overview" showing the whole cave and then zooming to the ship
- crash explosion
- handle overlapping caves correctly and remove direction constraints
- drawing style: polygon or strokes?
- make difficulty configurable -> different profiles/levels, easy mode

**done**
- ✓ implement 2nd ship