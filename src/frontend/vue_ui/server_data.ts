import { ref } from "vue"
import type { CurrentChallengeType, HighscoresType } from "../../backend/api_types"

/**
 * File contains refs for data fetched from the server, including functions operating on it
 */

// refs to export
export let scoresObj = ref<HighscoresType | null>(null);
export let best_challenge_input_sequence = ref<string | null>(null);
export let challenge_data = ref<CurrentChallengeType | null>(null);


async function fetchChallengeGame() {
    try {
        const response = await fetch('/api/current-challenge', { method: 'GET' })
        if (!response.ok)
            return

        const data = await response.json() as CurrentChallengeType;

        challenge_data.value = data;
    } catch (_) {
        // ignore and keep challenge_data as null
    }
}

export async function fetchData() {
    // first reload challenge if necessary
    if (challenge_data.value == null || Date.now() > challenge_data.value.expires_at) {
        await fetchChallengeGame();
    }
    // (else up to date)

    // then fetch highscores
    try {
        const response = await fetch('/api/highscores', { method: 'GET' })
        if (!response.ok)
            return

        const data = await response.json() as HighscoresType

        // write result to refs
        scoresObj.value = data
        best_challenge_input_sequence.value = get_best_input_sequence();
    } catch (_) {
        // ignore and keep highscores as null
    }
}

/**
 * Checks whether a run with `time` seconds is qualified for the highscore
 * list or not. Does (intentionally) not include checking for name deduplication,
 * because we do not know whether the user may change the name before uploading, and
 * this function is only meant to hide the upload dialog if the time is definetely unqualified.
 */
export function is_qualified_for_highscore(time: number): boolean {
    if (scoresObj.value == null)
        return false;

    let len_scores = scoresObj.value.highscores.length;
    if (len_scores == scoresObj.value.max_length) {
        let worst_time = scoresObj.value.highscores[len_scores - 1]!.time;
        if (time > worst_time) {
            return false;
        }
    }
    return true;
}

/**
 * Return the input sequence of the currently best score in the leaderboard, if present,
 * or null otherwise.
 */
function get_best_input_sequence() {
    if (scoresObj.value == null)
        return null
    if (scoresObj.value.highscores.length == 0)
        return null
    let best = scoresObj.value.highscores[0]
    if (best?.input_sequence) {
        // this check is for the version transition, where scoresObj might not include
        // input_sequence yet.
        return best.input_sequence
    }
    return null
}
