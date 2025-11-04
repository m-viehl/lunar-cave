# Lunar Cave game
- Cool auto-generated caves!
- A weekly challenge with tamper-proof highscore list: Server replays the game to validate highscore requests. Feel free to train a RL model to get highscores. Or just play the game ^^

# Backend configuration
The backend (in `src/backend/main.ts`) will use the `DATA_DIR` environment variable as data directory.
If not given, it will default to `.data`.
Further configuration is in `src/backend/config.ts`.

# Development
- Development scripts create and use `dev-data` (is in gitignore) as data directory
- The dev server is directly run via bun and auto-reloads on source changes. A vite proxy is used to point the `/api` routes to the server.

# Production build
**TODO not yet implemented**

The `build` script builds a docker image using the `Dockerfile` that serves the whole app.
- Runs the fastify API in `src/backend`.
- Serves the bundled static vue frontend from `src/frontend`, also via fastify.

Both the frontend and the backend are bundled using vite to create standalone apps without any dependencies. Hence, there are no runtime dependencies. In `package.json`, `dependencies` are used as **build-time** dependencies for the dockerized build, and not runtime dependencies!

The backend persists its state (current seed and highscores) to `TODO/TBD`. You may mount this directory as a docker volume.

----------------

# Changelog
This changelog is for *user-visible features*, not internal improvements.

## Version 0, 2022-03-01
- Playable game different from the current "lunar cave" game
- No cave, but a landscape with landing areas

## Version 1.0, 2022-03-11
- Basic version of the "lunar cave" game
- Add cave
- New filled drawing style instead of lines
- No "user interface" whatsoever

## Version 1.1, 2022-05-03
- Allow to draw construction lines
- Add velocity-dependent scaling
- Add rudimentary difficulty selector

## Version 2.0, 2022-06-02
- Fix arrow keys affecting the difficulty selector
- Add a HTML user interface with instructions
- Switch from progress bar to percentage text
- Hide the cursor when playing
- Add two drawing modes: filled and lines only
- Switch name to **Lunar Cave**
- Freeze the game when crashing

## Version 3.0, 2022-08-16
Not mentioning the huge rewrite to allow for proper configuration would be sad... (But yes, this is no user-visible feature, I see.)

- Do not hide progress on crash
- Improve easy mode:
    - Increase rotational speed by 100%
    - Increase the cave dimensions
    - Make the cave shorter

## Version 3.1, 2022-08-22
- Make style configurable via jsons
- Add dark lines only mode

## Version 3.2, 2023-05-05
- Make cave generation deterministic and add a seed selection prompt when pressing shift+N
- Fix the cave generation bug which caused long straight cave segments sometimes even running "backwards"
- Add a favicon
- Switch to parceljs, which
    - reduced the deployment size
    - automatically adds hashed filenames for cache busting
