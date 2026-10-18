import { useCallback, useEffect, useState } from 'react';
import MovieCard from './MovieCard.jsx';
import useDebounce from './useDebounce.js';

const API_KEY = '80a2f5d2';
const HISTORY_KEY = 'movie-search-history';
const HISTORY_LIMIT = 5;

export default function App() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  });

  const debouncedQuery = useDebounce(query.trim(), 600);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const pushHistory = (term) => {
    if (!term) return;
    setHistory((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, HISTORY_LIMIT);
    });
  };

  const fetchMovies = useCallback(async (term, pageNum = 1) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setMovies([]);
      setStatus('idle');
      setError(null);
      setTotalResults(0);
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const res = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(
          trimmed
        )}&page=${pageNum}&apikey=${API_KEY}`
      );
      if (!res.ok) throw new Error('Ошибка сети');

      const data = await res.json();

      if (data.Response === 'False' || data.Error) {
        setMovies([]);
        setStatus('error');
        setError(data.Error || 'Ничего не найдено');
        setTotalResults(0);
        return;
      }

      setMovies(data.Search || []);
      setTotalResults(Number(data.totalResults) || 0);
      setStatus('success');
      pushHistory(trimmed);
    } catch (err) {
      setMovies([]);
      setStatus('error');
      setError(err.message || 'Неизвестная ошибка');
      setTotalResults(0);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      setSearchTerm(debouncedQuery);
      setPage(1);
      fetchMovies(debouncedQuery, 1);
    } else if (debouncedQuery.length === 0) {
      setMovies([]);
      setStatus('idle');
      setError(null);
      setTotalResults(0);
    }
  }, [debouncedQuery]);

  const handleSearch = () => {
    const term = query.trim();
    if (!term) return;
    setSearchTerm(term);
    setPage(1);
    fetchMovies(term, 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchMovies(searchTerm, newPage);
    }
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(totalResults / 10) || 1;
    if (page < maxPage) {
      const newPage = page + 1;
      setPage(newPage);
      fetchMovies(searchTerm, newPage);
    }
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    setSearchTerm(term);
    setPage(1);
    fetchMovies(term, 1);
  };

  const filteredMovies = movies.filter((m) => {
    const year = parseInt(m.Year, 10);
    if (Number.isNaN(year)) return true;
    if (yearFrom && year < Number(yearFrom)) return false;
    if (yearTo && year > Number(yearTo)) return false;
    return true;
  });

  const maxPage = Math.ceil(totalResults / 10) || 1;

  return (
    <div className="app">
      <header className="app__header">
        <h1>🎬 Поиск фильмов</h1>
        <p className="hint">Данные предоставлены OMDb API</p>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Введите название фильма..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch} disabled={status === 'loading'}>
          {status === 'loading' ? 'Поиск...' : 'Найти'}
        </button>
      </div>

      {history.length > 0 && (
        <div className="history">
          <span className="history__label">История:</span>
          {history.map((term) => (
            <button
              key={term}
              className="history__chip"
              onClick={() => handleHistoryClick(term)}
            >
              {term}
            </button>
          ))}
          <button
            className="history__clear"
            onClick={() => setHistory([])}
            title="Очистить историю"
          >
            ✕
          </button>
        </div>
      )}

      {status === 'success' && movies.length > 0 && (
        <div className="year-filter">
          <label>
            Год от:{' '}
            <input
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="1990"
            />
          </label>
          <label>
            Год до:{' '}
            <input
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="2024"
            />
          </label>
          {(yearFrom || yearTo) && (
            <button
              className="year-filter__reset"
              onClick={() => {
                setYearFrom('');
                setYearTo('');
              }}
            >
              Сбросить
            </button>
          )}
        </div>
      )}

      {status === 'idle' && (
        <p className="state state--idle">
          Введите название фильма и нажмите «Найти» (или подождите — сработает автопоиск).
        </p>
      )}

      {status === 'loading' && (
        <div className="state state--loading">
          <span className="spinner" /> Загрузка...
        </div>
      )}

      {status === 'error' && (
        <div className="state state--error">
          <p>Ошибка: {error}</p>
        </div>
      )}

      {status === 'success' && movies.length === 0 && (
        <p className="state state--empty">Ничего не найдено по вашему запросу.</p>
      )}

      {status === 'success' && movies.length > 0 && (
        <>
          <p className="results-count">
            Найдено: <strong>{totalResults}</strong> · показано на странице:{' '}
            <strong>{movies.length}</strong>
            {filteredMovies.length !== movies.length &&
              ` · после фильтра: ${filteredMovies.length}`}
          </p>

          {filteredMovies.length === 0 ? (
            <p className="state state--empty">
              По фильтру года ничего не найдено. Попробуйте изменить диапазон.
            </p>
          ) : (
            <div className="movie-list">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          )}

          <div className="pagination">
            <button onClick={handlePrevPage} disabled={page <= 1 || status === 'loading'}>
              ← Предыдущая
            </button>
            <span>
              Страница {page} из {maxPage}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page >= maxPage || status === 'loading'}
            >
              Следующая →
            </button>
          </div>
        </>
      )}
    </div>
  );
}