<template>
    <div
        class="bg"
        ref="container"
        :style="{
    background: 'hsl(' + (time()) % 360 + ', 50%, 50%)'
}"
    >
        <button v-on:click="showMeta = !showMeta">Meta</button>
        <button v-on:click="showText = !showText">Text</button>
        <button v-on:click="showEmotes = !showEmotes">Emotes</button>
        <div v-show="showMeta">
            <h1>{{ channel }} {{ clientConnecting ? 'Connecting...' : '' }} {{ clientConnected ? 'Connected' : '' }}</h1>
            <h2>{{ currentChannels }}</h2>
            <h3>{{ client ? client.readyState() : '' }}</h3>
            <h3>{{ JSON.stringify(realChannels) }}</h3>
            <h3>{{ this.displayMessage }}</h3>

            <input type="text" v-model:value="channel" name="channel" v-on:change="connect" />
            <button v-on:click="disconnect">Disconnect</button>
            <input
                style="z-index: 2147483646; position: relative"
                type="text"
                v-model:value="testMessage"
                name="test"
                v-on:change="testMergeMessage"
            />
        </div>

        <div
            v-show="showText && message.count > 0.5"
            class="emoji svg"
            v-for="(message, index) in limitedWords"
            :style="{
            display: 'inline-block',
            // fontSize: ngramfontsize(message) + 'px',
            bottom: ngramfontsize(message) + 'px',
            left: textLeft(index, message) + 'px',
            // left: ((index * 220 ) + ngramfontsize(message)) % (windowWidth - Math.min(windowWidth*0.6, ngramfontsize(message) *6)) + 'px',
            width: Math.min(windowWidth*0.6, ngramfontsize(message) *6) + 'px',
            height: Math.min(windowHeight*0.6, ngramfontsize(message) *4) + 'px',
            zIndex: 999 + message.ts,
            // fontSize: message.count * 1.5 + 'px',
            // color: 'rgba(0,0,0,'+ ((index%10)) / 10 +')'
            // border: '1px solid black',
            // animation: (message.ts > (time()-5)) ?  'shake 0.5s' : '',
            opacity: message.count > 3 ? 1 : message.count/3,
            animation: 'shake 0.5s',
            animationPlayState: (message.ts > (time()-3)) ? 'running' : 'paused',
            animationIterationCount: 'infinite',
        }"
        >
            <svg viewBox="0 0 100 18">
                <text x="0" y="9">
                    {{ message.words }}
                    <!--                {{ parseInt(ngramfontsize(message)) }}-->
                </text>
            </svg>
        </div>

        <!--        <div v-show="showEmotes" class="emoji" v-for="(message, index) in topWords" :style="{-->
        <!--            display: 'inline-block',-->
        <!--            fontSize: ngramfontsize(message) + 'px',-->
        <!--            bottom: ngramfontsize(message) + 'px',-->
        <!--            left: (index * 220 % 800) + ngramfontsize(message) + 'px',-->
        <!--        }">{{ message.words }}</div>-->

        <div
            class="message"
            v-for="(message, index) in messages"
            :style="{
            // display: 'inline-block',
            // color: 'rgba(0,0,0,'+ ((index%10)) / 10 +')'
        }"
        >{{ message }}</div>

        <!--        <img v-for="emote in emoteArr" :src="emote.src" :width="(5 * emote.count) + 'px' "/>-->
        <!--        <div v-for="emote in emoteArrTs.slice(0,4)" >{{emote.ts}}</div>-->
        <!--        <img :src="oldest.src" alt="" width="200px">-->
        <!--        <img class="emoteImg" v-for="(emote, index) in Object.values(this.emoteArrTs)" :src="emote.src" :width="Math.min((20 * emote.count), 600) + 'px' "-->
        <!--        <img class="emoteImg" v-for="(emote, index) in emoteArrTs" :src="emote.src"-->
        <img
            v-show="showEmotes"
            class="emoteImg"
            v-for="(emote, index) in emoteArrTs"
            :src="emote.src"
            v-if="emote.count > 0.5"
            :width="Math.min((20 * emote.count), windowWidth / 5) + 'px' "
            v-bind:style="{
                bottom: ((emote.count * 20) % windowHeight) + 'px',
                left: emoteLeft(index, emote) + 'px',
                // left: ((index * 20) + (emote.count * 10)) % Math.min(emoteArr.length * 20, windowWidth) + 'px',
                zIndex: emote.now,
                opacity: Math.min(0.9, emote.count),
        }"
        />

        <div
            class="emoteImg"
            v-for="(emote, index) in emojis"
            v-if="emote.count > 0.5"
            :width="Math.min((20 * emote.count), 600) + 'px' "
            v-bind:style="{
                'font-size': ((index * 20) + (emote.count * 10)) % Math.min(20, windowWidth) + 'px',
                bottom: ((emote.count * 20) % windowHeight) + 'px',
                left: ((index * 20) + (emote.count * 10)) % Math.min(20, windowWidth)   + 'px',
                zIndex: emote.now,
                opacity: Math.min(0.9, emote.count),
        }"
        >{{ emote.src }}</div>

        <!--        <img class="d-block" v-for="(emote, index) in filtered" :src="emote.src" width="30px"/>-->
    </div>
</template>

<style scoped>
/*animation: shake 0.5s;*/
/*animation-iteration-count: infinite;*/

button {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: 1px solid white;
    border-radius: 2px;
    margin: 10px;
    padding: 10px;

    cursor: pointer;
}

h1 {
    font-size: 2em;
}

.message {
    width: 200px;
    max-width: 200px;
    word-break: break-all;
}
.bg {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}
.emoji {
    margin: 10px;
    position: absolute;
    transition: all 1.1s linear;
    animation-iteration-count: infinite;
}

.emoteImg {
    position: absolute;
    transition: all 1.1s ease-in-out;
    box-sizing: border-box;
    border-radius: 5%;
    /*background: white;*/

    /*background: black;*/

    /*-webkit-filter: blur(15px);*/
    /*filter: blur(15px);*/
}
</style>

<script>
// import {nGram} from "simplengrams";

import Classifier from "ml-classify-text";
import stopwords from "../stopwords";
export default {
    data() {
        return {
            testMessage: "",
            showMeta: true,
            showEmotes: true,
            showText: true,
            config: {
                minNgramCountForDisplay: 2,
                shrinkAfterSeconds: 50,
                wordTimeoutSeconds: 300,
            },
            client: null,

            messages: [],
            emotes: {},
            emojis: {},
            emoteArr: [],
            emoteArrTs: [],
            oldest: {},
            log: [],
            filtered: [],
            channel: "kitboga",
            ngrams: {},
            topWords: [],
            simplengrams: null,
            totalngrams: 1,
            displayWordsArray: [],
            wordsArrayMap: {},
            clientConnecting: false,
            clientConnected: false,
            realChannels: {},
            btvEmotes: {},
            btvEmotesArr: [],
            twitchUserId: "32787655",
            displayMessage: "none",
        };
    },
    mounted() {
        // this.getBetterTvEmotes();
        this.getBtvGlobalEmotes();
        this.getBtvUserEmotes();
        this.getBtvFrankerEmotes();

        this.simplengrams = require("simplengrams");

        // console.log(this.simplengrams);

        this.connect();

        // console.log(this.client.getChannels());

        setInterval(this.everySecond, 1000);

        setInterval(this.reduceEmotes, 1000);
        setInterval(this.reduceNgrams, 500);
        setInterval(this.calcNewDisplayWords, 500);
        setInterval(this.shuffleEmotes, 1000);
        //
        //     this.client.on('message', (channel, tags, message, self) => {
        //     if (self) return;
        //     console.log(tags, message.toLowerCase());
        //     if (message.toLowerCase() === '!hello') {
        //         client.say(channel, `@${tags.username}, heya!`);
        //     }
        // });
    },
    computed: {
        limitedWords() {
            return this.displayWordsArray.reverse().slice(0, 100);
        },
        currentChannels() {
            return JSON.stringify(this.client ? this.client.getChannels() : "");
        },

        // filteredEmotes () {
        //     return Object.entries(this.emotes).filter(emote => emote.count > 0.5)
        // },
        windowWidth() {
            return typeof window !== "undefined" ? window.innerWidth : 500;
            // return typeof window !== 'undefined' ? window.innerWidth - 200 : 500;
        },
        windowHeight() {
            // return 200;
            return typeof window !== "undefined"
                ? window.innerHeight - 200
                : 500;
        },
    },
    methods: {
        testMergeMessage() {
            this.ngrams[this.testMessage] = {
                words: this.testMessage,
                key: this.testMessage,
                ts: this.time(),
                // count: value,
                count: 50,
            };

            this.mergeEmojisFromMessage(this.testMessage);
        },

        everySecond() {
            this.displayMessage =
                this.btvEmotesArr.length +
                " - " +
                Object.values(this.btvEmotes).length;
        },

        httpGet(url, callback) {
            window.axios.get(url).then(callback);
        },

        getBtvGlobalEmotes() {
            const url = "https://api.betterttv.net/3/cached/emotes/global";
            this.httpGet(url, (response) => {
                console.log(response);
                for (let emote of response.data) {
                    emote.src =
                        "https://cdn.betterttv.net/emote/" + emote.id + "/3x";
                    this.btvEmotes[emote.code] = emote;
                    this.btvEmotesArr.push(emote);
                }
            });
        },
        getBtvUserEmotes() {
            const url =
                "https://api.betterttv.net/3/cached/users/twitch/" +
                this.twitchUserId;
            this.httpGet(url, (response) => {
                console.log(response);
                for (let emote of response.data.channelEmotes) {
                    emote.src =
                        "https://cdn.betterttv.net/emote/" + emote.id + "/3x";
                    this.btvEmotes[emote.code] = emote;
                    this.btvEmotesArr.push(emote);
                }
            });
        },
        getBtvFrankerEmotes() {
            const url =
                "https://api.betterttv.net/3/cached/frankerfacez/users/twitch/" +
                this.twitchUserId;
            this.httpGet(url, (response) => {
                console.log(response);
                for (let emote of response.data) {
                    emote.src =
                        "https://cdn.betterttv.net/frankerfacez_emote/" +
                        emote.id +
                        "/4";

                    this.btvEmotes[emote.code] = emote;
                    this.btvEmotesArr.push(emote);
                }
            });
        },

        getBetterTvEmotes() {
            // https://api.betterttv.net/3/cached/users/twitch/71092938
            // https://api.betterttv.net/3/cached/frankerfacez/users/twitch/71092938

            const urlGlobal =
                "https://api.betterttv.net/3/cached/emotes/global";

            window.axios
                .get(urlGlobal)
                .then((response) => {
                    console.log("success");
                    // console.log(response);

                    for (const emote of response.data) {
                        this.btvEmotes[emote.code] = emote;
                        this.btvEmotesArr.push(emote);
                    }

                    console.log(Object.values(this.btvEmotes).length);
                    console.log(this.btvEmotesArr.length);
                })
                .catch((error) => {
                    console.log(error);
                });
        },

        emoteLeft(index, emote) {
            const mod =
                (this.windowWidth -
                    Math.min(20 * emote.count, this.windowWidth / 5)) *
                2;

            let pos = (index * 20 + emote.count * 10) % mod;
            if (pos > mod / 2) {
                pos = mod / 2 - (pos - mod / 2);
            }
            return pos;
        },

        textLeft(index, message) {
            const mod =
                (this.windowWidth -
                    Math.min(
                        this.windowWidth * 0.6,
                        this.ngramfontsize(message) * 6
                    )) *
                2;

            let pos = (index * 220 + this.ngramfontsize(message)) % mod;
            if (pos > mod / 2) {
                pos = mod / 2 - (pos - mod / 2);
            }
            return pos;

            // left: ((index * 220 ) + ngramfontsize(message)) % (windowWidth - Math.min(windowWidth*0.6, ngramfontsize(message) *6)) + 'px',
        },

        ngramfontsize(ngram) {
            return (ngram.count / Math.min(this.totalngrams, 100)) * 50;
            return (this.totalngrams / ngram.count / 100) * 200;
        },

        ngram(message) {
            const classifier = new Classifier({
                nGramMin: 1,
                nGramMax: 2,
            });

            let tokens = classifier.tokenize(message);

            // console.log(tokens);
            return tokens;

            // return this.simplengrams(message);
            // return nGram(message);
        },

        /*

         */

        calcNewDisplayWords() {
            let filtered = Object.values(this.ngrams).filter(
                (ngram) => ngram.count > this.config.minNgramCountForDisplay
            );

            // console.log(this.displayWordsArray);
            // console.log(this.wordsArrayMap);
            for (const ngram of filtered) {
                // console.log(ngram);
                if (typeof this.wordsArrayMap[ngram.key] === "undefined") {
                    this.wordsArrayMap[ngram.key] =
                        this.displayWordsArray.length;
                    ngram.arraykey = this.wordsArrayMap[ngram.key];
                    this.displayWordsArray.push(
                        JSON.parse(JSON.stringify(ngram))
                    );
                } else {
                    if (
                        this.displayWordsArray[this.wordsArrayMap[ngram.key]]
                            .count < 3
                    ) {
                        this.displayWordsArray[
                            this.wordsArrayMap[ngram.key]
                        ].count += Math.max(4, ngram.count);
                    } else {
                        this.displayWordsArray[
                            this.wordsArrayMap[ngram.key]
                        ].count += ngram.count;
                    }
                    this.displayWordsArray[this.wordsArrayMap[ngram.key]].ts =
                        ngram.ts;
                }
                this.ngrams[ngram.key].count = 1;
            }

            let t = 1;
            for (const n of this.displayWordsArray.filter((n) => n.count > 0)) {
                t += n.count;
            }
            // this.displayWordsArray.filter(n => n.count > 2).forEach(n => t+=n.count);
            // console.log('t', t);
            this.totalngrams = t;
            // this.totalngrams = this.displayWordsArray.filter(n => n.count > 2).length;
        },

        getTopWords() {
            let top = [];
            let total = 0;
            for (const [key, value] of Object.entries(this.ngrams)) {
                if (value.count > 1) {
                    top.push(value);
                    // top.push({
                    //     words: key,
                    //     count: value
                    // });
                    total += value.count;
                }
            }
            this.totalngrams = total;
            top.sort((a, b) => {
                return b.count - a.count;
            });
            return top;

            // return Object.entries(this.ngrams).filter(ngram => ngram > 1);
            // return Object.entries(this.ngrams).filter(ngram => ngram.count > 1);
            // .map(ngram => ngram.words.join(" "));
        },

        time() {
            return Math.floor(Date.now() / 1000);
        },

        reduceNgrams() {
            const filtered = this.displayWordsArray.filter(
                (a) =>
                    a.count > 0 &&
                    a.ts < this.time() - this.config.shrinkAfterSeconds
            );

            for (const ngram of filtered) {
                if (ngram.ts < this.time() - this.config.wordTimeoutSeconds) {
                    ngram.count = 0;
                    // this.displayWordsArray[ngram.arraykey].count = 0;
                    // console.log('removing', ngram.key);
                } else {
                    ngram.count *= 0.7;
                    // this.displayWordsArray[ngram.arraykey].count *= 0.7;
                }
            }

            // for (const [key, ngram] of filtered) {
            //
            //     if (ngram.ts < this.time() - this.config.wordTimeoutSeconds) {
            //         this.displayWordsArray[key].count = 0;
            //         console.log('removing', ngram.key);
            //     } else {
            //         this.displayWordsArray[key].count *= 0.7;
            //     }
            //
            // }

            // for (const ngram of this.displayWordsArray.filter(a => a.count > 0 && a.ts < (this.time() - this.config.shrinkAfterSeconds))) {
            //     if (ngram.ts < this.time() - this.config.wordTimeoutSeconds) {
            //         this.ngrams[ngram.words].count = 0;
            //         console.log('removing', ngram.key);
            //     } else {
            //         this.ngrams[ngram.words].count *= 0.9;
            //     }
            // }

            // this.calcNewDisplayWords();

            return;
            //
            // let sorted = Object.values(this.ngrams).filter(a => a.ts < (this.time() - 10))
            //     .sort((a, b) => {
            //     return a.ts - b.ts;
            // });
            //
            //
            // for (let ngram of sorted) {
            //     this.ngrams[ngram.words].count *= 0.7;
            //     if (ngram.ts < this.time() - 30) {
            //         delete this.ngrams[ngram.words];
            //     }
            // }
        },

        countAnotherBtvEmote(emote) {
            if (typeof this.emotes[emote.code] !== "object") {
                this.emotes[emote.code] = {
                    key: emote.code,
                    count: 2,
                    src: emote.src,
                    ts: this.time(),
                    now: this.time(),
                };
            } else {
                this.emotes[emote.code].now = this.time().toString().slice(4);

                if (this.emotes[emote.code].count < 1) {
                    this.emotes[emote.code].count += 3;
                } else {
                    this.emotes[emote.code].count += 1;
                }
            }
        },

        mergeMessage(message) {
            // find btv emotes

            for (const emote of this.btvEmotesArr) {
                if (message.includes(emote.code)) {
                    message = message.replaceAll(emote.code, "");
                    this.countAnotherBtvEmote(emote);
                }
            }

            const ngrams = this.ngram(message);

            for (const [key, value] of Object.entries(ngrams)) {
                if (
                    stopwords(key) ||
                    (key.length < 3 && !key.match("[0-9]+"))
                ) {
                    continue;
                }
                let addon = key.includes(" ") > -1 ? 2 : 1;
                addon = Math.max(1, this.totalngrams * (addon / 100));
                if (typeof this.ngrams[key] === "undefined") {
                    this.ngrams[key] = {
                        words: key,
                        key: key,
                        ts: this.time(),
                        // count: value,
                        count: addon,
                    };
                } else {
                    this.ngrams[key].ts = this.time();
                    this.ngrams[key].count += addon;
                    // this.ngrams[key] += value;
                }
            }

            // for (const words of ngrams) {
            //     let joined = words.join("");
            //     if (typeof this.ngrams[joined] === 'undefined') {
            //         this.ngrams[joined] = {
            //             words: words,
            //             count: 1
            //         }
            //     } else {
            //         this.ngrams[joined].count += 1;
            //     }
            // }
        },

        resetData() {
            const data = {
                messages: [],
                emotes: {},
                emojis: {},
                emoteArr: [],
                emoteArrTs: [],
                oldest: {},
                log: [],
                filtered: [],
                ngrams: {},
                topWords: [],
                totalngrams: 1,
                displayWordsArray: [],
                wordsArrayMap: {},
                clientConnecting: false,
                clientConnected: false,
            };

            for (const [key, value] of Object.entries(data)) {
                this[key] = value;
            }
        },

        disconnect() {
            this.client.disconnect();
        },

        connect() {
            if (this.channel === "") {
                return;
            }
            this.resetData();

            if (this.client !== null) {
                this.client.disconnect();
            }
            this.client = new tmi.Client({
                options: {
                    debug: false,
                    messagesLogLevel: "info",
                    skipMembership: true,
                },
                connection: {
                    reconnect: true,
                    secure: true,
                },
                channels: [this.channel],
                // channels: ['Orchlon']
            });
            this.client.connect().catch((error) => {
                this.clientErrors = JSON.stringify(error);
            });
            this.client.on("message", this.onChatMessage);
            this.client.on("messagedeleted", this.onChatDeletedMessage);
            this.client.on("connecting", this.onConnecting);
            this.client.on("connected", this.onConnected);
        },

        onConnecting() {
            this.clientConnecting = true;
        },
        onConnected() {
            this.clientConnected = true;
        },

        isYes(message) {
            return message.toLowerCase().match(".*(yes|yea|yeah|yep).*");
        },

        shuffleEmotes() {
            return;
            this.emotes = Object.values(this.emotes).shuffle();
        },

        filteredEmotes() {
            return Object.values(this.emotes).filter(
                (emote) => emote.count > 0.25
            );
        },

        reduceEmotes() {
            for (const [key, value] of Object.entries(this.emotes)) {
                this.emotes[key].now = this.emotes[key].now;
                if (value.count > 50) {
                    this.emotes[key].count = Math.max(0.2, value.count * 0.7);
                } else {
                    this.emotes[key].count = Math.max(0.2, value.count * 0.9);
                }
            }

            for (const [key, value] of Object.entries(this.emojis)) {
                this.emojis[key].count = Math.max(0.2, value.count * 0.9);
            }
        },

        emoteStyle(emote) {
            return {
                bottom: emote * 10 + "px",
            };
        },

        stripEmotes(message, tags) {
            if (tags.emotes === null) {
                return message;
            }
            let filtered = message;
            // console.log(message);
            // console.log(tags.emotes);
            for (const [key, value] of Object.entries(tags.emotes)) {
                for (let piece of value) {
                    let pos = piece.split("-");
                    filtered =
                        filtered.slice(0, pos[0]) + filtered.slice(pos[1] + 1);
                    // filtered = filtered.slice(0, pos[0]) + filtered.slice((pos[1] - pos[0] + 1));
                }
            }
            // console.log(filtered);

            return filtered;
        },

        onChatDeletedMessage(channel, tags, message, self) {
            console.log(tags);
            console.log(message);
            this.messages.push(message);
        },

        mergeEmojisFromMessage(message) {
            let emojis = message
                .toLowerCase()
                .match(
                    "(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])"
                );
            if (emojis && emojis[0] !== "󠀀" && emojis[0] !== "󠀀[") {
                for (let emoji of emojis) {
                    if (emoji.includes("[")) {
                        continue;
                    }
                    if (typeof this.emotes[emoji] !== "object") {
                        this.emojis[emoji] = {
                            key: emoji,
                            count: 2,
                            src: emoji,
                            ts: this.time(),
                            now: this.time(),
                        };
                    } else {
                        this.emojis[emoji].count += 2;
                        this.emojis[emoji].now = this.time();
                    }
                }
                // this.messages.push(emojis.join(" "));
            }
        },

        onChatMessage(channel, tags, message, self) {
            if (self) return;
            if (typeof this.realChannels[channel] === "undefined") {
                this.realChannels[channel] = 1;
            } else {
                this.realChannels[channel]++;
            }
            let ts = tags["tmi-sent-ts"];

            // if (this.isYes(message)) {
            //     this.messages.push(message);
            // }

            this.mergeEmojisFromMessage(message);

            // let emojis = message.toLowerCase().match('(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])');
            //
            // if (emojis && emojis[0] !== "󠀀") {
            //
            //
            //
            //     for (let emoji of emojis) {
            //
            //         if (emoji === "[") {
            //             this.messages.push(message);
            //         }
            //
            //         if (typeof this.emotes[emoji] !== 'object') {
            //             this.emojis[emoji] = {
            //                 key: emoji,
            //                 count: 2,
            //                 src: emoji,
            //                 ts: ts,
            //                 now: ts,
            //             };
            //         } else {
            //             this.emojis[emoji].count += 2;
            //         }
            //
            //     }
            //
            //     this.messages.push(emojis.join(" "));
            // }

            this.mergeMessage(this.stripEmotes(message, tags));
            // this.topWords = this.getTopWords();

            if (this.messages.length > 10) {
                this.messages.shift();
            }

            if (tags.emotes !== null) {
                if (this.log.length > 12) {
                    this.log = [];
                    // this.log = this.log.slice(0, this.log.length - 12);
                    // this.log.shift();
                }
                // console.log(this.client.getChannels());

                let emotecount = 0;
                for (const [key, value] of Object.entries(tags.emotes)) {
                    emotecount += Math.min(value.length, 2);

                    if (typeof this.emotes[key] !== "object") {
                        this.emotes[key] = {
                            key: key,
                            count: Math.min(value.length, 2),
                            src:
                                "https://static-cdn.jtvnw.net/emoticons/v2/" +
                                key +
                                "/default/dark/3.0",
                            ts: ts,
                            now: ts,
                        };
                    } else {
                        this.emotes[key].now = parseInt(
                            parseInt(ts / 1000)
                                .toString()
                                .slice(4)
                        );

                        let addon = Math.max(
                            4 - this.emotes[key].count / 25,
                            0
                        );

                        if (this.emotes[key].count < 1) {
                            this.emotes[key].count += 3 * addon;
                        } else {
                            this.emotes[key].count += Math.max(
                                Math.min(value.length, addon),
                                addon
                            );
                            this.emotes[key].count = Math.min(
                                this.emoteArr.length * 3,
                                this.emotes[key].count
                            );
                        }
                    }

                    // let thisemote = {
                    //     key: key,
                    //     count: this.emotes[key] ? this.emotes[key].count + Math.min(value.length, 2) + 1 : 1,
                    //     src: "https://static-cdn.jtvnw.net/emoticons/v2/" + key + "/default/dark/3.0",
                    //     ts: ts,
                    // }
                    // this.emotes[key] = thisemote;
                    //
                    // this.log.push(this.emotes[key]);
                    // this.emotes.push("https://static-cdn.jtvnw.net/emoticons/v1/" + key +"/3.0");
                }

                this.emoteArrTs = Object.values(this.emotes);
                this.emoteArrTs = this.emoteArrTs.sort((a, b) => a.ts - b.ts);

                // this.filtered = this.filteredEmotes();

                // if (this.emoteArrTs.length > 10) {
                //
                //     // _.debounce(() => {
                //     let i = 0;
                //     for (let emote of this.emoteArrTs) {
                //
                //         let diff = emote.count - emotecount;

                // if (diff > 0) {
                //     this.emotes[emote.key].count = this.emotes[emote.key].count - emotecount;
                //     break;
                // } else {
                //
                //     let take = emotecount - emote.count;
                //     this.emotes[emote.key].count = 1;
                //     emotecount -= take;
                //     i += take;
                //
                // }

                // if (emote.count > emotecount) {
                //     this.emotes[emote.key].count -= emotecount
                //     break;
                // }
                // if (i > emotecount) {
                //     break;
                // }
                // if (emote.count > 0) {
                //     this.emotes[emote.key].count = this.emotes[emote.key].count - 1;
                //     this.oldest = this.emotes[emote.key];
                //     i++;
                // }
                // }
                // }, 250);

                // let i = 0;
                // for (let emote of this.emoteArrTs) {
                //     // let scale = Math.min(1, emote.count * ((i) / 10));
                //     // console.log(scale);
                //     if (i > emotecount) {
                //         break;
                //     }
                //     if (emote.count > emotecount) {
                //
                //     }
                //     if (emote.count > 0) {
                //         // this.emotes[emote.key].count--;
                //         // let newcount = emote.count * scale;
                //         // console.log(newcount);
                //         // if (newcount > 1) {
                //         // this.emotes[emote.key].count = newcount;
                //         //
                //         // }
                //         this.emotes[emote.key].count = this.emotes[emote.key].count-1;
                //         this.oldest = this.emotes[emote.key];
                //         // console.log('lowering');
                //         // break;
                //         i++;
                //     }
                // }

                // }

                // this.emoteArr = Object.values(this.emotes);
                // this.emoteArr.sort((a, b) => b.count - a.count);
                // console.log(tags);
            }
            // this.messages.push(message.toLowerCase());
            // console.log(tags, message.toLowerCase());
        },
    },
};

//
// const tmi = require('tmi.js');
// const client = new tmi.Client({
//     options: {
//         debug: false,
//         messagesLogLevel: "info",
//         skipMembership: true,
//     },
//     connection: {
//         reconnect: true,
//         secure: true
//     },
//     channels: [ 'xQcOW' ]
// });
// client.connect().catch(console.error);
// client.on('message', (channel, tags, message, self) => {
//     if(self) return;
//     console.log(tags, message.toLowerCase());
//     if(message.toLowerCase() === '!hello') {
//         client.say(channel, `@${tags.username}, heya!`);
//     }
// });
</script>
