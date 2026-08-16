import { getSavedMovies, saveToLocalStorage } from "./main.js";
import { addJournalData, updateHomeWatchlist, displayWatchlist } from "./watchlist.js";
import { fetchMovieDetails } from "./api.js";

/**
 * Visar filmer och serier i en angiven sektion på sidan.
 *
 * Lägger till information om filmens status och skapar knappar
 * för att lägga till eller ta bort titeln från watchlisten samt
 * visa mer information i en modal.
 *
 * @param {Array} movies - Array med filmer och serier som ska visas.
 * @param {string} sectionID - CSS-selektorn för sektionen där innehållet ska visas.
 * @param {number} filter - Maximalt antal filmer eller serier som ska visas.
 * @returns {void}
 */
export function displayMovies(movies, sectionID, filter = 7) {

  movies = addJournalData(movies);

  let section = document.querySelector(sectionID);

  if (!section) return;

  section.innerHTML = "";

  movies.slice(0, filter).forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie-card");

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
      <div class="overlay">
        <div class="movie-status">
          <span>${getStatusText(movie.status)}</span>
        </div>
        <div class="default-icons">
          <span class="addIcon material-symbols-outlined">bookmark_add</span>
          <span class="infoIcon material-symbols-outlined">info</span>
        </div>
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
        savedMovies.push({
          ...movie,
          status: "want",
          userRating: 0,
          comment: "",
          summary: ""
        });
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

      const movieDetails = await fetchMovieDetails(movie);
      
      displayModal(
        movie,
        movieDetails.topCast, 
        movieDetails.videoId,
        movieDetails.similarMovies
      );
    });

  });
};

/**
 * Visar en modal med detaljer om en film eller serie.
 *
 * Modalen innehåller bland annat titel, betyg, beskrivning,
 * skådespelare, trailer, watchlist-knapp och rekommenderade titlar.
 *
 * @param {Object} movie - Filmen eller serien som ska visas.
 * @param {Array} cast - Array med skådespelare som visas i modalen.
 * @param {string} trailerID - ID för YouTube-trailern.
 * @param {Array} recommendations - Array med liknande filmer eller serier.
 * @returns {void}
 */
export function displayModal(movie, cast, trailerID, recommendations) {

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
              <div class="movie-status">
                <span>${getStatusText(movie.status)}</span>
              </div>
              <div class="default-icons">
                <span class="addIcon material-symbols-outlined">bookmark_add</span>
                <span class="infoIcon material-symbols-outlined" data-id=${movie.id}>info</span>
              </div>
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
      savedMovies.push({
        ...movie,
        status: "want",
        userRating: 0,
        comment: "",
        summary: ""
      })

      bookmarkIcon.textContent = "bookmark_added";
      bookmarkText.textContent = "Tillagd i Watchlist";

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
    icon.addEventListener("click", async () => {

      const movieId = icon.dataset.id;

      const selectedMovie = recommendations.find(m => m.id == movieId);

      const movieDetails = await fetchMovieDetails(selectedMovie);

      displayModal(
        selectedMovie,
        movieDetails.topCast,
        movieDetails.videoId,
        movieDetails.similarMovies
      );
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

/**
 * Hämtar den text som ska visas för den aktuella mediatypen.
 *
 * @param {string} type - Mediatypen, exempelvis "movie" eller "tv".
 * @returns {string|undefined} "Film" eller "Serie" beroende på mediatyp.
 */
export function getMediaLabel(type) {

  if (type === "tv") return "Serie";
  if (type === "movie") return "Film";

}

/**
 * Hämtar den text som ska visas för en films eller series status.
 *
 * @param {string} status - Statusen för filmen eller serien.
 * @returns {string} En text som beskriver statusen.
 */
export function getStatusText(status) {

  if (status === "must") {
    return "Måste se 🔥";
  }

  if (status === "want") {
    return "Vill se 👀";
  }

  if (status === "started") {
    return "Påbörjad ▶️";
  }

  if (status === "seen") {
    return "Sedd ✅";
  }

  return "";
}