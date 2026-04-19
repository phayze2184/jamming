// 1. Imports
import { useState } from 'react';
import styles from './SearchBar.module.css';
 
// 2. Component function
function SearchBar({ prop1, prop2 }) {
 
  // 3. State declarations
  const [value, setValue] = useState('');
 
  // 4. Derived values / computed variables
 
  // 5. Event handlers
 
  // 6. Return — JSX only, no logic
  return (
    <div className={styles.wrapper}>
      ...
    </div>
  );
}
 
// 7. Default export
export default SearchBar;