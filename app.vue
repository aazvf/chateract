<template>
    <div class="bg-purple-50 min-h-screen p-4 flex flex-col">
        <choose-channel />

        <div
            class="h-full border border-purple-200 grow rounded-lg relative transition-colors p-4"
            :class="has_channel ? 'bg-purple-100' : 'bg-purple-300'"
        >
            <chatteract :key="channel" v-if="has_channel" />
            <loading-screen v-else />
        </div>
    </div>
</template>


<script lang="ts" setup>
import "./assets/css/tailwind.css";

const channel = useChannel();

const has_channel = computed(() => channel.value.length > 3);
</script>


