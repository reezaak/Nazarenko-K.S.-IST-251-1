import React from 'react';
import { useState, useEffect } from 'react';
import { Filters } from './Filters';
import { ProductCard } from './ProductCard';

const USD_TO_RUB = 90;

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    categories: [],
    minPrice: undefined,
    maxPrice: undefined,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('https://fakestoreapi.com/products', {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Ошибка сети: ${res.status}`);
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let result = products;

    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }
    
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => (p.price * USD_TO_RUB) >= filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => (p.price * USD_TO_RUB) <= filters.maxPrice);
    }

    setFilteredProducts(result);
  }, [products, filters]);

  if (loading) return <p style={{ textAlign: 'center' }}>Загрузка товаров...</p>;
  if (error)
    return (
      <p style={{ color: 'red', textAlign: 'center' }}>Ошибка: {error}</p>
    );

  return (
    <section>
      <Filters onFilterChange={setFilters} initialFilters={filters} />

      {filteredProducts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777' }}>
          Товары не найдены по выбранным фильтрам.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}