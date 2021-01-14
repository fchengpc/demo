import React, {Fragment} from "react";
import { Client, manageLocal } from "utils/prismicHelpers";
import { homepageToolbarDocs } from "utils/prismicToolbarQueries";
import useUpdatePreviewRef from "utils/hooks/useUpdatePreviewRef";
import useUpdateToolbarDocs from "utils/hooks/useUpdateToolbarDocs";
import { Layout, SliceZone } from "components";
import _ from 'lodash';
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
    let data = doc.data.allHomepages;
    console.log( data,'-data-')
    return (
        <Fragment>
            {JSON.stringify(data)}
        </Fragment>
    );
};

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
                  console.log(JSON.stringify(filteredResults.data) ,'-filteredResults.data-')
                  return filteredResults.data;


              });
      });
}

 const schema = await getIntrospectionQueryResultData(
     "https://newktp.prismic.io/graphql",
     "https://newktp.prismic.io/api/v2"
 );
export async function getStaticProps({
    preview,
    previewData,
    locale,
    locales,
}) {
    const ref = previewData ? previewData.ref : null;
    const isPreview = preview || false;

    const testSchema = {
        __schema: {
            types: [
                {
                    kind: "UNION",
                    name: "HomepageBody",
                    possibleTypes: [
                        { name: "HomepageBodyHeadline_with_button" },
                        { name: "HomepageBodyFull_width_image" },
                        { name: "HomepageBodyInfo_with_image" },
                        { name: "HomepageBodyText_info" },
                        { name: "HomepageBodyEmail_signup" },
                    ],
                },
                {
                    kind: "UNION",
                    name: "PageBody",
                    possibleTypes: [
                        { name: "PageBodyHeadline_with_button" },
                        { name: "PageBodyFull_width_image" },
                        { name: "PageBodyInfo_with_image" },
                        { name: "PageBodyText_info" },
                        { name: "PageBodyEmail_signup" },
                    ],
                },
                {
                    kind: "INTERFACE",
                    name: "_Document",
                    possibleTypes: [
                        { name: "Homepage" },
                        { name: "Page" },
                        { name: "Top_menu" },
                    ],
                },
                {
                    kind: "INTERFACE",
                    name: "_Linkable",
                    possibleTypes: [
                        { name: "Homepage" },
                        { name: "Page" },
                        { name: "Top_menu" },
                        { name: "_ExternalLink" },
                        { name: "_FileLink" },
                        { name: "_ImageLink" },
                    ],
                },
            ],
        },
    };
    const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData: testSchema,
    });

    const client = new ApolloClient({
        link: PrismicLink({
            uri: "https://newktp.prismic.io/graphql",
        }),
        cache: new InMemoryCache({ fragmentMatcher }),
    });
    let doc = await client
        .query({
            query: gql`
                query {
                    allHomepages {
                        edges {
                            node {
                                body {
                                    ... on HomepageBodyText_info {
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
            return response;
        })
        .catch((error) => {
            console.error(error);
        });
    const { currentLang, isMyMainLanguage } = manageLocal(locales, locale);

    return {
        props: {
            doc,
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
