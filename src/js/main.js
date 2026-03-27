
document.addEventListener("DOMContentLoaded", () => {
  init();
})

async function init() {

  const popular = await fetchMovies('movie/popular?language=en-US&with_original_language=en');
  displayMovies(popular, "#popular");

  const cozy = await fetchMovies('discover/movie?with_genres=35,10749&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(cozy, "#cozy");

  const action = await fetchMovies('discover/movie?with_genres=28&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(action, "#action");

  const drama = await fetchMovies('discover/movie?with_genres=18&language=en-US&with_original_language=en&sort_by=popularity.desc&vote_count.gte=150');
  displayMovies(drama, "#drama");

}

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
    return data.results;

  } catch (error) {

    console.error(error);

  }

};

function displayMovies(movies, selector) {

    let section = document.querySelector(selector); 

    movies.slice(0, 8).forEach(movie => {
      const div = document.createElement("div"); 
      div.classList.add("movie-card"); 

      div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
      `;

      section.appendChild(div); 

    })

    
}
