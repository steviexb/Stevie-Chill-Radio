// ==========================================
// STEVIE'S CHILL RADIO
// ==========================================


// ==========================================
// MUSIC LIBRARY
//
// THIS IS THE PART YOU EDIT.
//
// Add songs using:
//
// {
//     title: "Song Title",
//     artist: "Artist / Game / Soundtrack",
//     url: "FULL YOUTUBE URL"
// },
//
// ==========================================

const songs = [

    {
        title: "Ritchie (Together Forever)",
        artist: "Pokémon Puzzle League",
        url: "https://www.youtube.com/watch?v=g3OJh7CytKw"
    },

    {
        title: "Morning Dew",
        artist: "Dragon Ball Z Budokai Tenkaichi 2",
        url: "https://www.youtube.com/watch?v=wf9pmAg8UVQ"
    },

    {
        title: "Museum",
        artist: "Sonic Mega Collection",
        url: "https://www.youtube.com/watch?v=EmFsRw6zGi0"
    },

    {
        title: "Manuals",
        artist: "Sonic Gems Collection",
        url: "https://www.youtube.com/watch?v=a4PFFoudmho"
    },

    {
        title: "Nostalgic Days - Two Days Ago Animal Crossing Remix",
        artist: "Ballad of Battle",
        url: "https://www.youtube.com/watch?v=WXFiAypd_wY"
    },

    {
        title: "Road Taken (Calm)",
        artist: "Fire Emblem Fates",
        url: "https://www.youtube.com/watch?v=pcJ-iFIIHOQ"
    },

    {
        title: "White Wafers 6",
        artist: "Kirby's Return to Dream Land",
        url: "https://www.youtube.com/watch?v=nXchQdoDAaQ"
    },

    {
        title: "His World Lofi Mix",
        artist: "Sonic The Hedgehog '06",
        url: "https://www.youtube.com/watch?v=8mfOSTcTQNs"
    },

    {
        title: "Route 216 Remix",
        artist: "Pokémon Diamond & Pearl",
        url: "https://www.youtube.com/watch?v=k6mA_Yii7pw"
    },

    {
        title: "Evening Star",
        artist: "Knuckles Chaotix",
        url: "https://www.youtube.com/watch?v=fbHzUWTkmpE"
    }

];


// ==========================================
// STEVIE'S NOTES
// ==========================================

const stationNotes = [

    "It's not over. We're just getting started.",

    "Whatever you manage to get done today is enough.",

    "I promise I won't give up if you don't.",

    "Let's slow down a bit. You've got this.",

    "Don't forget to check in with your breathing.",

    "Mindfulness exercise: Check your surroundings. Name 5 things you can see.",

    "You're not going in circles. You're learning something new every time.",

    "Lock in. Or don't. Whichever you need right now.",

    "Nothing really matters, and that's the beauty of it.",

    "\"My journey only ends when I stop running.\" — Sonic",

    "You deserve to see how far you can go.",

    "Our minds tell us anxious lies. Everything will be okay.",

    "Become more you every day.",

    "Being brave doesn't mean I'm not scared; it just means I won't stop.",

    "When the rain starts pouring down, let it wash your soul anew."

];


// ==========================================
// RADIO MACHINERY
//
// You generally don't need to edit anything
// below this point.
// ==========================================


// ------------------------------------------
// YOUTUBE ID
// ------------------------------------------

function getYouTubeID(url) {

    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?]+)/
    );

    return match ? match[1] : null;
}


// Build usable library.

const library = songs
    .map((song, index) => {

        return {
            ...song,
            id: getYouTubeID(song.url),
            libraryIndex: index
        };

    })
    .filter(song => song.id);


// ------------------------------------------
// PLAYER VARIABLES
// ------------------------------------------

let player;

let currentSong = null;

let shuffleQueue = [];

let history = [];

let historyPosition = -1;

let recentlyPlayed = [];

let lastNoteIndex = -1;


// ------------------------------------------
// SHUFFLE
// ------------------------------------------

function shuffleArray(array) {

    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [shuffled[i], shuffled[j]] =
            [shuffled[j], shuffled[i]];
    }

    return shuffled;
}


// ------------------------------------------
// REFILL SHUFFLE QUEUE
// ------------------------------------------

function refillShuffleQueue() {

    shuffleQueue = shuffleArray(library);

    if (
        shuffleQueue.length > 1 &&
        currentSong &&
        shuffleQueue[0].id === currentSong.id
    ) {

        [shuffleQueue[0], shuffleQueue[1]] =
            [shuffleQueue[1], shuffleQueue[0]];
    }
}


// ------------------------------------------
// GET NEXT RANDOM SONG
// ------------------------------------------

function getNextRandomSong() {

    if (shuffleQueue.length === 0) {
        refillShuffleQueue();
    }

    return shuffleQueue.shift();
}


// ------------------------------------------
// YOUTUBE PLAYER
// ------------------------------------------

function onYouTubeIframeAPIReady() {

    refillShuffleQueue();

    currentSong = getNextRandomSong();

    history.push(currentSong);

    historyPosition = 0;


    player = new YT.Player("player", {

        height: "390",

        width: "640",

        videoId: currentSong.id,

        playerVars: {

            autoplay: 0,

            controls: 1,

            rel: 0
        },

        events: {

            onReady: onPlayerReady,

            onStateChange: onPlayerStateChange
        }
    });
}


// ------------------------------------------
// PLAYER READY
// ------------------------------------------

function onPlayerReady() {

    updateTrackInfo();

    updateTrackCounter();

    changeStationNote();

    renderRecentlyPlayed();
}


// ------------------------------------------
// PLAYER STATE
// ------------------------------------------

function onPlayerStateChange(event) {

    if (event.data === YT.PlayerState.ENDED) {

        updateEqualizer(false);

        nextSong();
    }


    if (event.data === YT.PlayerState.PLAYING) {

        updateTrackInfo();

        updateEqualizer(true);
    }


    if (
        event.data === YT.PlayerState.PAUSED ||
        event.data === YT.PlayerState.CUED
    ) {

        updateEqualizer(false);
    }
}


// ------------------------------------------
// SAVE CURRENT SONG TO RECENTLY PLAYED
// ------------------------------------------

function saveCurrentToRecentlyPlayed() {

    if (!currentSong) {
        return;
    }


    if (
        recentlyPlayed.length === 0 ||
        recentlyPlayed[0].id !== currentSong.id
    ) {

        recentlyPlayed.unshift(currentSong);
    }


    recentlyPlayed =
        recentlyPlayed.slice(0, 3);


    renderRecentlyPlayed();
}


// ------------------------------------------
// NEXT SONG
// ------------------------------------------

function nextSong() {

    saveCurrentToRecentlyPlayed();


    if (historyPosition < history.length - 1) {

        historyPosition++;

        currentSong =
            history[historyPosition];

    } else {

        currentSong =
            getNextRandomSong();

        history.push(currentSong);

        historyPosition =
            history.length - 1;
    }


    player.loadVideoById(
        currentSong.id
    );


    updateTrackInfo();

    updateTrackCounter();

    changeStationNote();
}


// ------------------------------------------
// PREVIOUS SONG
// ------------------------------------------

function previousSong() {

    if (historyPosition <= 0) {
        return;
    }


    saveCurrentToRecentlyPlayed();


    historyPosition--;

    currentSong =
        history[historyPosition];


    player.loadVideoById(
        currentSong.id
    );


    updateTrackInfo();

    updateTrackCounter();

    changeStationNote();
}


// ------------------------------------------
// CUSTOM NOW PLAYING INFORMATION
// ------------------------------------------

function updateTrackInfo() {

    if (!currentSong) {
        return;
    }


    document
        .getElementById("track-title")
        .textContent =
        currentSong.title;


    document
        .getElementById("track-artist")
        .textContent =
        currentSong.artist;
}


// ------------------------------------------
// TRACK COUNTER
// ------------------------------------------

function updateTrackCounter() {

    const counter =
        document.getElementById(
            "track-counter"
        );


    if (!counter || !currentSong) {
        return;
    }


    const songNumber =
        currentSong.libraryIndex + 1;


    counter.textContent =
        `TRACK ${String(songNumber).padStart(2, "0")} / ${String(library.length).padStart(2, "0")}`;
}


// ------------------------------------------
// RECENTLY PLAYED
// ------------------------------------------

function renderRecentlyPlayed() {

    const container =
        document.getElementById(
            "recent-tracks"
        );


    if (!container) {
        return;
    }


    if (recentlyPlayed.length === 0) {

        container.textContent =
            "Nothing yet — the broadcast just started.";

        return;
    }


    container.innerHTML =
        recentlyPlayed
            .map(song => {

                return `
                    <span class="recent-track">
                        ${escapeHTML(song.title)}
                    </span>
                `;

            })
            .join(
                `<span class="recent-divider">•</span>`
            );
}


// ------------------------------------------
// HTML SAFETY
// ------------------------------------------

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ------------------------------------------
// ROTATING STEVIE'S NOTES
// ------------------------------------------

function changeStationNote() {

    const message =
        document.querySelector(
            ".message-text"
        );


    if (
        !message ||
        stationNotes.length === 0
    ) {
        return;
    }


    let newIndex;


    if (stationNotes.length === 1) {

        newIndex = 0;

    } else {

        do {

            newIndex =
                Math.floor(
                    Math.random() *
                    stationNotes.length
                );

        } while (
            newIndex === lastNoteIndex
        );
    }


    lastNoteIndex = newIndex;


    message.textContent =
        stationNotes[newIndex];
}


// ------------------------------------------
// BUTTONS
// ------------------------------------------

document
    .getElementById("next-button")
    .addEventListener(
        "click",
        nextSong
    );


document
    .getElementById("previous-button")
    .addEventListener(
        "click",
        previousSong
    );


// ------------------------------------------
// LIVE CLOCK
// ------------------------------------------

function updateClock() {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit"
        });


    const clock =
        document.getElementById(
            "station-clock"
        );


    if (clock) {

        clock.textContent =
            time;
    }
}


updateClock();


setInterval(
    updateClock,
    1000
);


// ------------------------------------------
// EQUALIZER
// ------------------------------------------

function updateEqualizer(isPlaying) {

    const equalizer =
        document.getElementById(
            "equalizer"
        );


    if (!equalizer) {
        return;
    }


    if (isPlaying) {

        equalizer.classList.add(
            "playing"
        );

    } else {

        equalizer.classList.remove(
            "playing"
        );
    }
}
