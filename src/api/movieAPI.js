export const fetchPopularMovies = async () => {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-UK&page=1`;

  try {
    const outcome = await fetch(url);
    if (!outcome.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await outcome.json();
    return data.results;
  } catch (error) {
    console.error("Error whilst fetching movie data", error);
    return [];
  }
};
