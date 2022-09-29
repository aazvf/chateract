<script setup>
import tmi from "tmi.js";
import classifier from "ml-classify-text";

const app = useNuxtApp();
const props = defineProps({});

const chat_limit = 10;

const channel = useChannel();

const message_count = ref(0);

const messages = ref([]);

onMounted(() => {
    console.log("chatteract loaded");
});

// const words = ref([]);
const words = ref({});

const increment_word = (word) => {
    if (typeof words.value[word] !== "number") {
        words.value[word] = 1;
    } else {
        words.value[word]++;
    }
    // if (!words.value.find((w) => w.key === word)) {
    // words.value.push({ key: word, count: 0 });
    // }
    // words.value.find((w) => w.key === word).count++;
};

const on_message = (channel, tags, message, self) => {
    console.log("on_message", message);
    message_count.value++;

    const ngrams = message_to_ngram(strip_emotes(message, tags));

    for (const [key, value] of Object.entries(ngrams)) {
        // ignore stopwords, short words and numbers
        if (app.$is_stopword(key) || (key.length < 3 && !key.match("[0-9]+"))) {
            continue;
        }

        increment_word(key);
    }

    messages.value[(message_count.value - 1) % chat_limit] = message;
    // messages.value.unshift(message);
    // if (message_count.value > chat_limit) {
    // messages.value.pop();
    // }
};

const on_message_deleted = (channel, tags, message, self) => {
    console.log("on_message_deleted", message);
};

const on_connecting = (event) => {
    console.log("on_connecting", event);
};

const on_connected = (event) => {
    console.log("on_meon_connectedssage_deleted", event);
};

const client = new tmi.Client({
    options: {
        debug: false,
        messagesLogLevel: "info",
        skipMembership: true,
    },
    connection: {
        reconnect: true,
        secure: true,
    },
    channels: [channel.value],
});

client.connect().catch(console.error);

client.on("message", on_message);
client.on("messagedeleted", on_message_deleted);
client.on("connecting", on_connecting);
client.on("connected", on_connected);

const logo = useLogo();
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const clearout = () => {
    console.log("clearout!!!");
    Object.keys(words.value).forEach((word) => {
        words.value[word] *= 0.6;
        if (words.value[word] < 1) {
            delete words.value[word];
            // words.value[word] = undefined;
        }
    });

    logo.value = randInt(1, 51);

    // words.value = words.value
    //     .filter((w) => w.count > 1)
    //     .map((w) => {
    //         w.count *= 0.6;
    //         return w;
    //     });
    // messages.value = messages.value.slice(
    //     0,
    //     Math.max(chat_limit, messages.value.length - chat_limit)
    // );
};

const interval = ref(0);

const timeout = setTimeout(() => {
    clearout();
    interval.value = setInterval(clearout, 10000);
}, (10 - ((Date.now() / 1000) % 10)) * 1000);

// const interval = setInterval(clearout, 10000);

onUnmounted(() => {
    console.log("disconnecting from channel");
    client.disconnect();
    clearInterval(interval.value);
    clearInterval(bar_interval);
    clearTimeout(timeout);
});

const connect = () => {
    // client = new
};

// const reverse_messages = computed(() => {
//     return messages.value.reverse().slice(0, 10);
// });

const recent_messages = computed(() => messages.value.slice(0, 10));

const strip_emotes = (message, tags) => {
    if (tags.emotes === null) {
        return message;
    }
    let filtered = message;
    for (const [key, value] of Object.entries(tags.emotes)) {
        for (let piece of value) {
            let pos = piece.split("-");
            filtered = filtered.slice(0, pos[0]) + filtered.slice(pos[1] + 1);
        }
    }
    return filtered;
};

const time = () => {
    return 10 - ((Date.now() / 1000) % 10).toFixed(0);
};

const left_pos = ref("100%");

const bar_interval = setInterval(() => {
    left_pos.value = time() * 10 + "%";
}, 1000);

const sorted_words = computed(() => {
    if (Object.entries(words.value).length < 1) {
        return [];
    }

    const entries = Object.entries(words.value)
        .sort((a, b) => b[1] - a[1])
        .slice(0, chat_limit);

    const max = typeof entries[0] === "object" ? entries[0][1] : 1;

    return entries.map((w) => {
        const percent =
            (Math.min(1, 0.3 + 0.7 * (w[1] / max)) * 100).toFixed(1) + "%";
        w.push(percent);
        return w;
    });
    // .map((w) => w[0] + " " + w[1].toFixed(1));
    // return words.value.sort((a, b) => b.count - a.count).slice(0, 10);
});

const message_to_ngram = (message) =>
    new classifier({ ngramMin: 1, nGramMax: 2 }).tokenize(message);
</script>


<template>
    <div class="flex">
        <!-- <div class="w-96 p-4 bg-purple-50 rounded-lg mr-6 pt-12 shadow">
            {{ message_count }}
            <div
                class="mb-2 border border-purple-500 bg-sky-50 text-purple-900 shadow-md p-4 rounded-md tracking-wide text-sm transition-all"
                v-for="(message, index) in messages"
                :key="index"
            >{{ message.slice(0,38) }} ...</div>
        </div>-->

        <div class="w-96 p-4 bg-purple-50 rounded-lg shadow">
            <div class="bg-purple-200 rounded-md w-full h-1 mb-2 overflow-hidden relative">
                <div
                    class="w-full h-full rounded-md transition-all ease-linear"
                    :class="(time() < 1  || time() > 9) ? 'bg-rose-300 duration-300 opacity-30' : 'bg-purple-500 duration-1000 opacity-100'"
                    :style="{width: left_pos}"
                ></div>
            </div>
            <div
                class="mb-2 border border-purple-500 bg-sky-50 text-purple-900 shadow-md p-4 rounded-lg tracking-wide text-sm transition-all flex relative"
                :class="index === 0 ? 'border-yellow-500 italic' : ''"
                v-for="(word, index) in sorted_words"
                :key="index"
            >
                <div class="z-10">{{ word[0].slice(0,38) }}</div>
                <div class="ml-auto z-10">{{ word[1].toFixed(1) }}</div>
                <div
                    class="absolute left-0 top-0 h-full bg-emerald-500/50 transition-[width] duration-300 rounded-lg"
                    :style="{width: word[2]}"
                ></div>
            </div>
        </div>
    </div>
</template>