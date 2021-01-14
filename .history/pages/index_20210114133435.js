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
import schemaTest from "../prismicIntrospectionResults";

cosnt enpoint
/**
 * Homepage component
 */
const Homepage = ({ doc, menu, lang, preview }) => {
    let data = doc.data.allHomepages;

    return (
        <Fragment>
            {JSON.stringify(data)}
        </Fragment>
    );
};

export async function getStaticProps () {
    // const schema =  getIntrospectionQueryResultData(
    //     "https://newktp.prismic.io/graphql",
    //     "https://newktp.prismic.io/api/v2"
    // )

    const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData: schemaTest,
    });


    const apolloClient = new ApolloClient({
        link: PrismicLink({
            uri: "https://onelasttime.prismic.io/graphql"
        }),
        cache: new InMemoryCache({ fragmentMatcher }),
    });
    let doc = await apolloClient
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

    return {
        props: {
            doc
        },
    };
}

export default Homepage;
