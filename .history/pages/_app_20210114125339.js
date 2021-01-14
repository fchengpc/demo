import 'styles/main.scss';

class MyApp extends App {
    static getApolloConfig(config, { ref }) {
        const { prismic, schema } = config,
            fragmentMatcher = new IntrospectionFragmentMatcher({
                introspectionQueryResultData: schema,
            }),
            prismicLink = PrismicLink({
                apiEndpoint: prismic.apiEndpoint,
                graphql: prismic.graphql,
                accessToken: prismic.accessToken,
                ref,
            }),
            catalogLink = new RestLink({
                uri: config.catalog.uri,
            }),
            mochaLink = new MochaRestLink(config),
            keLink = new HttpLink({
                uri: config.ke.uri,
                headers: {
                    "x-consumer-id": config.ke.publicKey,
                },
            });

        const link = new RetryLink().split(
            (operation) => operation.getContext().catalog === true,
            catalogLink,
            ApolloLink.split(
                (operation) => operation.getContext().ke === true,
                keLink,
                ApolloLink.split(
                    (operation) => operation.getContext().local === true,
                    mochaLink,
                    prismicLink
                )
            )
        );
        return {
            link,
            createCache: () => new InMemoryCache({ fragmentMatcher }),
            resolvers: {},
        };
    }

    componentDidMount() {
        if (!config && this.props.config) config = this.props.config;
    }

    static async getInitialProps({ Component, ctx }) {
        const kapCookies = cookies(ctx),
            //eslint-disable-next-line no-unused-vars
            { config: ctxConfig, serverConfig, ...query } = ctx.query,
            localConf = ctxConfig || config,
            country = get(
                ctx,
                'req.headers["cloudfront-viewer-country"]',
                "US"
            );

        let pageProps = {};
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps({
                ...ctx,
                config: localConf,
                query,
                apolloConfig: MyApp.getApolloConfig(localConf, {
                    ref: kapCookies[PREVIEW_COOKIE],
                }),
                cookies: kapCookies,
            });
        } else {
            pageProps["query"] = query;
            pageProps["cookies"] = kapCookies;
        }

        return {
            config: localConf,
            pageProps,
            country,
        };
    }

    render() {
        const { Component, config, pageProps, country } = this.props,
            ref = pageProps.cookies && pageProps.cookies[PREVIEW_COOKIE],
            allowDarkMode =
                config.prismicConfig && config.prismicConfig.dark_mode;

        return (
            <DynamicTheme allowDarkMode={allowDarkMode} name={config.theme}>
                <SharedStateProvider
                    config={config}
                    cookies={pageProps.cookies}
                    query={pageProps.query}
                    prismicConfig={config.prismicConfig}
                    country={country}
                >
                    <DOMProvider>
                        <Component
                            apolloConfig={MyApp.getApolloConfig(config, {
                                ref,
                            })}
                            {...pageProps}
                        />
                    </DOMProvider>
                </SharedStateProvider>
            </DynamicTheme>
        );
    }
}

export default MyApp;
