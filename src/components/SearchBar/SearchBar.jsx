import { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(term.trim());
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        id="search"
        name="search"
        className={styles.input}
        type="text"
        placeholder="Search for a song, artist, or album..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button className={styles.button} type="submit">Search</button>
    </form>
  );
}

export default SearchBar;
