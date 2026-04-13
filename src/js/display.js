import { getSavedMovies, saveToLocalStorage } from "./main.js"; 
import { displayWatchlist } from "./watchlist.js"; 
import { fetchMovieDetails } from "./api.js";

export function displayMovies(movies, sectionID) {

  let section = document.querySelector(sectionID);

  if (!section) return; 

  movies.slice(0, 7).forEach(movie => {
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
      displayWatchlist();
    });

    infoIcon.addEventListener("click", async () => {
      fetchMovieDetails(movie);
    });

  });
};

export async function displayModal(movie, cast, trailerID, recommendations) {

  const modal = document.querySelector(".modal");
  const modalContent = document.querySelector(".modal-content");

  modalContent.innerHTML = `
      <div class="poster">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
      </div>

      <div class="about">
        <h2>${movie.title}</h2>
        <div class="sub-menu">
          <div class="submenu-items">
            <span class="star-icon material-symbols-outlined">star_rate</span>
            <p>${movie.vote_average}</p>
          </div>
          <div class="submenuBtn submenu-items">
            <span class="add-icon material-symbols-outlined">bookmark_add</span>
            <span>Lägg till på Watchlist</span>
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
        <h3>Liknande filmer:</h3>
        <div class="reco-cards">
          ${recommendations.map(movie => `
          <div class="reco-card">
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            <div class="overlay">
              <span class="addIcon material-symbols-outlined">bookmark_add</span>
              <span class="infoIcon material-symbols-outlined" data-id=${movie.id}>info</span>
            </div>
          </div>
          `).join("")}
        </div>
      </div>
    `;

  modal.appendChild(modalContent);

  modal.style.display = "block";

  const infoIcons = document.querySelectorAll(".reco-cards .infoIcon");
  const modalBookmark = document.querySelector(".add-icon");

  modalBookmark.addEventListener("click", () => {
    let savedMovies = getSavedMovies();

    const exists = savedMovies.find(m => m.id === movie.id);

    if (!exists) {
      savedMovies.push(movie);
      modalBookmark.textContent = "bookmark_added";
    } else {
      savedMovies = savedMovies.filter(m => m.id !== movie.id);
      modalBookmark.textContent = "bookmark_add";
    }

    saveToLocalStorage(savedMovies);
    displayWatchlist(); 
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

    playText.textContent = isOpen ? "Stäng trailer" : "Spela trailer";
    playIcon.textContent = isOpen ? "stop_circle" : "play_circle";

  });

  const closeIcon = document.querySelector(".closeIcon");
  closeIcon.addEventListener("click", () => {
    modal.style.display = "none";
  });
}