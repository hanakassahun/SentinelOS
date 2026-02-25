import React from 'react';
import styles from './Loader.module.css';

const Loader = () => (
  <div className={styles.loader}>
    <div className={styles.bar} />
  </div>
);

export default Loader;
