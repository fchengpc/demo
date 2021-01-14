import 'styles/main.scss';

function MyApp ({ Component, pageProps }) {
     const schema = await getIntrospectionQueryResultData(
         "https://newktp.prismic.io/graphql",
         "https://newktp.prismic.io/api/v2"
     ).then(data => {
         console.log( data,'-data-')
     });
  return <Component {...pageProps} />;
}

export default MyApp;
