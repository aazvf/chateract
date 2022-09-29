<template>
    <div class="bg-purple-50 min-h-screen p-4 flex flex-col">
        <div class="flex">
            <choose-channel />
            <img
                :src="'/images/' + logo + '.png'"
                alt="Logo"
                class="rounded-full shadow-lg animate-pulse mx-6 w-24 h-24 my-2 aspect-square"
            />
        </div>

        <div
            class="h-full border border-purple-200 grow rounded-lg relative transition-colors p-4"
            :class="has_channel ? 'bg-purple-100' : 'bg-purple-300'"
        >
            <chatteract :key="channel" v-if="has_channel" />
            <loading-screen v-else />
        </div>

        <Head>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="manifest" href="/site.webmanifest" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
            <meta name="msapplication-TileColor" content="#9f00a7" />
            <meta name="theme-color" content="#ffffff" />
        </Head>
    </div>
</template>


<script lang="ts" setup>
import "./assets/css/tailwind.css";

const channel = useChannel();

const logo = useLogo();

const has_channel = computed(() => channel.value.length > 0);

useHead({
    title: "Twitch Chateract",
});
</script>


