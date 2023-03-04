import { musicTimeFormatter } from "./formatters.js";

export function renderFavoriteButton(button, favoriteMusics, currentMusic) {
  const $FavoriteIconElement = button.firstElementChild;

  if (favoriteMusics.indexOf(currentMusic.id) == -1) {
    $FavoriteIconElement.classList.remove("state-active");
    $FavoriteIconElement.classList.replace("ph-heart-fill", "ph-heart");
    button.setAttribute("title", "Favoritar");
  } else {
    $FavoriteIconElement.classList.add("state-active");
    $FavoriteIconElement.classList.replace("ph-heart", "ph-heart-fill");
    button.setAttribute("title", "Remover favorito");
  }
}

export function renderRepeatButton(button, repeatMusic) {
  const $repeatIconElement = button.firstElementChild;

  if (repeatMusic) {
    $repeatIconElement.classList.add("state-active");
    $repeatIconElement.classList.replace(
      "ph-repeat-fill",
      "ph-repeat-once-fill"
    );
    button.setAttribute("title", "Não repetir");
  } else {
    $repeatIconElement.classList.remove("state-active");
    $repeatIconElement.classList.replace(
      "ph-repeat-once-fill",
      "ph-repeat-fill"
    );
    button.setAttribute("title", "Repetir");
  }
}

export function renderShuffleButton(button, musicIsShuffled) {
  const $shuffleIconElement = button.firstElementChild;

  if (musicIsShuffled) {
    $shuffleIconElement.classList.add("state-active");
    button.setAttribute("title", "Desativar ordem aleatória");
  } else {
    $shuffleIconElement.classList.remove("state-active");
    button.setAttribute("title", "Ativar ordem aleatória");
  }
}

export function renderPlayOrPauseButton(button, musicIsPlaying) {
  const $iconElement = button.firstElementChild;

  if (!musicIsPlaying) {
    $iconElement.classList.replace("ph-pause-fill", "ph-play-fill");
    button.setAttribute("title", "Play");
  } else {
    $iconElement.classList.replace("ph-play-fill", "ph-pause-fill");
    button.setAttribute("title", "Pausar");
  }
}

export function renderMusicPlaylist(
  playlist,
  playlistElement,
  currentMusic,
  $musicAudio,
  initializeMusic,
  playOrPauseMusic
) {
  playlistElement.innerHTML = "";
  const $musicsLoading = document.getElementById("musics-loading");

  playlist.map((music, i) => {
    const audio = new Audio(music.audio);

    playlistElement.insertAdjacentHTML(
      "beforeend",
      `
      <button
        type="button"
        title="${currentMusic.id === music.id ? "Pausar" : "Tocar"} ${
        music.name
      }"
        class="playlist__music ${currentMusic.id === music.id && "playing"}"
        id="${music.id}"
      >
        <div class="playlist__music__info">
          <img
            class="playlist__music__cover"
            id="cover-${music.id}"
            src="${music.cover}"
            alt="${music.name}"
          />
          <div class="playlist__music__info__container">
            <h3 class="playlist__music__title">${music.name}</h3>
            <p class="playlist__music__artist">${music.artist}</p>
          </div>
        </div>
        <span 
          id="${music.id}-duration"
          class="playlist__music__duration"
        >
          00:00
        </span>
      </button>
      `
    );

    audio.onloadedmetadata = () => {
      const $musicDuration = document.getElementById(`${music.id}-duration`);
      const musicDuration = musicTimeFormatter(audio.duration);
      $musicDuration.innerHTML = musicDuration;

      document.getElementById(music.id).addEventListener("click", () => {
        if (music.id !== currentMusic.id || $musicAudio.currentTime === 0) {
          const index = playlist.indexOf(music);
          currentMusic = { index, id: playlist[index].id };
          initializeMusic(currentMusic);
        }
        playOrPauseMusic();
      });

      if (i === playlist.length - 1 && $musicsLoading) {
        $musicsLoading.remove();
        playlistElement.classList.remove("hidden");
      }
    };
  });
}
