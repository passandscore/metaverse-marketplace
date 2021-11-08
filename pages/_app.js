import "../styles/globals.css";
import Layout from "../components/Layout";

function Marketplace({ Component, pageProps }) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default Marketplace;
