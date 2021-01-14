import React from 'react';
import { Client, manageLocal } from 'utils/prismicHelpers';
import { homepageToolbarDocs } from 'utils/prismicToolbarQueries'
import useUpdatePreviewRef from 'utils/hooks/useUpdatePreviewRef';
import useUpdateToolbarDocs from 'utils/hooks/useUpdateToolbarDocs';
import { Layout, SliceZone } from 'components'

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

    useUpdatePreviewRef(preview, doc.id)
    useUpdateToolbarDocs(homepageToolbarDocs(preview.activeRef, doc.lang), [doc])

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
async function getIntrospectionQueryResultData( apiEndpoint, graphql, ) {
    try {
        const cachedResult = await cache.get(graphql);
        if (cachedResult) return Promise.resolve(JSON.parse(cachedResult));
    } catch (e) {
        console.error('unable to retrieve data from cache', e);
    }

    return getRef({ apiEndpoint })
        .then((ref) => {
            return fetch(`${graphql}?query=%7B%20__schema%20%7B%20types%20%7B%20kind%20name%20possibleTypes%20%7B%20name%20%7D%20%7D%20%7D%20%7D`, {
                headers: {
                    'prismic-ref': ref
                },
            });
        })
        .then((result) => result.json())
        .then((result) => {
            try {
                const filteredData = result.data.__schema.types.filter((type) => type.possibleTypes !== null);
                result.data.__schema.types = filteredData;
                cache.set(graphql, result.data);
                return result.data;
            } catch (err) {
                Promise.reject(err);
            }
        });
}
export async function getStaticProps({
  preview,
  previewData,
  locale,
  locales,
}) {
  const ref = previewData ? previewData.ref : null
  const isPreview = preview || false
 const schema = await getIntrospectionQueryResultData('https://onelasttime.cdn.prismic.io/graphql','https://onelasttime.cdn.prismic.io/api/v2');
  const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData: schema,
  });

const client2 = new ApolloClient({
    link: PrismicLink({
        uri: "https://onelasttime.cdn.prismic.io/graphql",
    }),
    cache: new InMemoryCache(),
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
                                  ... on HomepageBodyHeadline_with_button {
                                      primary {
                                          headline
                                          button
                                          description
                                      }
                                  }
                                  ... on HomepageBodyFull_width_image {
                                      primary {
                                          image
                                          background_image_position
                                      }
                                  }
                                  ... on HomepageBodyInfo_with_image {
                                      primary {
                                          text
                                          section_title
                                          featured_image
                                      }
                                  }
                                  ... on HomepageBodyEmail_signup {
                                      primary {
                                          description
                                          input_label
                                          button_text
                                          section_title
                                          input_placeholder
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
          console.log(response, 'res');
      })
    .catch((error) => {
          console.error(error);
      });



  const { currentLang, isMyMainLanguage} = manageLocal(locales, locale)

  return {
    props: {
      preview: {
        isActive: isPreview,
        activeRef: ref,
      },
      lang:{
        currentLang,
        isMyMainLanguage,
      }
    },
  };
}

export default Homepage;
