import { getSavedMovies, saveToLocalStorage } from "./main.js";
import { updateHomeWatchlist, displayWatchlist } from "./watchlist.js";
import { fetchMovieDetails } from "./api.js";

export function displayMovies(movies, sectionID, filter = 7) {

  let section = document.querySelector(sectionID);

  if (!section) return;

  section.innerHTML = "";

  movies.slice(0, filter).forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie-card");

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
      <div class="overlay">
        <span class="addIcon material-symbols-outlined">bookmark_add</span>
        <span class="infoIcon material-symbols-outlined">info</span>
      </div>
      `;

    section.appendChild(div);

    const infoIcon = div.querySelector(".infoIcon");
    const bookmarkIcon = div.querySelector(".addIcon");

    let savedMovies = getSavedMovies();

    if (savedMovies.find(m => m.id === movie.id)) {
      bookmarkIcon.textContent = "bookmark_added";
    }

    bookmarkIcon.addEventListener("click", (e) => {
      e.stopPropagation();

      let savedMovies = getSavedMovies();

      const exists = savedMovies.find(m => m.id === movie.id);

      if (!exists) {
        savedMovies.push(movie);
        bookmarkIcon.textContent = "bookmark_added";

      } else {
        savedMovies = savedMovies.filter(m => m.id !== movie.id);
        bookmarkIcon.textContent = "bookmark_add";
      }

      saveToLocalStorage(savedMovies);
      displayWatchlist(savedMovies, "#saved-movies");
      updateHomeWatchlist();
    });

    infoIcon.addEventListener("click", async () => {
      fetchMovieDetails(movie);
    });

  });
};

export async function displayModal(movie, cast, trailerID, recommendations) {

  const modal = document.querySelector(".modal");
  const modalContent = document.querySelector(".modal-content");
  const title = movie.title || movie.name || "";

  modalContent.innerHTML = `
      <span class="closeIcon material-symbols-outlined">close</span>
      <div class="poster">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
      </div>
      <div class="about">
        <div class="title-type">
          <h2>${title}</h2>
          <button>${getMediaLabel(movie.media_type)}</button>
        </div>
        <div class="sub-menu">
          <div class="submenu-items">
            <span class="star-icon material-symbols-outlined">star_rate</span>
            <p>${movie.vote_average}</p>
          </div>
          <div id="addIconBtn" class="submenuBtn submenu-items">
            <span class="add-icon material-symbols-outlined">bookmark_add</span>
            <span class="icon-text">Lägg till i Watchlist</span>
          </div>
          <div id="playTrailerBtn" class="submenuBtn submenu-items">
            <span class="play-icon material-symbols-outlined">play_circle</span>
            <span class="play-text">Spela trailer</span>
          </div>
        </div>
        <p>${movie.overview}</p>
        <div class="actors">
          <b>Skådespelare:</b> ${cast.map(actor => `<p>${actor.name}</p>`).join("|")}
        </div>
      </div>
      <div class="trailer-container">
        <h3>Trailer</h3>
        <div class="video-wrapper">
          <iframe 
            width="100%" 
            height="100%"
            src="https://www.youtube.com/embed/${trailerID}" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
      <div class="recommendations">
        <h3>Liknande titlar:</h3>
        <div class="reco-cards">
          ${recommendations.map(movie => `
          <div class="reco-card">
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${title}">
            <div class="overlay">
              <span class="addIcon material-symbols-outlined">bookmark_add</span>
              <span class="infoIcon material-symbols-outlined" data-id=${movie.id}>info</span>
            </div>
          </div>
          `).join("")}
        </div>
      </div>
    `;

  modal.style.display = "block";

  const infoIcons = document.querySelectorAll(".reco-cards .infoIcon");
  const bookmarkBtn = modalContent.querySelector("#addIconBtn");
  const bookmarkIcon = modalContent.querySelector(".add-icon");
  const bookmarkText = modalContent.querySelector(".icon-text");

  let savedMovies = getSavedMovies();
  let exists = savedMovies.find(m => m.id === movie.id);

  if (exists) {
    bookmarkIcon.textContent = "bookmark_added";
    bookmarkText.textContent = "Tillagd i Watchlist"
  }

  bookmarkBtn.addEventListener("click", () => {

    let savedMovies = getSavedMovies();

    const exists = savedMovies.find(m => m.id === movie.id);

    if (!exists) {
      savedMovies.push(movie);
      bookmarkIcon.textContent = "bookmark_added";
      bookmarkText.textContent = "Tillagd i Watchlist"
    } else {
      savedMovies = savedMovies.filter(m => m.id !== movie.id);
      bookmarkIcon.textContent = "bookmark_add";
      bookmarkText.textContent = "Lägg till i Watchlist";
    }

    saveToLocalStorage(savedMovies);
    displayWatchlist(savedMovies, "#saved-movies");
    updateHomeWatchlist();
  });

  infoIcons.forEach(icon => {
    icon.addEventListener("click", () => {

      const movieId = icon.dataset.id;
      const selectedMovie = recommendations.find(m => m.id == movieId);

      fetchMovieDetails(selectedMovie);
    });
  });

  const playTrailerBtn = document.querySelector("#playTrailerBtn");
  const playIcon = document.querySelector(".play-icon");
  const playText = document.querySelector(".play-text");

  playTrailerBtn.addEventListener("click", () => {
    modalContent.classList.toggle("show-trailer")

    const isOpen = modalContent.classList.contains("show-trailer");

    if (isOpen) {
      playText.textContent = "Stäng trailer";
      playIcon.textContent = "stop_circle";
    } else {
      playText.textContent = "Spela trailer";
      playIcon.textContent = "play_circle";
    }

    const iframe = modalContent.querySelector("iframe");
    if (!isOpen && iframe) {
      iframe.src = iframe.src;
    }

  });

  const closeIcon = modalContent.querySelector(".closeIcon");
  closeIcon.addEventListener("click", () => {

    const iframe = modalContent.querySelector("iframe");
    if (iframe) iframe.src = "";

    modal.style.display = "none";
    modalContent.classList.remove("show-trailer");
    playText.textContent = "Spela trailer";
    playIcon.textContent = "play_circle";
  });
}

function getMediaLabel(type) {

  if (type === "tv") return "Serie";
  if (type === "movie") return "Film";

}