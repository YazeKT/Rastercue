import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";
import { Provider } from "jotai";
import "react-tooltip/dist/react-tooltip.css";
import { Toaster } from "@/components/ui/toaster";
import { Tooltip } from "react-tooltip";
import { useEffect } from "react";

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'rastercue');
  }, []);
  return (
    <>
      <Head>
        <title>Rastercue</title>
        <link rel="icon" type="image/svg+xml" href="rastercue.svg" />
      </Head>
      <base href="./" />

      <Provider>
          <Component {...pageProps} />
          <Toaster />
          <Tooltip
            className="z-[999] max-w-sm break-words !bg-secondary"
            id="tooltip"
          />
      </Provider>
    </>
  );
};

export default MyApp;
