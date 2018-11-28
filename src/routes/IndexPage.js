import React from 'react';
// import { connect } from 'dva';
import styles from './IndexPage.less';
import 'assets/css/animate.css'
import style from './test.css'
function IndexPage() {

  console.log("running")

  return (
    <div className={styles.normal}>
      <h1 className={style.title}>Yay! Welcome to dva!</h1>
    </div>
  );
}

IndexPage.propTypes = {
};

export default IndexPage;
