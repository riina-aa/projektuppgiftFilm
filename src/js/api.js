import { displayModal } from "./display.js";


export async function fetchMovies(endpoint) {

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

export async function fetchMovieDetails(movie) {

  const title = movie.title || movie.name || "Titel saknas";
  const type = movie.media_type; 

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxYjViYzRjNDk1ZDdiNzYyZGQzYTgzMWI2NTFkMDhjNiIsIm5iZiI6MTc3NDM3NjkzMi4xNjYwMDAxLCJzdWIiOiI2OWMyZDdlNGQ0ZTQ0MjdmOGI5NWFmZjEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.1twDreEcTVvEetzFR9NxdMV12opGICcZ2IoaHE7GaOg'
    }
  };

  try {
    const castResponse = await fetch(`https://api.themoviedb.org/3/${type}/${movie.id}/credits?&language=en-US`, options);
    const castData = await castResponse.json();
    const topCast = castData.cast.slice(0, 4);

    const trailerResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title + " trailer")}&type=video&key=AIzaSyAVuczGe0Fjxem02s7Y1fM9t-Dcc0ZnVeA`);
    const trailerData = await trailerResponse.json();
    const videoID = trailerData.items[0].id.videoId;

    const similarRes = await fetch(`https://api.themoviedb.org/3/${type}/${movie.id}/recommendations?language=en-US&page=1`, options);
    const similarData = await similarRes.json();
    const similarMovies = similarData.results.slice(0, 5);

    displayModal(movie, topCast, videoID, similarMovies);

  } catch (error) {
    console.error("Failed:", error);
  };
};