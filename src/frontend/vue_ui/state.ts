import { reactive, ref, watch, type Reactive, type Ref } from "vue";

const STORAGE_KEY = "app_state";

/**
 * Get default frontend settings/state
 */
function GET_DEFAULT() {
    // ##################################################
    // WHEN UPDATING THIS OBJECT: INCREASE VERSION!!!
    // ##################################################
    return {
        settings_version: 3,
        mode: "custom" as "custom" | "challenge",
        customSettings: {
            size_select: "1.0",
            length_select: "350",
            speed_select: "1.0",
            damping_factor: "0.0", // default 0.0 means no damping
        },
        challengeSettings: {
            show_best_shadow: "true",
        }
    }
};

/**
 * StateType is the type of the object that holds the UI (settings) state and is
 * persisted to localstorage.
 * 
 * The StateType object is converted to a GameConfig object in App.vue, in the
 * reactive `let game = computed(...)` property.
 */
export type StateType = ReturnType<typeof GET_DEFAULT>

/**
 * Get the state on app init.
 * 1. If a valid (via settings_version!) version is found in localstorage, return it
 * 2. return the default from GET_DEFAULT()
 */
function getInitialState(): StateType {
    const raw = localStorage.getItem(STORAGE_KEY);
    let default_obj = GET_DEFAULT();
    if (!raw) return default_obj;
    try {
        const saved = JSON.parse(raw);
        if (typeof saved.settings_version === "number" && saved.settings_version >= default_obj.settings_version) {
            return saved;
        }
    } catch (_) {
        // ignore parse errors and use defaults
    }
    return default_obj;
}

export let state: Reactive<StateType> = reactive(getInitialState());
// TODO rename somehow, e.g. "persistentState"


// persist any state changes to localstorage
watch(
    state,
    (val) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
        } catch (_) {
            // ignore storage write errors
        }
    },
    { deep: true }
);


export let is_dialog_open = ref(false);
