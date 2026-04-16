
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

async function initHome() {

  toggleDarkLightMode();
  updateHomeWatchlist();

  const popular = await fetchMovies('movie/popular?language=en-US&with_original_language=en');
  displayMovies(popular, "#popular");

  const cozy = await fetchMovies('discover/movie?with_genres=35,10749&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(cozy, "#cozy");

  const action = await fetchMovies('discover/movie?with_genres=28&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(action, "#action");

  const drama = await fetchMovies('discover/movie?with_genres=18&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(drama, "#drama");

  cachedMovies = [
    ...popular,
    ...cozy,
    ...action,
    ...drama
  ];

  search();

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
