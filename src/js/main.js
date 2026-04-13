
import { displayWatchlist } from "./watchlist.js";
import { fetchMovies } from "./api.js";
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

async function initHome() {

  const savedMovies = getSavedMovies();
  const watchlistSection = document.querySelector("#display-watchlist");

  if (savedMovies.length === 0) {
    watchlistSection.style.display = "none";
  } else {
    watchlistSection.style.display = "block";
  }

  displayWatchlist(savedMovies, "#display-watchlist");

  const popular = await fetchMovies('movie/popular?language=en-US&with_original_language=en');
  displayMovies(popular, "#popular");

  const cozy = await fetchMovies('discover/movie?with_genres=35,10749&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(cozy, "#cozy");

  const action = await fetchMovies('discover/movie?with_genres=28&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(action, "#action");

  const drama = await fetchMovies('discover/movie?with_genres=18&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(drama, "#drama");

};
