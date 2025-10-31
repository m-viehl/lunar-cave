import { reactive, watch, type Reactive } from "vue";

const STORAGE_KEY = "app_state";

function GET_DEFAULT() {
    return {
        settings_version: 1,
        mode: "custom",
        customSettings: {
            size_select: "1.0",
            length_select: "350",
            speed_select: "1.0"
        }
    }
};
export type StateType = ReturnType<typeof GET_DEFAULT>

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