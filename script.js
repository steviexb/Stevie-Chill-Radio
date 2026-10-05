// ==========================================
// STEVIE'S CHILL RADIO
// ==========================================


// ==========================================
// PLAYLIST
//
// ADD NEW SONGS HERE.
// Just paste the full YouTube URL.
// ==========================================

const songs = [
    "https://www.youtube.com/watch?v=g3OJh7CytKw",
    "https://www.youtube.com/watch?v=wf9pmAg8UVQ",
    "https://www.youtube.com/watch?v=EmFsRw6zGi0",
    "https://www.youtube.com/watch?v=a4PFFoudmho",
    "https://www.youtube.com/watch?v=WXFiAypd_wY",
    "https://www.youtube.com/watch?v=pcJ-iFIIHOQ",
    "https://www.youtube.com/watch?v=nXchQdoDAaQ",
    "https://www.youtube.com/watch?v=8mfOSTcTQNs",
    "https://www.youtube.com/watch?v=k6mA_Yii7pw",
    "https://www.youtube.com/watch?v=fbHzUWTkmpE"
];


// ==========================================
// STEVIE'S NOTES
//
// We'll replace these with your actual
// station messages later.
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
// DON'T REALLY NEED TO TOUCH STUFF BELOW HERE
// ==========================================


function getYouTubeID(url) {

    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?]+)/
    );

    return match ? match[1] : null;
}


const playlist = songs
    .map(getYouTubeID)
    .filter(Boolean);


// ------------------------------------------
// PLAYER VARIABLES
// ------------------------------------------

let player;

let currentVideoId = null;

let shuffleQueue = [];

let history = [];

let historyPosition = -1;

let recentlyPlayed = [];

let lastNoteIndex = -1;


// ------------------------------------------
// SHUFFLE
// Fisher-Yates shuffle
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
// BUILD A NEW SHUFFLE QUEUE
// ------------------------------------------

function refillShuffleQueue() {

    shuffleQueue = shuffleArray(playlist);

    // Prevent the first song of the new cycle
    // from being the song currently playing.

    if (
        shuffleQueue.length > 1 &&
        shuffleQueue[0] === currentVideoId
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

    currentVideoId = getNextRandomSong();

    history.push(currentVideoId);

    historyPosition = 0;

    player = new YT.Player("player", {

        height: "390",
        width: "640",

        videoId: currentVideoId,

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

    if (!player || !player.getVideoData) {
        return;
    }

    const data = player.getVideoData();

    if (!data || !data.title) {
        return;
    }

    // Avoid adding the same track twice in a row.

    if (
        recentlyPlayed.length === 0 ||
        recentlyPlayed[0].videoId !== currentVideoId
    ) {

        recentlyPlayed.unshift({
            videoId: currentVideoId,
            title: data.title,
            artist: data.author || "YouTube"
        });
    }

    // Only remember the last three.

    recentlyPlayed =
        recentlyPlayed.slice(0, 3);

    renderRecentlyPlayed();
}


// ------------------------------------------
// NEXT SONG
// ------------------------------------------

function nextSong() {

    saveCurrentToRecentlyPlayed();


    // If the listener previously hit Previous,
    // Next moves forward through that history first.

    if (historyPosition < history.length - 1) {

        historyPosition++;

        currentVideoId =
            history[historyPosition];

    } else {

        currentVideoId =
            getNextRandomSong();

        history.push(currentVideoId);

        historyPosition =
            history.length - 1;
    }


    player.loadVideoById(currentVideoId);

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

    currentVideoId =
        history[historyPosition];

    player.loadVideoById(currentVideoId);

    updateTrackCounter();

    changeStationNote();
}


// ------------------------------------------
// UPDATE NOW PLAYING
// ------------------------------------------

function updateTrackInfo() {

    if (!player || !player.getVideoData) {
        return;
    }

    const videoData =
        player.getVideoData();

    const title =
        videoData.title ||
        "Stevie's Chill Radio";

    const artist =
        videoData.author ||
        "YouTube";

    document
        .getElementById("track-title")
        .textContent = title;

    document
        .getElementById("track-artist")
        .textContent = artist;
}


// ------------------------------------------
// TRACK COUNTER
// ------------------------------------------

function updateTrackCounter() {

    const counter =
        document.getElementById("track-counter");

    if (!counter) {
        return;
    }

    const songNumber =
        playlist.indexOf(currentVideoId) + 1;

    counter.textContent =
        `TRACK ${String(songNumber).padStart(2, "0")} / ${String(playlist.length).padStart(2, "0")}`;
}


// ------------------------------------------
// RECENTLY PLAYED
// ------------------------------------------

function renderRecentlyPlayed() {

    const container =
        document.getElementById("recent-tracks");

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
            .map(track => {

                return `
                    <span class="recent-track">
                        ${escapeHTML(track.title)}
                    </span>
                `;

            })
            .join(
                `<span class="recent-divider">•</span>`
            );
}


// ------------------------------------------
// BASIC HTML SAFETY
// ------------------------------------------

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ------------------------------------------
// ROTATING STATION NOTES
// ------------------------------------------

function changeStationNote() {

    const message =
        document.querySelector(".message-text");

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
// LIVE STATION CLOCK
// ------------------------------------------

function updateClock() {

    const now = new Date();

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
        clock.textContent = time;
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
