import React, {Fragment} from "react";

import _ from 'lodash';
import { PrismicLink } from "apollo-link-prismic";
import {
    InMemoryCache,
    IntrospectionFragmentMatcher,
} from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import gql from "graphql-tag";
import schema from "../prismicIntrospectionResults";

const endpoint ='https://onelasttime.prismic.io/graphql'
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
    const fragmentMatcher = new IntrospectionFragmentMatcher({
        introspectionQueryResultData: schema,
    });


    const apolloClient = new ApolloClient({
        link: PrismicLink({
            uri: endpoint,
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
            return error;
        });

    return {
        props: {
            doc
        },
    };
}

export default Homepage;
