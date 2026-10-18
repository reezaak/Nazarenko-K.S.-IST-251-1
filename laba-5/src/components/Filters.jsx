import React from 'react';

const CATEGORIES = [
  { value: 'electronics', label: 'Электроника' },
  { value: 'jewelery', label: 'Ювелирные изделия' },
  { value: "men's clothing", label: 'Мужская одежда' },
  { value: "women's clothing", label: 'Женская одежда' },
];

const PRICE_MIN = 0;
const PRICE_MAX = 15000;

export function Filters({ onFilterChange, initialFilters }) {
  const [localCategories, setLocalCategories] = React.useState(
    initialFilters.categories || []
  );

  const [localMinPrice, setLocalMinPrice] = React.useState(
    String(initialFilters.minPrice ?? '')
  );
  const [localMaxPrice, setLocalMaxPrice] = React.useState(
    String(initialFilters.maxPrice ?? '')
  );

  const [sliderMin, setSliderMin] = React.useState(
    initialFilters.minPrice ?? PRICE_MIN
  );
  const [sliderMax, setSliderMax] = React.useState(
    initialFilters.maxPrice ?? PRICE_MAX
  );

  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const errs = {};
    const min = localMinPrice ? Number(localMinPrice) : undefined;
    const max = localMaxPrice ? Number(localMaxPrice) : undefined;

    if (min !== undefined && min < 0) {
      errs.min = 'Цена не может быть отрицательной';
    }
    if (max !== undefined && max < 0) {
      errs.max = 'Цена не может быть отрицательной';
    }
    if (
      min !== undefined &&
      max !== undefined &&
      min >= 0 &&
      max >= 0 &&
      min > max
    ) {
      errs.min = 'Цена «от» не может быть больше цены «до»';
      errs.max = 'Цена «до» не может быть меньше цены «от»';
    }
    return errs;
  };

  const toggleCategory = (value) => {
    setLocalCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const handleApply = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onFilterChange({
      categories: localCategories,
      minPrice: localMinPrice !== '' ? Number(localMinPrice) : undefined,
      maxPrice: localMaxPrice !== '' ? Number(localMaxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setLocalCategories([]);
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSliderMin(PRICE_MIN);
    setSliderMax(PRICE_MAX);
    setErrors({});
    onFilterChange({
      categories: [],
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const handleMinChange = (e) => {
    setLocalMinPrice(e.target.value);
    setErrors((prev) => ({ ...prev, min: undefined }));
    if (e.target.value !== '') setSliderMin(Number(e.target.value));
  };

  const handleMaxChange = (e) => {
    setLocalMaxPrice(e.target.value);
    setErrors((prev) => ({ ...prev, max: undefined }));
    if (e.target.value !== '') setSliderMax(Number(e.target.value));
  };

  const handleSliderMin = (e) => {
    const v = Math.min(Number(e.target.value), sliderMax);
    setSliderMin(v);
    setLocalMinPrice(String(v));
    setErrors((prev) => ({ ...prev, min: undefined }));
  };

  const handleSliderMax = (e) => {
    const v = Math.max(Number(e.target.value), sliderMin);
    setSliderMax(v);
    setLocalMaxPrice(String(v));
    setErrors((prev) => ({ ...prev, max: undefined }));
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <fieldset
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
        }}
      >
        <legend style={{ padding: '0 8px', fontWeight: 'bold' }}>
          Категории
        </legend>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {CATEGORIES.map((c) => (
            <label
              key={c.value}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <input
                type="checkbox"
                checked={localCategories.includes(c.value)}
                onChange={() => toggleCategory(c.value)}
              />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label>Цена от</label>
          <input
            type="number"
            value={localMinPrice}
            onChange={handleMinChange}
            placeholder="0"
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              border: errors.min ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          {errors.min && (
            <span
              style={{
                color: 'red',
                fontSize: '0.85rem',
                marginTop: '4px',
                display: 'block',
              }}
            >
              {errors.min}
            </span>
          )}
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step="50"
            value={sliderMin}
            onChange={handleSliderMin}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </div>

        <div>
          <label>Цена до</label>
          <input
            type="number"
            value={localMaxPrice}
            onChange={handleMaxChange}
            placeholder="15000"
            min="0"
            style={{
              width: '100%',
              padding: '8px',
              border: errors.max ? '1px solid red' : '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
          {errors.max && (
            <span
              style={{
                color: 'red',
                fontSize: '0.85rem',
                marginTop: '4px',
                display: 'block',
              }}
            >
              {errors.max}
            </span>
          )}
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step="50"
            value={sliderMax}
            onChange={handleSliderMax}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleApply}
          style={{
            padding: '10px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Применить фильтры
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '10px 24px',
            background: '#f3f4f6',
            color: '#111',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Сбросить
        </button>
      </div>

      <p style={{ color: '#777', fontSize: '0.85rem', marginTop: '8px' }}>
        Выбранные категории:{' '}
        {localCategories.length === 0
          ? 'все'
          : localCategories.join(', ')}
      </p>
    </div>
  );
}