# Frontend
- add routing: https://url/game?seed=234234234 should lead to custom seed
- timer how long the current challenge is valid
- add crash shadows per session


# Combined
- backend should send expiry time of current challenge seed together with config. (done) **Frontend should then auto-reload!**
- add damping for easy mode
- replace esbuild in `build:backend` with buns internal bundler?
- deduplicate highscore list based on additional uid (per device)
- save run log for highscores, enabling later frontend updates (e.g. shadows of current best)


# Backend
- use async file io in functions that are called from the server! This is e.g. the case for clear_highscore.
- keep highscore files for old seeds?


# BUGS
- UI does not hide immediately sometimes, but only on the 2nd press
- Zoom sometimes stuck when starting game
- Pressing space while playing starts the new game immediately instead of pausing