import React from 'react';

export function ProductCard({ product }) {
  const rubPrice = product.price * 90;

  return (
    <article
      style={{
        border: '1px solid #e0e0e0',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '160px',
          backgroundImage: `url(${product.image})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          marginBottom: '1rem',
          borderRadius: '4px',
          backgroundColor: '#fafafa',
        }}
      />
      <h3 style={{ margin: 0, fontSize: '1.05rem', minHeight: '3em' }}>
        {product.title}
      </h3>
      <p style={{ margin: '8px 0', color: '#555', fontSize: '0.9rem' }}>
        Категория: {product.category}
      </p>
      <p style={{ margin: 'auto 0 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
        {Math.round(rubPrice).toLocaleString('ru-RU')} ₽
      </p>
    </article>
  );
}