import { getSavedMovies, saveToLocalStorage } from "./main.js";
import { fetchMovieDetails } from "./api.js";

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
            displayWatchlist();
        });

        infoIcon.addEventListener("click", () => {
            fetchMovieDetails(movie);

        });
    });
}