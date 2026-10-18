import { useState } from "react";
import "./DiscountCalculator.css";

const CATEGORIES = [
  { id: "electronics", label: "Электроника", discount: 5 },
  { id: "clothing", label: "Одежда", discount: 15 },
  { id: "groceries", label: "Продукты", discount: 10 },
  { id: "books", label: "Книги", discount: 20 },
  { id: "other", label: "Другое", discount: 0 },
];

const VAT_RATE = 0.22;
const PROMO_CODE = "WELCOME10";
const PROMO_DISCOUNT = 10;
const HISTORY_LIMIT = 5;

function formatRub(value) {
  return (Number.isFinite(value) ? value : 0).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function createItem() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
    price: "",
    category: "electronics",
  };
}

function DiscountCalculator() {
  const [items, setItems] = useState([createItem()]);
  const [promo, setPromo] = useState("");
  const [customDiscount, setCustomDiscount] = useState(null);
  const [withVat, setWithVat] = useState(true);
  const [calculated, setCalculated] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  function handleItemPriceChange(id, value) {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, price: value } : it))
      );
      setError("");
      setCalculated(false);
    }
  }

  function handleItemCategoryChange(id, value) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, category: value } : it))
    );
    setCalculated(false);
  }

  function addItem() {
    setItems((prev) => [...prev, createItem()]);
    setCalculated(false);
  }

  function removeItem(id) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
    setCalculated(false);
  }

  function handlePromoChange(e) {
    setPromo(e.target.value);
    setCalculated(false);
  }

  function handleCustomDiscountChange(e) {
    setCustomDiscount(Number(e.target.value));
    setCalculated(false);
  }

  function toggleCustomDiscount() {
    setCustomDiscount((prev) => (prev === null ? 0 : null));
    setCalculated(false);
  }

  function handleVatToggle(e) {
    setWithVat(e.target.checked);
    setCalculated(false);
  }

  function handleCalculate() {
    for (const it of items) {
      const num = parseFloat(it.price);
      if (!it.price.trim()) {
        setError("Введите цену для всех товаров");
        setCalculated(false);
        return;
      }
      if (isNaN(num) || num <= 0) {
        setError("Цена должна быть положительным числом");
        setCalculated(false);
        return;
      }
    }
    setError("");
    setCalculated(true);

    const total = computeResults().total;
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
      time: new Date().toLocaleTimeString("ru-RU"),
      total,
      itemsCount: items.length,
    };
    setHistory((prev) => [record, ...prev].slice(0, HISTORY_LIMIT));
  }

  function handleReset() {
    setItems([createItem()]);
    setPromo("");
    setCustomDiscount(null);
    setWithVat(true);
    setCalculated(false);
    setError("");
  }

  function computeResults() {
    const rows = items.map((it) => {
      const numPrice = parseFloat(it.price) || 0;
      const cat = CATEGORIES.find((c) => c.id === it.category);
      const catDiscount = cat ? cat.discount : 0;
      const baseDiscount =
        customDiscount !== null ? customDiscount : catDiscount;
      return {
        id: it.id,
        numPrice,
        catLabel: cat ? cat.label : "—",
        catDiscount,
        baseDiscount,
      };
    });

    const subtotal = rows.reduce((s, r) => s + r.numPrice, 0);
    const promoActive = promo.trim().toUpperCase() === PROMO_CODE;

    let discountAmount = 0;
    for (const r of rows) {
      const afterBase = r.numPrice * (1 - r.baseDiscount / 100);
      const afterPromo = promoActive
        ? afterBase * (1 - PROMO_DISCOUNT / 100)
        : afterBase;
      discountAmount += r.numPrice - afterPromo;
    }

    const priceAfterDiscount = subtotal - discountAmount;
    const vatAmount = withVat ? priceAfterDiscount * VAT_RATE : 0;
    const total = priceAfterDiscount + vatAmount;

    return {
      rows,
      subtotal,
      promoActive,
      discountAmount,
      priceAfterDiscount,
      vatAmount,
      total,
    };
  }

  const results = computeResults();

  return (
    <div className="calculator-wrapper">
      <h2 className="calculator-title">Калькулятор скидок</h2>

      {items.map((it, idx) => (
        <div className="item-card" key={it.id}>
          <div className="item-card__head">
            <span className="item-card__num">Товар #{idx + 1}</span>
            {items.length > 1 && (
              <button
                type="button"
                className="item-card__remove"
                onClick={() => removeItem(it.id)}
                title="Удалить товар"
              >
                ✕
              </button>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`price-${it.id}`}>
              Цена товара (P)
            </label>
            <input
              id={`price-${it.id}`}
              type="text"
              className={`field__input ${error ? "field__input--error" : ""}`}
              value={it.price}
              onChange={(e) => handleItemPriceChange(it.id, e.target.value)}
              placeholder="Например: 1000"
              inputMode="decimal"
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`cat-${it.id}`}>
              Категория товара
            </label>
            <select
              id={`cat-${it.id}`}
              className="field__input field__select"
              value={it.category}
              onChange={(e) => handleItemCategoryChange(it.id, e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} — скидка {cat.discount}%
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button type="button" className="btn btn--add" onClick={addItem}>
        + Добавить товар
      </button>

      <div className="field">
        <label className="field__label" htmlFor="promo">
          Промокод (WELCOME10 — дополнительно 10%)
        </label>
        <input
          id="promo"
          type="text"
          className="field__input"
          value={promo}
          onChange={handlePromoChange}
          placeholder="Введите промокод"
        />
        {results.promoActive && (
          <span className="field__hint field__hint--ok">Промокод применён ✓</span>
        )}
      </div>

      <div className="field">
        <div className="field__row">
          <label className="field__label" htmlFor="customDisc">
            Кастомная скидка:{" "}
            {customDiscount !== null ? `${customDiscount}%` : "выкл."}
          </label>
          <button
            type="button"
            className="btn btn--mini"
            onClick={toggleCustomDiscount}
          >
            {customDiscount !== null ? "Отключить" : "Включить"}
          </button>
        </div>
        <input
          id="customDisc"
          type="range"
          min="0"
          max="50"
          step="1"
          value={customDiscount ?? 0}
          disabled={customDiscount === null}
          onChange={handleCustomDiscountChange}
          className="field__range"
        />
      </div>

      <div className="field field--inline">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={withVat}
            onChange={handleVatToggle}
          />
          <span>Начислять НДС (22%)</span>
        </label>
      </div>

      {error && <span className="field__error">{error}</span>}

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={handleCalculate}>
          Рассчитать
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleReset}>
          Сбросить
        </button>
      </div>

      {calculated && !error && (
        <div className="results">
          <h3 className="results__title">Результат расчёта</h3>
          <table className="results__table">
            <tbody>
              <tr>
                <td>Сумма без скидки</td>
                <td className="results__value">{formatRub(results.subtotal)} ₽</td>
              </tr>
              <tr>
                <td>
                  Скидка
                  {results.promoActive ? " (вкл. промокод)" : ""}
                </td>
                <td className="results__value results__value--discount">
                  − {formatRub(results.discountAmount)} ₽
                </td>
              </tr>
              <tr>
                <td>Цена после скидки</td>
                <td className="results__value">
                  {formatRub(results.priceAfterDiscount)} ₽
                </td>
              </tr>
              <tr>
                <td>НДС {withVat ? "(22%)" : "(не начисляется)"}</td>
                <td className="results__value">{formatRub(results.vatAmount)} ₽</td>
              </tr>
              <tr className="results__row--total">
                <td>Итого к оплате</td>
                <td className="results__value">{formatRub(results.total)} ₽</td>
              </tr>
            </tbody>
          </table>

          <details className="results__details">
            <summary>Промежуточные вычисления по товарам</summary>
            <table className="results__table results__table--inner">
              <tbody>
                {results.rows.map((r, i) => (
                  <tr key={r.id}>
                    <td>
                      #{i + 1} {r.catLabel}
                    </td>
                    <td className="results__value">
                      {formatRub(r.numPrice)} ₽ · скидка {r.baseDiscount}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}

      {history.length > 0 && (
        <div className="history">
          <h3 className="history__title">История (последние 5)</h3>
          <ul className="history__list">
            {history.map((h) => (
              <li key={h.id} className="history__item">
                <span className="history__time">{h.time}</span>
                <span>
                  {h.itemsCount} тов. — <b>{formatRub(h.total)} ₽</b>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DiscountCalculator;