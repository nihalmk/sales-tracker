import React from 'react';
import Head from 'next/head';
import App from 'next/app';
import { withApollo } from '../apollo/client';
import 'tabler-react/dist/Tabler.css';
import "react-datepicker/dist/react-datepicker.css";
import UserWrapper from '../components/UserWrapper/UserWrapper';
// import { config } from '@fortawesome/fontawesome-svg-core';
// import '@fortawesome/fontawesome-svg-core/styles.css';
import Router from 'next/router';
import { AuthenticatedPages } from '../utils/pages';

// config.autoAddCss = false;

class MyApp extends App {
  state = {
    loaded: false,
  };

  componentDidMount() {
    this.setState({ loaded: true });
  }

  render(): React.ReactElement {
    const { Component, pageProps } = this.props;

    let path = Router && Router.router && Router.router.route;

    const isAuthenticationNeeded = () => {
      return Object.values(AuthenticatedPages).includes(path);
    };

    return (
      <React.Fragment>
        <Head>
          <title>Shop Tracker</title>
          <link rel="icon" href="/static/favicon.ico" />
        </Head>
        {this.state.loaded &&
          (isAuthenticationNeeded() ? (
            <UserWrapper
              Component={Component}
              pageProps={pageProps}
            ></UserWrapper>
          ) : (
            <Component {...pageProps} />
          ))}
      </React.Fragment>
    );
  }
}

export default withApollo(MyApp);
