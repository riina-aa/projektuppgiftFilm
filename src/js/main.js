
import { addJournalData, updateHomeWatchlist } from "./watchlist.js";
import { fetchMovies, fetchMovieDetails } from "./api.js";
import { displayMovies } from "./display.js";


document.addEventListener("DOMContentLoaded", () => {
  initHome();
})

/**
 * Hämtar sparade filmer och serier från localStorage.
 *
 * @returns {Array} En array med sparade filmer och serier.
 */
export function getSavedMovies() {
  return JSON.parse(localStorage.getItem("savedMovies")) || [];
}

/**
 * Sparar filmer och serier i localStorage.
 *
 * @param {Array} movies - Arrayen med filmer och serier som ska sparas.
 * @returns {void}
 */
export function saveToLocalStorage(movies) {
  localStorage.setItem("savedMovies", JSON.stringify(movies));
}

let cachedMovies = [];
let currentType = "movie";
let currentGenre = null;

/**
 * Initierar startsidan genom att hämta och visa filmer och serier.
 *
 * Hämtar populära filmer, filmer inom olika genrer samt populära TV-serier.
 * Resultaten sparas även i cachedMovies för att kunna användas vid sökning
 * och filtrering.
 *
 * @async
 * @returns {Promise<void>}
 */
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
  mobileSearch();

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

/**
 * Hanterar sökning efter filmer och serier.
 *
 * Lyssnar efter förändringar i sökfältet och filtrerar det cachade
 * innehållet utifrån den text användaren skriver in.
 *
 * @returns {void}
 */
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

/**
 * Aktiverar sökfunktionen på mobila enheter.
 *
 * När användaren klickar på sökikonen visas sökfältet och får fokus.
 * När sökfältet tappar fokus tas den aktiva klassen bort från navigationen.
 *
 * @returns {void}
 */
export function mobileSearch() {

    const searchInput = document.querySelector("#search");
    const searchIcon = document.querySelector("#search-icon");
    const nav = document.querySelector(".nav");

    searchIcon.addEventListener("click", () => {

        nav.classList.add("search-active");

        searchInput.focus();

    });

    searchInput.addEventListener("blur", () => {

        nav.classList.remove("search-active");

    });
}

/**
 * Visar resultatet från en sökning.
 *
 * Om sökningen inte ger några resultat visas ett meddelande.
 * Om resultat hittas skapas ett filmkort för varje film eller serie.
 *
 * @param {Array} results - Filmerna och serierna som matchar sökningen.
 * @param {string} query - Texten som användaren sökte efter.
 * @returns {void}
 */
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

/**
 * Visar eller döljer filmsektionerna på sidan.
 *
 * @param {boolean} show - Anger om sektionerna ska visas.
 * @returns {void}
 */
function toggleSections(show) {
  const sections = document.querySelectorAll(".movie-section");

  sections.forEach(section => {
    section.style.display = show ? "block" : "none";
  })
}

/**
 * Visar eller döljer sektionen för sökresultat.
 *
 * @param {boolean} show - Anger om söksektionen ska visas.
 * @returns {void}
 */
function toggleSearchSection(show) {
  const searchSection = document.querySelector(".search-container");

  if (!searchSection) return;

  searchSection.style.display = show ? "block" : "none";
}

/**
 * Växlar mellan ljust och mörkt läge.
 *
 * Ändrar logotypen och lägger till eller tar bort den aktiva klassen
 * från relevanta delar av sidan.
 *
 * @returns {void}
 */
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

/**
 * Filtrerar det cachade innehållet utifrån vald mediatyp och genre.
 *
 * Tar bort dubbletter baserat på filmens eller seriens ID och filtrerar
 * därefter resultatet utifrån currentType och currentGenre.
 *
 * @returns {void}
 */
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

/**
 * Uppdaterar vilket genre-alternativ som är markerat som valt.
 *
 * @returns {void}
 */
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

/**
 * Hämtar genrelistan för den aktuella mediatypen.
 *
 * @returns {Object} Ett objekt som innehåller genre-ID:n och deras namn.
 */
function getActiveGenreMap() {
  if (currentType === "tv") {
    return tvGenres;
  } else {
    return movieGenres;
  }
};

/**
 * Skapar och visar genrealternativ i den anpassade dropdown-menyn.
 *
 * Hämtar relevanta genrer beroende på om filmer eller serier är valda
 * och kopplar därefter händelser till varje alternativ.
 *
 * @returns {void}
 */
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

/**
 * Lägger till klickhändelser på genrealternativen.
 *
 * När användaren väljer en genre uppdateras currentGenre och innehållet
 * filtreras utifrån det valda alternativet.
 *
 * @returns {void}
 */
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