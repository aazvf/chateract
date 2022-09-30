<script setup>
import tmi from "tmi.js";
import classifier from "ml-classify-text";

const app = useNuxtApp();
const props = defineProps({});

const chat_limit = 10;

const clearout_interval = 10000;

const channel = useChannel();

const message_count = ref(0);

const messages = ref([]);

const btv_emotes = ref({});

const load_global_btv_emotes = () => {
    const global_emotes = "https://api.betterttv.net/3/cached/emotes/global";
    // const franker_emotes = "https://api.betterttv.net/3/cached/frankerfacez/users/twitch/";

    load_btv_emotes(global_emotes);
};

const load_btv_emotes = (
    url,
    c = (id) => "https://cdn.betterttv.net/emote/" + id + "/3x"
) => {
    fetch(url)
        .then((r) => r.json())
        .then((data) => {
            for (const emote of data) {
                btv_emotes.value[emote.code] = c(emote.id);
            }
        });
};

onMounted(() => {
    console.log("chatteract loaded");
    load_global_btv_emotes();
});

// const words = ref([]);
const words = ref({});

const increment_word = (word) => {
    if (typeof words.value[word] !== "number") {
        words.value[word] = 1;
    } else {
        words.value[word]++;
    }
};

const emojis = ref({});
const increment_emoji = (emoji) => {
    if (typeof emojis.value[emoji] !== "number") {
        emojis.value[emoji] = 1;
    } else {
        emojis.value[emoji]++;
    }
};
const count_emojis_in_message = (message) => {
    const emojis = message
        .toLowerCase()
        .match(
            "(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])"
        );
    if (emojis && emojis[0] !== "󠀀" && emojis[0] !== "󠀀[") {
        for (let emoji of emojis) {
            if (emoji.includes("[")) {
                continue;
            }
            increment_emoji(emoji);
        }
    }
    for (const emote of Object.keys(btv_emotes.value)) {
        if (message.includes(emote)) {
            increment_emoji(btv_emotes.value[emote]);
        }
    }
};

const count_emotes_in_message = (tags) => {
    if (null === tags.emotes) {
        return;
    }

    for (const [key, value] of Object.entries(tags.emotes)) {
        const src =
            "https://static-cdn.jtvnw.net/emoticons/v2/" +
            key +
            "/default/dark/3.0";
        increment_emoji(src);
    }
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

    count_emojis_in_message(message);
    count_emotes_in_message(tags);

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

const seen = ref([]);

const clearout = () => {
    console.log("clearout!!!");
    Object.keys(words.value).forEach((word) => {
        if (seen.value.includes(word)) {
            words.value[word] *= 0.6;
        } else {
            seen.value.push(word);
        }
        if (words.value[word] < 1) {
            delete words.value[word];
            seen.value.splice(seen.value.indexOf(word), 1);
        }
    });

    Object.keys(emojis.value).forEach((emoji) => {
        if (seen.value.includes(emoji)) {
            emojis.value[emoji] *= 0.6;
        } else {
            seen.value.push(emoji);
        }
        if (emojis.value[emoji] < 1) {
            delete emojis.value[emoji];
            seen.value.splice(seen.value.indexOf(emoji), 1);
        }
    });

    logo.value = randInt(1, 51);
};

// run clearout every 10 sec, but the first time wait for the right time.
const interval = ref(0);
const timeout = setTimeout(() => {
    clearout();
    interval.value = setInterval(clearout, clearout_interval);
}, (10 - ((Date.now() / 1000) % 10)) * 1000);

onUnmounted(() => {
    console.log("disconnecting from channel");
    client.disconnect();
    clearInterval(interval.value);
    clearInterval(bar_interval);
    clearTimeout(timeout);
});

const recent_messages = computed(() => messages.value.slice(0, 10));

const strip_emotes = (message, tags) => {
    const regex = new RegExp(
        "(" + Object.keys(btv_emotes.value).join("|") + ")"
    );

    message = message.replace(regex, "");

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
});

const sorted_emojis = computed(() => {
    if (Object.entries(emojis.value).length < 1) {
        return [];
    }

    const entries = Object.entries(emojis.value)
        .sort((a, b) => b[1] - a[1])
        .slice(0, chat_limit);

    const max = typeof entries[0] === "object" ? entries[0][1] : 1;

    return entries.map((w) => {
        const percent =
            (Math.min(1, 0.3 + 0.7 * (w[1] / max)) * 100).toFixed(1) + "%";
        w.push(percent);
        return w;
    });
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
                v-for="(word, index) in sorted_emojis"
                :key="index"
            >
                <div class="z-10">
                    <img v-if="word[0].slice(0,4) === 'http'" :src="word[0]" alt="emote" />
                    <span class="text-2xl" v-else>{{ word[0].slice(0,38) }}</span>
                </div>
                <div class="ml-auto z-10">{{ word[1].toFixed(1) }}</div>
                <div
                    class="absolute left-0 top-0 h-full bg-emerald-500/50 transition-[width] duration-300 rounded-lg"
                    :style="{width: word[2]}"
                ></div>
            </div>
        </div>
    </div>
</template>