# Frontend
- add routing: https://url/game?seed=234234234 should lead to custom seed


# Combined
- backend should send expiry time of current challenge seed together with config. (done) **Frontend should then auto-reload!**
- add damping for easy mode
- replace esbuild in `build:backend` with buns internal bundler?

# Backend
- use async file io in functions that are called from the server! This is e.g. the case for clear_highscore.
- keep highscore files for old seeds?