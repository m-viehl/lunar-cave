<template>
    <teleport to="body">
        <div v-show="is_dialog_open" class="overlay">
            <div class="dialog menu">
                <p>New highscore! Enter your name to upload:</p>
                <input v-model="inputValue" type="text" maxlength="20" />
                <div class="buttons">
                    <button @click="cancel">Cancel</button>
                    <button :disabled="!is_valid" :class="{ clickable: is_valid }" @click="confirm">OK</button>
                </div>
                <p v-if="error" class="error">{{ error }}</p>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { is_dialog_open } from "./state";


const NAME_LOCALSTORAGE_KEY = "lunarmission_name";

const emit = defineEmits<{
    (e: "confirm", value: string): void;
    (e: "cancel"): void;
}>();

const inputValue = ref(localStorage.getItem(NAME_LOCALSTORAGE_KEY) || "")

const regex = /^[a-zA-Z0-9]*$/;

let error = computed(() => {
    if (!regex.test(inputValue.value))
        return "Only alphanumeric characters allowed.";
    return null;
})

let is_valid = computed(() => { return error.value == null && inputValue.value.length >= 2 })


function confirm() {
    if (is_valid.value) {
        localStorage.setItem(NAME_LOCALSTORAGE_KEY, inputValue.value)
        emit("confirm", inputValue.value);
    }
}

function cancel() {
    emit("cancel");
}

function handleKeydown(event: KeyboardEvent) {
    if (!is_dialog_open.value) {
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        cancel();
    } else if (event.key === "Enter") {
        event.preventDefault();
        confirm();
    }
}

onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
});
</script>


<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.dialog {
    background: rgba(255, 255, 255, 0.7);
}

.dialog input {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 0.5rem;
}

.dialog p {
    margin-top: 0;
}

.error {
    color: red;
    font-size: 0.9rem;
}

.buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}
</style>
