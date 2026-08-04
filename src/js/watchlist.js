import { getSavedMovies, saveToLocalStorage } from "./main.js";
import { fetchMovieDetails } from "./api.js";
import { getMediaLabel } from "./display.js"

document.addEventListener("DOMContentLoaded", () => {
  initWatchlist();
})

function initWatchlist() {

  const savedMovies = getSavedMovies();

  displayWatchlist(savedMovies, "#saved-movies");
}

export function displayWatchlist(movies, sectionID) {

  let section = document.querySelector(sectionID);


  if (!section) return;
  section.innerHTML = "";

  movies.forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie-card");

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
      <div class="overlay">
        <span class="addIcon material-symbols-outlined">bookmark_added</span>
        <span class="infoIcon material-symbols-outlined">info</span>
      </div>
      `;

    section.appendChild(div);

    const infoIcon = div.querySelector(".infoIcon");
    const bookmarkIcon = div.querySelector(".addIcon");

    bookmarkIcon.addEventListener("click", (e) => {
      e.stopPropagation();

      let savedMovies = getSavedMovies();

      savedMovies = savedMovies.filter(m => m.id !== movie.id);

      saveToLocalStorage(savedMovies);

      const updatedMovies = getSavedMovies();

      displayWatchlist(updatedMovies, "#saved-movies");
      updateHomeWatchlist();
    });

    infoIcon.addEventListener("click", async () => {

      const movieDetails = await fetchMovieDetails(movie);

      displayMovieJournal(
        movieDetails.movie,
        movieDetails.topCast,
        movieDetails.videoId,
        movieDetails.similarMovies
      );

    });
  });
}

function displayMovieJournal(movie, cast, trailerID, recommendations) {

  const modal = document.querySelector(".modal");
  const modalContent = document.querySelector(".modal-content");
  const title = movie.title || movie.name || "";

  const savedMovies = getSavedMovies();
  const savedMovie = savedMovies.find(m => m.id === movie.id);

  const status = savedMovie?.status || "want";
  const rating = savedMovie?.userRating || 0;
  const comment = savedMovie?.comment || "";

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
        <div class="userContent">
          <h3>Movie Journal</h3>
          <div class="status-buttons">
            <button class="statusBtn ${status === "want" ? "active" : ""}" data-status="want">Vill se 👀</button>
            <button class="statusBtn ${status === "must" ? "active" : ""}" data-status="must">Måste se 🔥</button>
            <button class="statusBtn ${status === "started" ? "active" : ""}" data-status="started">Påbörjad 🍿</button>
            <button class="statusBtn ${status === "seen" ? "active" : ""}" data-status="seen">Sedd ✅</button>
          </div>
          <div class="rating">
            <h4>Ditt betyg</h4>
            ${[1, 2, 3, 4, 5].map(number => `
              <button 
                class="rating-star ${number <= rating ? "active" : ""}"
                data-rating="${number}">
                <span class="material-symbols-outlined">
                  star
                </span>
              </button>
            `).join("")}
          </div>
          <div class="comment">
            <label for="movie-comment">Vad tyckte du?</label>
            <textarea id="movie-comment" placeholder="Vad gillade du? Älskade? Hatade? Fanns det något som fastnade?">${comment}</textarea>
          </div>
          <div class="journal-buttons">
            <button class="save-journal">Spara journal</button>
            <button class="cancel-journal">Avbryt</button>            
          </div>
        </div>
      `;

  modal.style.display = "block";

  let selectedStatus = status;
  const statusButtons = modalContent.querySelectorAll(".statusBtn");

  statusButtons.forEach(button => {

    button.addEventListener("click", () => {
      statusButtons.forEach(btn => {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      selectedStatus = button.dataset.status;
    });
  });

  let selectedRating = rating;

  const ratingStars = modalContent.querySelectorAll(".rating-star");

  ratingStars.forEach(star => {

    star.addEventListener("click", () => {

      selectedRating = Number(star.dataset.rating);

      ratingStars.forEach(item => {

        const itemRating = Number(item.dataset.rating);

        item.classList.toggle(
          "active",
          itemRating <= selectedRating
        );

      });

    });

  });

  const saveButton = modalContent.querySelector(".save-journal");

saveButton.addEventListener("click", function () {

    const commentInput = modalContent.querySelector("#movie-comment");
    const commentValue = commentInput.value;
    const comment = commentValue.trim();

    const movies = getSavedMovies();

    let movieIndex = -1;

    for (let i = 0; i < movies.length; i++) {

        const savedMovie = movies[i];

        if (savedMovie.id === movie.id) {
            movieIndex = i;
            break;
        }
    }

    if (movieIndex !== -1) {

        const savedMovie = movies[movieIndex];

        savedMovie.status = selectedStatus;
        savedMovie.rating = selectedRating;
        savedMovie.comment = comment;

        saveToLocalStorage(movies);
    }

});

  const infoIcons = document.querySelectorAll(".reco-cards .infoIcon");
  const bookmarkBtn = modalContent.querySelector("#addIconBtn");
  const bookmarkIcon = modalContent.querySelector(".add-icon");
  const bookmarkText = modalContent.querySelector(".icon-text");

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

export function updateHomeWatchlist() {

  const savedMovies = getSavedMovies();
  const watchlistSection = document.querySelector("#watchlist-section");

  if (!watchlistSection) return;

  if (savedMovies.length === 0) {
    watchlistSection.style.display = "none";
  } else {
    watchlistSection.style.display = "block";
  }

  displayWatchlist(savedMovies, "#display-watchlist");
}