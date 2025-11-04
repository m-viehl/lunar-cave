// TS only: Export return types of the API for use in frontend

import type { get_game_config } from "./data"
export type CurrentChallengeType = ReturnType<typeof get_game_config>

import type {get_highscores} from "./scores"
export type HighscoresType = ReturnType<typeof get_highscores>
