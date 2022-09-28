<script setup>
const props = defineProps({});

const setChannel = () => {
    active_channel.value = channel.value;
};

const active_channel = useChannel();

const channel = ref(active_channel.value);
</script>


<template>
    <form
        v-on:submit.prevent="setChannel"
        class="flex rounded-lg bg-purple-100 w-min border border-purple-200 p-2 mb-4 shadow-md"
    >
        <div class="p-2 w-52">
            <label
                for="channel"
                class="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300"
            >
                Channel
                <span v-if="active_channel.length > 2">({{ active_channel }})</span>
            </label>
            <input
                type="text"
                id="channel"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
                placeholder="Twitch Channel"
                v-model="channel"
            />
        </div>
        <div class="flex flex-col p-2">
            <button
                type="submit"
                class="mt-auto text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 border dark:focus:ring-purple-800"
            >Connect</button>
        </div>
    </form>
</template>