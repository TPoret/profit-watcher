import "../styles/globals.css";
import * as PropTypes from "prop-types";

function _app({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

_app.propTypes = {
  Component: PropTypes.any,
  pageProps: PropTypes.object,
};

export default _app;
