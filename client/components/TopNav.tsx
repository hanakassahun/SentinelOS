"use client";
import React from 'react';
import styles from './TopNav.module.css';

const TopNav = () => (
  <nav className={styles.topnav}>
    <div className={styles.left}>SentinelOS</div>
    <div className={styles.right}>
      <a href="#profile">Profile</a> | <a href="#settings">Settings</a>
    </div>
  </nav>
);

export default TopNav;
