
document.addEventListener("DOMContentLoaded", () => {
  init();
})

function getSavedMovies() {
  return JSON.parse(localStorage.getItem("savedMovies")) || [];
}

function saveToLocalStorage(movies) {
  localStorage.setItem("savedMovies", JSON.stringify(movies));
}

async function init() {

  const popular = await fetchMovies('movie/popular?language=en-US&with_original_language=en');
  displayMovies(popular, "#popular");

  const cozy = await fetchMovies('discover/movie?with_genres=35,10749&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(cozy, "#cozy");

  const action = await fetchMovies('discover/movie?with_genres=28&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(action, "#action");

  const drama = await fetchMovies('discover/movie?with_genres=18&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(drama, "#drama");

};

async function fetchMovies(endpoint) {

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjViYzRjNDk1ZDdiNzYyZGQzYTgzMWI2NTFkMDhjNiIsIm5iZiI6MTc3NDM3NjkzMi4xNjYwMDAxLCJzdWIiOiI2OWMyZDdlNGQ0ZTQ0MjdmOGI5NWFmZjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.1twDreEcTVvEetzFR9NxdMV12opGICcZ2IoaHE7GaOg'
    }
  };

  try {

    const res = await fetch(`https://api.themoviedb.org/3/${endpoint}`, options);
    const data = await res.json();
    console.log(data);
    return data.results;

  } catch (error) {

    console.error(error);

  }

};

function displayMovies(movies, sectionID) {

  let section = document.querySelector(sectionID);

  movies.slice(0, 8).forEach(movie => {
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
    });

    infoIcon.addEventListener("click", async () => {
      fetchMovieDetails(movie);
    });

  });
};

async function fetchMovieDetails(movie) {

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjViYzRjNDk1ZDdiNzYyZGQzYTgzMWI2NTFkMDhjNiIsIm5iZiI6MTc3NDM3NjkzMi4xNjYwMDAxLCJzdWIiOiI2OWMyZDdlNGQ0ZTQ0MjdmOGI5NWFmZjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.1twDreEcTVvEetzFR9NxdMV12opGICcZ2IoaHE7GaOg'
    }
  };

  try {
    const castResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?&language=en-US`, options);
    const castData = await castResponse.json();
    const topCast = castData.cast.slice(0, 4);

    const trailerResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(movie.title + " trailer")}&type=video&key=AIzaSyAVuczGe0Fjxem02s7Y1fM9t-Dcc0ZnVeA`);
    const trailerData = await trailerResponse.json();
    const videoID = trailerData.items[0].id.videoId;

    const similarRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/recommendations?language=en-US&page=1`, options);
    const similarData = await similarRes.json();
    const similarMovies = similarData.results.slice(0, 5);

    displayModal(movie, topCast, videoID, similarMovies);

  } catch (error) {
    console.error("Failed:", error);
  };
};

async function displayModal(movie, cast, trailerID, recommendations) {

  console.log(cast);

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
