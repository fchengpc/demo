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
import config from '../config'

const Page = ({ doc}) => {
    let data = doc.data;
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
            uri: config.gql,
        }),
        cache: new InMemoryCache({ fragmentMatcher }),
    });
    let doc = await apolloClient
        .query({
            query: gql`
                query {
                    allPages {
                        edges {
                            node {
                                slug
                            }
                        }
                    }
                }
            `,
        })
        .then((r) => {
            // console.log( r,'-query call response-')
            return r;
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

export default Page;
