import React from 'react';
// import { connect } from 'dva';
import styles from './IndexPage.less';
import '../assets/css/animate.css'
import './test.css'
function IndexPage() {
  return (
    <div className={styles.normal}>
      <h1>Yay! Welcome to dva!</h1>
    </div>
  );
}

IndexPage.propTypes = {
};

export default IndexPage;
