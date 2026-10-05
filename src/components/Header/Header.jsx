import styles from './Header.module.css';
import Nav from '../Nav/Nav';
import articles from '../../data/articles';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          React Blog <span className={styles.count}>({articles.length})</span>
        </h1>
        <Nav />
      </div>
    </header>
  );
}

export default Header;