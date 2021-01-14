import 'styles/main.scss';

async function getIntrospectionQueryResultData (apiEndpoint, graphql) {
    const repoId = "onelasttime";
  fetch(`https://${repoId}.cdn.prismic.io/api`)
      .then((r) => r.json())
      .then((data) => {
          const ref = data.refs.find((r) => r.id === "master");
          if (!ref) return;
          fetch(
              `https://${repoId}.cdn.prismic.io/graphql?query=%7B%20__schema%20%7B%20types%20%7B%20kind%20name%20possibleTypes%20%7B%20name%20%7D%20%7D%20%7D%20%7D`,
              {
                  headers: {
                      "prismic-ref": ref.ref,
                  },
              }
          )
              .then((result) => result.json())
              .then((result) => {
                  const filteredResults = result;
                  const filteredData = result.data.__schema.types.filter(
                      (type) => type.possibleTypes !== null
                  );
                  filteredResults.data.__schema.types = filteredData;
                  console.log(JSON.stringify(filteredResults.data) ,'-gugu filteredResults.data-')
                  return filteredResults.data;


              });
      });
}
async function MyApp ({ Component, pageProps }) {
  const schema = await getIntrospectionQueryResultData(
    "https://newktp.prismic.io/graphql",
    "https://newktp.prismic.io/api/v2"
  );
  console.log( schema,'-schema-')
  return <Component {...pageProps} />;
}

export default MyApp;
