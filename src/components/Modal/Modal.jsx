import styles from './Modal.module.css';

function Modal({ message, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.box} onClick={(e) => e.stopPropagation()}>
        <p className={styles.message}>{message}</p>
        <button className={styles.button} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Modal;
