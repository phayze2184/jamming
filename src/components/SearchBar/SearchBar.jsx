//Imports
import { useState } from 'react';
import styles from './SearchBar.module.css';
// SearchBar component with controlled input and form submission handling
function SearchBar({ onSearch }) {
  const [term, setTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };
// Render the search form with input and button, using styles from CSS module
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Search for a song, artist, or album..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button className={styles.button} type="submit">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
