import { musics as originalMusics } from "./musics.js";
import { musicTimeFormatter } from "./formatters.js";

import {
  renderFavoriteButton,
  renderRepeatButton,
  renderShuffleButton,
  renderPlayOrPauseButton,
  renderMusicPlaylist,
} from "./render.js";

let sortedPlaylist = [...originalMusics];

// Music Info Elements
const $musicCover = document.getElementById("music-cover");
const $musicAudio = document.getElementById("music-audio");
const $musicName = document.getElementById("music-name");
const $artistName = document.getElementById("artist-name");
const $currentProgressBar = document.getElementById("current-progress");
const $progressContainer = document.getElementById("progress-container");
const $musicCurrentTime = document.getElementById("music-current-time");
const $musicDuration = document.getElementById("music-duration");
const $musicLoading = document.getElementById("music-loading");
const $player = document.getElementById("player");
const $backgroundCover = document.getElementById("background-cover");

const $playlist = document.getElementById("playlist");

// Music control buttons
const $favoriteButton = document.getElementById("favorite-button");
const $shuffleButton = document.getElementById("shuffle-button");
const $backButton = document.getElementById("back-button");
const $playButton = document.getElementById("play-button");
const $skipButton = document.getElementById("skip-button");
const $repeatButton = document.getElementById("repeat-button");

// Music States
let currentMusic = JSON.parse(localStorage.getItem("currentMusic")) || {
  index: 0,
  id: 1,
};
let musicIsPlaying = false;
let repeatMusic = localStorage.getItem("repeatMusic") == "true" ? true : false;
let musicIsShuffled =
  localStorage.getItem("musicIsShuffled") == "true" ? true : false;
let favoriteMusics = JSON.parse(localStorage.getItem("favoriteMusics")) || [];

function initializeMusic(crtMusic = currentMusic) {
  currentMusic = crtMusic;
  musicIsPlaying = false;
  renderFavoriteButton($favoriteButton, favoriteMusics, currentMusic);
  renderRepeatButton($repeatButton, repeatMusic);
  renderShuffleButton($shuffleButton, musicIsShuffled);

  $musicCover.setAttribute("src", sortedPlaylist[currentMusic.index].cover);
  $musicCover.setAttribute("alt", sortedPlaylist[currentMusic.index].name);
  $musicAudio.setAttribute("src", sortedPlaylist[currentMusic.index].audio);
  $musicName.innerText = sortedPlaylist[currentMusic.index].name;
  $artistName.innerText =
    sortedPlaylist[currentMusic.index].artist || "Desconhecido";

  $musicAudio.addEventListener("loadedmetadata", () => {
    $musicDuration.innerText = musicTimeFormatter($musicAudio.duration);
  });
  $musicCover.addEventListener("load", () => {
    $player.classList.remove("hidden");
    $musicLoading.classList.add("hidden");

    $backgroundCover.style.backgroundImage = `url(${
      sortedPlaylist[currentMusic.index].cover
    })`;
  });
}

function favoriteMusicToggle() {
  if (favoriteMusics.indexOf(currentMusic.id) == -1) {
    favoriteMusics.push(currentMusic.id);
  } else {
    const indexOf = favoriteMusics.indexOf(currentMusic.id);
    favoriteMusics.splice(indexOf, 1);
  }

  localStorage.setItem("favoriteMusics", JSON.stringify(favoriteMusics));
  renderFavoriteButton($favoriteButton, favoriteMusics, currentMusic);
}

function updatePlaylistMusicPlaying() {
  const music = sortedPlaylist[currentMusic.index];

  const $playing = document.getElementsByClassName("playing");
  const $musicPlaying = document.getElementById(music.id);

  sortedPlaylist.map((_, i) => {
    if ($playing.item(i) != null || !musicIsPlaying) {
      $playing.item(i)?.classList?.remove("playing");
    } else {
      $musicPlaying.classList.add("playing");
    }
  });
}

function playOrPauseMusic() {
  if (!musicIsPlaying) {
    $musicAudio.play();
    localStorage.setItem("currentMusic", JSON.stringify(currentMusic));
    musicIsPlaying = true;
  } else {
    $musicAudio.pause();
    musicIsPlaying = false;
  }

  updatePlaylistMusicPlaying();
  renderPlayOrPauseButton($playButton, musicIsPlaying);
}

function skipMusic() {
  if (currentMusic.index != sortedPlaylist.length - 1) {
    const index = currentMusic.index + 1;
    currentMusic = { index, id: sortedPlaylist[index].id };
  } else {
    currentMusic = { index: 0, id: sortedPlaylist[0].id };
  }
  initializeMusic();
  playOrPauseMusic();
}

function backMusic() {
  if (currentMusic.index != 0) {
    const index = currentMusic.index - 1;
    currentMusic = { index, id: sortedPlaylist[index].id };
  } else {
    const index = sortedPlaylist.length - 1;
    currentMusic = { index, id: sortedPlaylist[index].id };
  }
  initializeMusic();
  playOrPauseMusic();
}

function repeatMusicToggle() {
  repeatMusic ? (repeatMusic = false) : (repeatMusic = true);
  localStorage.setItem("repeatMusic", repeatMusic);
  renderRepeatButton($repeatButton, repeatMusic);
}

function shuffleMusics(preShuffleMusics) {
  const size = preShuffleMusics.length;
  let currentIndex = size - 1;
  while (currentIndex > 0) {
    let randomIndex = Math.floor(Math.random() * size);
    let aux = preShuffleMusics[currentIndex];
    preShuffleMusics[currentIndex] = preShuffleMusics[randomIndex];
    preShuffleMusics[randomIndex] = aux;
    currentIndex -= 1;
  }
}

function shuffleMusicToggle() {
  if (musicIsShuffled) {
    musicIsShuffled = false;
    sortedPlaylist = [...originalMusics];
  } else {
    musicIsShuffled = true;
    localStorage.setItem("musicIsShuffled", true);
    shuffleMusics(sortedPlaylist);
  }

  localStorage.setItem("musicIsShuffled", musicIsShuffled);
  renderShuffleButton($shuffleButton, musicIsShuffled);
  renderMusicPlaylist(
    sortedPlaylist,
    $playlist,
    currentMusic,
    $musicAudio,
    initializeMusic,
    playOrPauseMusic
  );
}

function jumpTo(e) {
  const width = $progressContainer.clientWidth;
  const clickPosition = e.offsetX;
  const jumpToTime = (clickPosition / width) * $musicAudio.duration;
  $musicAudio.currentTime = jumpToTime;
}

function updateProgressBar() {
  const progress = ($musicAudio.currentTime * 100) / $musicAudio.duration;
  $currentProgressBar.style.setProperty("--progress", `${progress || 0}%`);
  $musicCurrentTime.innerText = musicTimeFormatter($musicAudio.currentTime);
}

function updateMusicIsPlayingState(e) {
  if (e.type == "play") {
    musicIsPlaying = true;
  } else if (e.type == "pause") {
    musicIsPlaying = false;
  }

  renderPlayOrPauseButton($playButton, musicIsPlaying);
}

function musicEnded() {
  if (repeatMusic) {
    musicIsPlaying = false;
    playOrPauseMusic();
  } else {
    skipMusic();
  }
}

// Music Control Buttons Event
$playButton.addEventListener("click", playOrPauseMusic);
$backButton.addEventListener("click", backMusic);
$skipButton.addEventListener("click", skipMusic);
$repeatButton.addEventListener("click", repeatMusicToggle);
$shuffleButton.addEventListener("click", shuffleMusicToggle);
$favoriteButton.addEventListener("click", favoriteMusicToggle);
$progressContainer.addEventListener("click", jumpTo);

// Music Events
$musicAudio.addEventListener("timeupdate", updateProgressBar);
$musicAudio.addEventListener("pause", updateMusicIsPlayingState);
$musicAudio.addEventListener("play", updateMusicIsPlayingState);
$musicAudio.addEventListener("ended", musicEnded);

// DOM Events
document.addEventListener("DOMContentLoaded", () => {
  if (musicIsShuffled) {
    shuffleMusics(sortedPlaylist);
  }
  initializeMusic();
  renderMusicPlaylist(
    sortedPlaylist,
    $playlist,
    currentMusic,
    $musicAudio,
    initializeMusic,
    playOrPauseMusic
  );
});
