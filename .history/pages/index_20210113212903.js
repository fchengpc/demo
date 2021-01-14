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
