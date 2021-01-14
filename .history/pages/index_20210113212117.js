import React from "react";
import { Client, manageLocal } from "utils/prismicHelpers";
import { homepageToolbarDocs } from "utils/prismicToolbarQueries";
import useUpdatePreviewRef from "utils/hooks/useUpdatePreviewRef";
import useUpdateToolbarDocs from "utils/hooks/useUpdateToolbarDocs";
import { Layout, SliceZone } from "components";

import { PrismicLink } from "apollo-link-prismic";
import {
    InMemoryCache,
    IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";

/**
 * Homepage component
 */
const Homepage = ({ doc, menu, lang, preview }) => {
    if (doc && doc.data) {
        useUpdatePreviewRef(preview, doc.id);
        useUpdateToolbarDocs(homepageToolbarDocs(preview.activeRef, doc.lang), [
            doc,
        ]);

        return (
            <Layout
                altLangs={doc.alternate_languages}
                lang={lang}
                menu={menu}
                isPreview={preview.isActive}
            >
                <SliceZone sliceZone={doc.data.body} />
            </Layout>
        );
    }
};
const refKey = (apiEndpoint, accessToken) => apiEndpoint + accessToken;

const getRef = async ({
    previewCookie,
    apiEndpoint,
    accessToken,
    webhookEnabled,
}) => {
    if (previewCookie && isPreviewRef(previewCookie)) {
        return Promise.resolve(previewCookie);
    }
    const key = refKey(apiEndpoint, accessToken);

    return new Promise((resolve, reject) => {
        const currentTime = new Date().getTime(),
            { ref, time } = {};

        if (ref && (webhookEnabled || currentTime - time <= API_UPDATE_MAX)) {
            //if webhook enabled then keep serving the cached copy
            console.log("API resp from cache");
            resolve(ref);
        }

        if (!time || currentTime - time > API_UPDATE_FREQUENCY) {
            fetch(`${apiEndpoint}`)
                .then((response) => response.json())
                .then((api) => {
                    const masterRef = api.refs.find(
                        (r) => r.isMasterRef === true
                    );
                    if (!time || currentTime - time > API_UPDATE_MAX) {
                        resolve(masterRef.ref);
                        console.log("API resp force fetching");
                    } else {
                        console.log("API resp from background fetching");
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        }
    });
};

async function getIntrospectionQueryResultData(apiEndpoint, graphql) {
    return getRef({ apiEndpoint })
        .then((ref) => {
            return fetch(
                `https://onelasttime.prismic.io/graphql?query=%7B%20__schema%20%7B%20types%20%7B%20kind%20name%20possibleTypes%20%7B%20name%20%7D%20%7D%20%7D%20%7D`,

            );
        })
        .then((result) => {
            console.log(result, '-result-')
            return result.json();
        })
        .then((result) => {
            console.log(result, "-result-");
            try {
                const filteredData = result.data.__schema.types.filter(
                    (type) => type.possibleTypes !== null
                );
                result.data.__schema.types = filteredData;

                return result.data;
            } catch (err) {
                console.log('--------------------------------');
                Promise.reject(err);
            }
        });
}

const repoId = "onelasttime";

fetch(`https://${repoId}.cdn.prismic.io/api`)
  .then((r) => r.json())
  .then((data) => {
    const ref = data.refs.find((r) => r.id === 'master');
    if (!ref) return;
    fetch(
      `https://${repoId}.cdn.prismic.io/graphql?query=%7B%20__schema%20%7B%20types%20%7B%20kind%20name%20possibleTypes%20%7B%20name%20%7D%20%7D%20%7D%20%7D`,
      {
        headers: {
          'prismic-ref': ref.ref,
        },
      },
    )
      .then((result) => result.json())
      .then((result) => {
        const filteredResults = result;
        const filteredData = result.data.__schema.types.filter(
          (type) => type.possibleTypes !== null,
        );
        filteredResults.data.__schema.types = filteredData;
        fs.writeFileSync('./src/utils/fragmentTypes.json', JSON.stringify(filteredResults.data), (err) => {
          if (err) {
            console.error('Error writing fragmentTypes file', err);
          } else {
            console.log('Fragment types successfully extracted!');
          }
        });
      });
  });

export async function getStaticProps({
    preview,
    previewData,
    locale,
    locales,
}) {
    const ref = previewData ? previewData.ref : null;
    const isPreview = preview || false;
    const schema = await getIntrospectionQueryResultData(
        "https://onelasttime.prismic.io/graphql",
        "https://onelasttime.prismic.io/api/v2"
    );
    const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData: schema,
    });

    const client2 = new ApolloClient({
        link: PrismicLink({
            uri: "https://onelasttime.prismic.io/graphql",
        }),
        cache: new InMemoryCache({ fragmentMatcher }),
    });

    client2
        .query({
            query: gql`
                query {
                    allHomepages {
                        edges {
                            node {
                                body {
                                    ... on HomepageBodyText_info {
                                        type
                                        primary {
                                            section_title
                                            left_column_text
                                            right_column_text
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
        })
        .then((response) => {
            console.log(response, "res");
        })
        .catch((error) => {
            console.error(error);
        });

    const { currentLang, isMyMainLanguage } = manageLocal(locales, locale);

    return {
        props: {
            preview: {
                isActive: isPreview,
                activeRef: ref,
            },
            lang: {
                currentLang,
                isMyMainLanguage,
            },
        },
    };
}

export default Homepage;
