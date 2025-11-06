# Frontend
- add routing: https://url/game?seed=234234234 should lead to custom seed
- [X] hide cursor when playing and not moved


# Combined
- backend should send expiry time of current challenge seed together with config. (done) **Frontend shoud then auto-reload!**
- add damping for easy mode
- add to changelog + deploy
- replace esbuild in `build:backend` with buns internal bundler?

# Backend
- [X] put all server config to extra ts file
- use async file io in functions that are called from the server! This is e.g. the case for clear_highscore.
- keep highscore files for old seeds?
- serve the built frontend files