import React, {Fragment} from "react";
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
    let data = JSON.stringify(doc.data);
    console.log( data,'-data-')
    return (
        <Fragment>{"allHomepages":{"edges":[{"node":{"body":[{"__typename":"HomepageBodyHeadline_with_button"},{"__typename":"HomepageBodyFull_width_image"},{"type":"text_info","primary":{"section_title":[{"type":"heading2","text":"L'avenir de l'application Todo","spans":[]}],"left_column_text":[{"type":"paragraph","text":"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non.","spans":[{"start":87,"end":98,"type":"hyperlink","data":{"id":"Xs5ushEAACQAIvjn","type":"page","tags":[],"slug":"untitled-document","lang":"fr-fr","uid":"a-propos-de-nous","link_type":"Document","isBroken":false}}]}],"right_column_text":[{"type":"heading3","text":"Ne vous inquiétez plus jamais pour oublier des choses","spans":[]},{"type":"paragraph","text":"Laissez Todoist s'en souvenir pour vous. Vous pouvez obtenir des tâches de votre tête et sur votre liste de tâches à tout moment, n'importe où, sur n'importe quel appareil - même hors ligne.","spans":[]},{"type":"heading3","text":"Todoist aide des millions de personnes à se sentir plus maîtres de leur vie","spans":[]},{"type":"paragraph","text":"Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis. Morbi in sem quis dui placerat ornare.","spans":[]},{"type":"heading3","text":"Concentrez votre énergie sur les bonnes choses","spans":[]},{"type":"paragraph","text":"Praesent dapibus, neque id cursus faucibus, tortor neque egestas auguae, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis.","spans":[]}],"__typename":"HomepageBodyText_infoPrimary"},"__typename":"HomepageBodyText_info"},{"__typename":"HomepageBodyFull_width_image"},{"__typename":"HomepageBodyEmail_signup"}],"__typename":"Homepage"},"__typename":"HomepageConnectionEdge"},{"node":{"body":[{"__typename":"HomepageBodyHeadline_with_button"},{"__typename":"HomepageBodyFull_width_image"},{"type":"text_info","primary":{"section_title":[{"type":"heading2","text":"The future of Todo application","spans":[]}],"left_column_text":[{"type":"paragraph","text":"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mttis eroas. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non.","spans":[{"start":87,"end":98,"type":"hyperlink","data":{"id":"Xs5rBhEAACEAIueu","type":"page","tags":[],"slug":"untitled-document","lang":"en-us","uid":"about-us","link_type":"Document","isBroken":false}}]}],"right_column_text":[{"type":"heading3","text":"Never worry about forgetting things again","spans":[]},{"type":"paragraph","text":"Let Todoist remember it all for you. You can get tasks out of your head and onto your to-do list anytime, anywhere, on any device – even offline.","spans":[]},{"type":"heading3","text":"Todoist helps millions of people feel more in control of their lives","spans":[]},{"type":"paragraph","text":"Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis. Morbi in sem quis dui placerat ornare.","spans":[]},{"type":"heading3","text":"Focus your energy on the right things","spans":[]},{"type":"paragraph","text":"Praesent dapibus, neque id cursus faucibus, tortor neque egestas auguae, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis.","spans":[]}],"__typename":"HomepageBodyText_infoPrimary"},"__typename":"HomepageBodyText_info"},{"__typename":"HomepageBodyFull_width_image"},{"__typename":"HomepageBodyEmail_signup"}],"__typename":"Homepage"},"__typename":"HomepageConnectionEdge"}],"__typename":"HomepageConnectionConnection"}}
        </Fragment>
    );
};

// async function getIntrospectionQueryResultData (apiEndpoint, graphql) {
//     const repoId = "onelasttime";
//   fetch(`https://${repoId}.cdn.prismic.io/api`)
//       .then((r) => r.json())
//       .then((data) => {
//           const ref = data.refs.find((r) => r.id === "master");
//           if (!ref) return;
//           fetch(
//               `https://${repoId}.cdn.prismic.io/graphql?query=%7B%20__schema%20%7B%20types%20%7B%20kind%20name%20possibleTypes%20%7B%20name%20%7D%20%7D%20%7D%20%7D`,
//               {
//                   headers: {
//                       "prismic-ref": ref.ref,
//                   },
//               }
//           )
//               .then((result) => result.json())
//               .then((result) => {
//                   const filteredResults = result;
//                   const filteredData = result.data.__schema.types.filter(
//                       (type) => type.possibleTypes !== null
//                   );
//                   filteredResults.data.__schema.types = filteredData;
//                   console.log(JSON.stringify(filteredResults.data) ,'-filteredResults.data-')
//                   return filteredResults.data;


//               });
//       });
// }


export async function getStaticProps({
    preview,
    previewData,
    locale,
    locales,
}) {
    const ref = previewData ? previewData.ref : null;
    const isPreview = preview || false;
    // const schema = await getIntrospectionQueryResultData(
    //     "https://onelasttime.prismic.io/graphql",
    //     "https://onelasttime.prismic.io/api/v2"
    // );
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
            uri: "https://onelasttime.prismic.io/graphql",
        }),
        cache: new InMemoryCache({ fragmentMatcher }),
    });
   let doc= await client
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
