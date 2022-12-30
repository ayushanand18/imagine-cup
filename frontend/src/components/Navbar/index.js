import React from 'react';
import styles from './Navbar.module.scss';

const Navbar = (props) => {
  return (
    <nav className={styles.navbar}>
      {/* <p>{name}</p> */}
      {/* <p>Logged in as {user?.email}</p>  */}
      <p className={styles.title}>Welcome back, NAME</p>
      <p className={styles.subTitle}>How are you doing?</p>
    </nav>
  );
};

export default Navbar;
