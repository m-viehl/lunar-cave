# Frontend
- add routing: https://url/game?seed=234234234 should lead to custom seed


# Combined
- backend should send expiry time of current challenge seed together with config. Frontend shoud then auto-reload!
- separated package.jsons to avoid unnecessary deps in backend docker build? Or just put vue to devdeps? :L
- streamline deployment (and backend debugging!)
- generate deployment readme
- update readme in general!
- add damping for easy mode

# Backend
- [X] put all server config to extra ts file
- deduplicate highscores by name in leaderboard?
- use async file io in functions that are called from the server! This is e.g. the case for clear_highscore, which is called via get_seed->ensure_cache_exists->get_game_object->handle_request->post("/new-score") (oof!)
- keep highscore files for old seeds?
- serve the built frontend files