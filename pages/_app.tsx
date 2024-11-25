import type { AppProps } from 'next/app'
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: any;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
  useEffect(() => {
    const handleRouteChange = () => {
      if (window && window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: router.asPath,
        });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}');
          `,
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp
