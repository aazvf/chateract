import stopwords from "@/assets/data/stopwords";

export default defineNuxtPlugin(() => {
    return {
        provide: {
            is_stopword: (word) => stopwords.indexOf(word.toLowerCase()) > -1,
        },
    };
});
