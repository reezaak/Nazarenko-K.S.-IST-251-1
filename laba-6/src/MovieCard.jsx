import { useEffect, useState } from 'react';

const API_KEY = '80a2f5d2';
const PLACEHOLDER = 'https://via.placeholder.com/300x450?text=No+Poster';

const plotCache = new Map();

export default function MovieCard({ movie }) {
  const [plot, setPlot] = useState(plotCache.get(movie.imdbID) || null);
  const [plotLoading, setPlotLoading] = useState(!plot);

  const posterUrl =
    movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : PLACEHOLDER;

  useEffect(() => {
    if (plotCache.has(movie.imdbID)) {
      setPlot(plotCache.get(movie.imdbID));
      setPlotLoading(false);
      return;
    }

    let cancelled = false;

    const fetchPlot = async () => {
      setPlotLoading(true);
      try {
        const res = await fetch(
          `https://www.omdbapi.com/?i=${movie.imdbID}&plot=short&apikey=${API_KEY}`
        );
        if (!res.ok) throw new Error('Ошибка сети');
        const data = await res.json();
        if (cancelled) return;

        const text =
          data.Plot && data.Plot !== 'N/A'
            ? data.Plot
            : 'Описание отсутствует.';

        plotCache.set(movie.imdbID, text);
        setPlot(text);
      } catch {
        if (!cancelled) setPlot('Не удалось загрузить описание.');
      } finally {
        if (!cancelled) setPlotLoading(false);
      }
    };

    fetchPlot();
    return () => {
      cancelled = true;
    };
  }, [movie.imdbID]);

  return (
    <article className="movie-card">
      <img
        src={posterUrl}
        alt={movie.Title}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER;
        }}
      />
      <div className="movie-card__body">
        <h3>{movie.Title}</h3>
        <p>
          <strong>Год:</strong> {movie.Year}
        </p>
        <p>
          <strong>Тип:</strong> {movie.Type}
        </p>
        <div className="movie-card__plot">
          {plotLoading ? (
            <span className="card-spinner" aria-label="Загрузка описания" />
          ) : (
            <p>{plot}</p>
          )}
        </div>
      </div>
    </article>
  );
}