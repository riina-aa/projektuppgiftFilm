
import { updateHomeWatchlist } from "./watchlist.js";
import { fetchMovies, fetchMovieDetails } from "./api.js";
import { displayMovies } from "./display.js";


document.addEventListener("DOMContentLoaded", () => {
  initHome();
})

export function getSavedMovies() {
  return JSON.parse(localStorage.getItem("savedMovies")) || [];
}

export function saveToLocalStorage(movies) {
  localStorage.setItem("savedMovies", JSON.stringify(movies));
}

let cachedMovies = [];
let currentType = "movie";
let currentGenre = null;

async function initHome() {

  toggleDarkLightMode();
  updateHomeWatchlist();
  displayGenres();

  const popularData = await fetchMovies('movie/popular?language=en-US&with_original_language=en');
  const popular = popularData.map(m => ({ ...m, media_type: "movie" }));
  displayMovies(popular, "#popular");

  const cozyData = await fetchMovies('discover/movie?with_genres=35,10749&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const cozy = cozyData.map(m => ({ ...m, media_type: "movie" }));
  displayMovies(cozy, "#cozy");

  const actionData = await fetchMovies('discover/movie?with_genres=28&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const action = actionData.map(m => ({ ...m, media_type: "movie" }));
  displayMovies(action, "#action");

  const dramaData = await fetchMovies('discover/movie?with_genres=18&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const drama = dramaData.map(m => ({ ...m, media_type: "movie" }));
  displayMovies(drama, "#drama");

  const seriesData = await fetchMovies('discover/tv?language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const series = seriesData.map(m => ({ ...m, media_type: "tv" }));
  displayMovies(series, "#series");

  const seriesActionData = await fetchMovies('discover/tv?with_genres=10759&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const seriesAction = seriesActionData.map(m => ({ ...m, media_type: "tv" }));

  const seriesComedyData = await fetchMovies('discover/tv?with_genres=35&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const seriesComedy = seriesComedyData.map(m => ({ ...m, media_type: "tv" }));

  const seriesDramaData = await fetchMovies('discover/tv?with_genres=18&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const seriesDrama = seriesDramaData.map(m => ({ ...m, media_type: "tv" }));

  const seriesCrimeData = await fetchMovies('discover/tv?with_genres=80&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const seriesCrime = seriesCrimeData.map(m => ({ ...m, media_type: "tv" }));

  const seriesSciFiData = await fetchMovies('discover/tv?with_genres=10765&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const seriesSciFi = seriesSciFiData.map(m => ({ ...m, media_type: "tv" }));

  const seriesAnimationData = await fetchMovies('discover/tv?with_genres=16&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const seriesAnimation = seriesAnimationData.map(m => ({ ...m, media_type: "tv" }));

  const seriesFamilyData = await fetchMovies('discover/tv?with_genres=10751&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  const seriesFamily = seriesFamilyData.map(m => ({ ...m, media_type: "tv" }));

  cachedMovies = [
    ...popular,
    ...cozy,
    ...action,
    ...drama,
    ...series,
    ...seriesAction,
    ...seriesComedy,
    ...seriesDrama,
    ...seriesCrime,
    ...seriesSciFi,
    ...seriesAnimation,
    ...seriesFamily
  ];

  displayMovies(cachedMovies, "#all", 21);
  filterContent();
  search();

  const movieBtn = document.querySelector("#movieBtn");
  const tvBtn = document.querySelector("#tvBtn");
  const selectCategory = document.querySelector("#select-btn");
  const options = document.querySelector(".options");

  movieBtn.addEventListener("click", () => {

    tvBtn.classList.remove("active");
    movieBtn.classList.toggle("active");

    currentType = "movie";
    currentGenre = null;
    displayGenres();
    filterContent();
  })

  tvBtn.addEventListener("click", () => {

    movieBtn.classList.remove("active");
    tvBtn.classList.toggle("active");

    currentType = "tv";
    currentGenre = null;
    displayGenres();
    filterContent();
  })

  selectCategory.addEventListener("click", () => {
    options.classList.toggle("open");
  })

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-select")) {
      options.classList.remove("open");
    }
  });

};

function search() {

  const searchInput = document.querySelector("#search");
  const resultsDiv = document.querySelector(".search-results");

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      resultsDiv.innerHTML = "";
      toggleSearchSection(false);
      toggleSections(true);
      return;
    }

    toggleSearchSection(true);
    toggleSections(false);

    const result = cachedMovies.filter(movie => {
      const title = movie.title || movie.name || "";
      return title.toLowerCase().includes(query)
    });

    resultsDiv.innerHTML = "";

    displaySearchResults(result, query);
    console.log(result);
  });
};

function displaySearchResults(results, query) {

  const resultsDiv = document.querySelector(".search-results");
  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    const div = document.createElement("div");
    div.classList.add("no-results");

    div.innerHTML = `
    <p>Din sökning "<span class="green-text">${query}</span>" gav inget resultat. Kontrollera att du har stavat rätt.</p>
    `;

    resultsDiv.appendChild(div);

    return;
  };

  results.forEach(movie => {

    const div = document.createElement("div");
    div.classList.add("movie-card");

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
      <div class="overlay">
        <span class="addIcon material-symbols-outlined">bookmark_add</span>
        <span class="infoIcon material-symbols-outlined">info</span>
      </div>
  `;

    resultsDiv.appendChild(div);

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

function toggleSections(show) {
  const sections = document.querySelectorAll(".movie-section");

  sections.forEach(section => {
    section.style.display = show ? "block" : "none";
  })
}

function toggleSearchSection(show) {
  const searchSection = document.querySelector(".search-container");

  if (!searchSection) return;

  searchSection.style.display = show ? "block" : "none";
}

export function toggleDarkLightMode() {

  const toggleBar = document.querySelector(".toggle-ball");
  const sections = document.querySelectorAll(".body, .nav, .modal-content, .toggle-ball");

  toggleBar.addEventListener("click", () => {

    const navImg = document.querySelector(".logo-link img")

    if (navImg.src.includes("logo.png")) {
      navImg.src = "/public/images/logo-black.png";
    } else {
      navImg.src = "/public/images/logo.png";
    }

    sections.forEach(section => {
      section.classList.toggle("active");
    })
  })
}

function filterContent() {

  const onlyOneMovie = Array.from(
    new Map(cachedMovies.map(item => [item.id, item])).values()
  );

  let filtered = onlyOneMovie;

  if (currentType) {
    filtered = filtered.filter(item => item.media_type === currentType);
  }

  if (currentGenre) {
    filtered = filtered.filter(item =>
      item.genre_ids.includes(Number(currentGenre))
    );
  }

  displayMovies(filtered, "#all", 21);

  updateSelectedOption();
}

function updateSelectedOption() {

  const categoryOption = document.querySelectorAll(".option")

  categoryOption.forEach(option => {

    const value = option.dataset.value;

    let isActive;

    if (value === "all" && !currentGenre) {
      isActive = true;
    } else if (value === String(currentGenre)) {
      isActive = true;
    } else {
      isActive = false;
    }

    option.classList.toggle("selected-option", isActive);
  });
};

const movieGenres = {
  28: "Action",
  35: "Comedy",
  18: "Drama",
  27: "Horror",
  878: "Sci-Fi",
  10749: "Romance"
};

const tvGenres = {
  10759: "Action & Adventure",
  35: "Comedy",
  18: "Drama",
  80: "Crime",
  10765: "Sci-Fi & Fantasy",
  16: "Animation",
  10751: "Family"
};

function getActiveGenreMap() {
  if (currentType === "tv") {
    return tvGenres;
  } else {
    return movieGenres;
  }
};

function displayGenres() {

  const genres = getActiveGenreMap();
  const optionsBox = document.querySelector(".options");

  optionsBox.innerHTML = `
    <div class="option" data-value="all">Alla kategorier</div>
    ${Object.entries(genres).map(([id, name]) => `
      <div class="option" data-value="${id}">${name}</div>
    `).join("")}
  `;

  attachGenreEvents();
}

function attachGenreEvents() {

  const categoryOptions = document.querySelectorAll(".option");
  const options = document.querySelector(".options");
  const selectedLabel = document.querySelector(".selected");

  categoryOptions.forEach(option => {

    option.addEventListener("click", () => {

      const value = option.dataset.value;

      if (value === "all") {
        currentGenre = null;
      } else {
        currentGenre = value;
      }

      if (value === "all") {
        selectedLabel.textContent = "Kategorier";
      } else {
        selectedLabel.textContent = option.textContent;
      }

      options.classList.remove("open");

      filterContent();
    });

  });
}