import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import Head from 'next/head';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import Layout from '@/components/Layout';
import { theme } from '@/constants/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NProgress from 'nprogress'; //nprogress module
import Router from 'next/router';
import { clientInitData, feConfigs } from '@/store/static';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { getLangStore, setLangStore } from '@/utils/i18n';
import { useRouter } from 'next/router';

import 'nprogress/nprogress.css';
import '@/styles/reset.scss';
import { FeConfigsType } from '@/types';

//Binding events.
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 10
    }
  }
});

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { hiId } = router.query as { hiId?: string };
  const { i18n } = useTranslation();

  const [scripts, setScripts] = useState<FeConfigsType['scripts']>([]);
  const [googleClientVerKey, setGoogleVerKey] = useState<string>();

  useEffect(() => {
    (async () => {
      const {
        feConfigs: { scripts, googleClientVerKey }
      } = await clientInitData();
      setScripts(scripts || []);
      setGoogleVerKey(googleClientVerKey);
    })();
  }, []);

  useEffect(() => {
    hiId && localStorage.setItem('inviterId', hiId);
  }, [hiId]);

  useEffect(() => {
    const lang = getLangStore() || 'zh';
    i18n?.changeLanguage?.(lang);
    setLangStore(lang);
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>{feConfigs?.systemTitle || 'AI'}</title>
        <meta name="description" content="Embedding + LLM, Build AI knowledge base" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="/js/qrcode.min.js" strategy="lazyOnload"></Script>
      <Script src="/js/pdf.js" strategy="lazyOnload"></Script>
      <Script src="/js/html2pdf.bundle.min.js" strategy="lazyOnload"></Script>
      {scripts?.map((item, i) => (
        <Script key={i} strategy="lazyOnload" {...item}></Script>
      ))}
      {googleClientVerKey && (
        <>
          <Script
            src={`https://www.recaptcha.net/recaptcha/api.js?render=${googleClientVerKey}`}
            strategy="lazyOnload"
          ></Script>
        </>
      )}
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

export default appWithTranslation(App);
