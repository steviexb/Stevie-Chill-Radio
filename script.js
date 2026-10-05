// ==========================================
// STEVIE'S CHILL RADIO
// ==========================================

// Add/remove YouTube songs here.
// You can paste the FULL YouTube URL.
// No need to extract the video ID yourself.

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


// ------------------------------------------
// Convert a YouTube URL into a video ID
// ------------------------------------------

function getYouTubeID(url) {
    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?]+)/
    );

    return match ? match[1] : null;
}


// Turn our URLs into IDs for the player

const playlist = songs
    .map(getYouTubeID)
    .filter(Boolean);


// ------------------------------------------
// RADIO
// ------------------------------------------

let player;
let currentSong = 0;


// YouTube calls this automatically when ready

function onYouTubeIframeAPIReady() {

    player = new YT.Player("player", {

        height: "390",
        width: "640",

        videoId: playlist[currentSong],

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
}


// ------------------------------------------
// DETECT WHEN SONG ENDS
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
// NEXT SONG
// ------------------------------------------

function nextSong() {

    currentSong++;

    if (currentSong >= playlist.length) {
        currentSong = 0;
    }

    player.loadVideoById(playlist[currentSong]);
}


// ------------------------------------------
// PREVIOUS SONG
// ------------------------------------------

function previousSong() {

    currentSong--;

    if (currentSong < 0) {
        currentSong = playlist.length - 1;
    }

    player.loadVideoById(playlist[currentSong]);
}


// ------------------------------------------
// UPDATE "NOW PLAYING"
// ------------------------------------------

function updateTrackInfo() {

    if (!player || !player.getVideoData) {
        return;
    }

    const videoData = player.getVideoData();

    const title =
        videoData.title ||
        "Stevie's Chill Radio";

    const artist =
        videoData.author ||
        "YouTube";

    document.getElementById("track-title").textContent = title;
    document.getElementById("track-artist").textContent = artist;
}


// ------------------------------------------
// BUTTONS
// ------------------------------------------

document
    .getElementById("next-button")
    .addEventListener("click", nextSong);

document
    .getElementById("previous-button")
    .addEventListener("click", previousSong);
// ------------------------------------------
// LIVE STATION CLOCK
// ------------------------------------------

function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const clock = document.getElementById("station-clock");

    if (clock) {
        clock.textContent = time;
    }
}

updateClock();

setInterval(updateClock, 1000);


// ------------------------------------------
// EQUALIZER STATUS
// ------------------------------------------

function updateEqualizer(isPlaying) {

    const equalizer =
        document.getElementById("equalizer");

    if (!equalizer) {
        return;
    }

    if (isPlaying) {
        equalizer.classList.add("playing");
    } else {
        equalizer.classList.remove("playing");
    }
}
