import { displayModal } from "./display.js";

/**
 * Hämtar filmer eller serier från The Movie Database API.
 *
 * Använder den angivna endpointen för att hämta data och returnerar
 * resultatet från API-anropet.
 *
 * @async
 * @param {string} endpoint - API-endpointen som ska användas vid anropet.
 * @returns {Promise<Array|undefined>} En array med filmer eller serier,
 * eller undefined om anropet misslyckas.
 */
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

/**
 * Hämtar detaljerad information om en film eller serie.
 *
 * Hämtar bland annat de fyra första skådespelarna, en trailer från YouTube
 * samt rekommenderade filmer eller serier från The Movie Database.
 *
 * @async
 * @param {Object} movie - Filmen eller serien som information ska hämtas om.
 * @returns {Promise<Object|undefined>} Ett objekt som innehåller filmen,
 * skådespelare, trailer-ID och rekommenderade titlar, eller undefined
 * om något av API-anropen misslyckas.
 */
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
    const videoId = trailerData.items[0].id.videoId;

    const similarRes = await fetch(`https://api.themoviedb.org/3/${type}/${movie.id}/recommendations?language=en-US&page=1`, options);
    const similarData = await similarRes.json();
    const similarMovies = similarData.results.slice(0, 5);
    
    
    return {
      movie,
      topCast, 
      videoId, 
      similarMovies
    }

  } catch (error) {

      console.error("Failed:", error);
  };
};