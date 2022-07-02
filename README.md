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

# TOFIX
- avoid creation of long backwards-going straight segments (triggered when an invalid cave angle is reached; use seeds for debugging)
- implement cache busting

# TODO
- make difficulty configurable -> different profiles/levels, easy mode
    - using the settings object as prototype may solve the issue that inheriting from a base configuration is annoying
- use Pixi
- implement cave zones with different creation parameters for more variability
- Controller support
- mobile controls
- cave of the day; at least print seed (and version?) to console
    - implement an own RNG (only for cave generation!)
- leaderboard
    - see ipad notes
    - send only key timestamps
    - also calculate a tick when a key is pressed: This makes the game deterministic without having to use a separate ticking "thread"
    - create server-side simulation program which reuses the game's classes
- first segment with low `start_inner_r` and `start_outer_r` for nicer cave end
- landing spots & fuel?
- short "overview" showing the whole cave and then zooming to the ship
- crash explosion
- handle overlapping caves correctly and remove direction constraints
- drawing style: polygon or strokes?
- improve colors or re-enable line-only style (make a switch in the menu for this?)
- ensure we don't spawn inside the wall (maybe possible for very narrow spawn segments?)
- freeze the game after a crash and display the menu with a "press any key to reset" message
- hide mouse pointer when starting game and after inactivity while the game is running
- On full hd with 100% scale, the progress bar is right behind the game title, ugly!
- Switch to a cooler font, e.g. like the one from moonlander.seb.ly?
- draw ship "wrecks" at crash sites like in RETRY

# ✓ done
- do not show "game over" when winning ^^
- remove focus from difficulty selector after selection (otherwise the arrow keys control it instead of the ship)
- some info/help text
    - keymap info
    - if implemented: leaderboard
    - nicer difficulty switch?
    - title etc?
- implement a fullscreen button
- control zoom depending on speed
- Progress bar
- implement 2nd ship
- "debug mode" which draws some help lines
