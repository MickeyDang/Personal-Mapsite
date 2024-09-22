import type { AppProps } from 'next/app'
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
