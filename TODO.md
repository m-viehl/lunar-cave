# Frontend
- add routing: https://url/game?seed=234234234 should lead to custom seed


# Combined
- replace esbuild in `build:backend` with buns internal bundler?


# Backend
- use async file io in functions that are called from the server! This is e.g. the case for clear_highscore.
- keep highscore files for old seeds?


# BUGS
- UI does not hide immediately sometimes, but only on the 2nd press
- Zoom sometimes stuck when starting game
- arrow key visualization does not render well, arrow sizes are inconsistent and not centered