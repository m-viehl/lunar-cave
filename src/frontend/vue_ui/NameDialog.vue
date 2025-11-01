<template>
    <div v-show="is_dialog_open" class="overlay">
        <div class="dialog menu">
            <p>New highscore! Enter your name to upload:</p>
            <input v-model="inputValue" type="text" maxlength="30" />
            <div class="buttons">
                <button @click="cancel">Cancel</button>
                <button :disabled="!!error" :class="{ clickable: !error }" @click="confirm">OK</button>
            </div>
            <p v-if="error" class="error">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, onMounted, onUnmounted } from "vue";
import { is_dialog_open } from "./state";


const NAME_LOCALSTORAGE_KEY = "lunarmission_name";

const emit = defineEmits<{
    (e: "confirm", value: string): void;
    (e: "cancel"): void;
}>();

const inputValue = ref(localStorage.getItem(NAME_LOCALSTORAGE_KEY) || "")
const error = ref<string | null>(null);

const regex = /^[a-zA-Z0-9]*$/;

watch(inputValue, (val) => {
    if (!regex.test(val)) {
        error.value = "Only alphanumeric characters allowed.";
    } else if (val.length > 30 || val.length < 2) {
        error.value = "Length must be 2-30 characters."
    } else {
        error.value = null;
    }
});


function confirm() {
    if (!error.value) {
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
