const removeMd = require('remove-markdown');
const path = require('path');
const pick = require('lodash/pick');

module.exports = themeConfig => {
    /**
     * Default theme configuration
     */
    themeConfig = Object.assign(themeConfig, {
        nav: themeConfig.nav || [
            {
                text: 'Blog',
                link: '/',
            },
            {
                text: 'Tags',
                link: '/tag/',
            },
        ],
        summary: themeConfig.summary === undefined ? true : themeConfig.summary,
        summaryLength:
            typeof themeConfig.summaryLength === 'number'
                ? themeConfig.summaryLength : 86,
        summaryLengthEN:
            typeof themeConfig.summaryLengthEN === 'number'
                ? themeConfig.summaryLengthEN : 172,
        pwa: !!themeConfig.pwa,
    });

    /**
     * Configure blog plugin
     */
    const defaultBlogPluginOptions = {
        directories: [
            {
                id: 'post',
                dirname: 'note',
                path: '/',
                itemPermalink: '/:regular',
            },
        ],
        frontmatters: [
            {
                id: 'tag',
                keys: ['tags'],
                path: '/tag/',
            },
        ],
        globalPagination: {
            lengthPerPage: 6,
        },
        comment: {
            // Which service you'd like to use
            service: 'disqus',
            // The owner's name of repository to store the issues and comments.
            shortname: 'meowwoo',
        },
    };

    let resolvedFeedOptions;
    const isFeedEnabled = themeConfig.feed && themeConfig.feed.canonical_base;
    if (isFeedEnabled) {
        const {
            rss = true,
            atom = false,
            json = false,
            ...feedOptions
        } = themeConfig.feed;
        resolvedFeedOptions = Object.assign({}, feedOptions, {
            feeds: {
                rss2: { enable: rss },
                atom1: { enable: atom },
                json1: { enable: json },
            },
        })
    }

    const properties = [
        'directories',
        'frontmatters',
        'globalPagination',
        'sitemap',
        'comment',
        'newsletter',
    ];
    const themeConfigPluginOptions = {
        ...pick(themeConfig, properties),
        feed: resolvedFeedOptions,
    };

    const blogPluginOptions = Object.assign(
        {},
        defaultBlogPluginOptions,
        themeConfigPluginOptions
    );

    /**
     * Integrate plugins
     */

    const enableSmoothScroll = themeConfig.smoothScroll === true

    const plugins = [
        '@vuepress/plugin-nprogress',
        ['@vuepress/medium-zoom', true],
        [
            '@vuepress/search',
            {
                searchMaxSuggestions: 10,
            },
        ],
        ['@vuepress/blog', blogPluginOptions],
        ['smooth-scroll', enableSmoothScroll],
        [
            '@vuepress/google-analytics',
            {
                'ga': 'UA-110966400-1'
            }
        ],
        ['@vuepress/back-to-top'],
        'vuepress-plugin-mathjax',
        {
            target: 'svg',
            macros: {
                '*': '\\times',
            },
        },
    ];

    /**
     * Enable pwa
     */
    if (themeConfig.pwa) {
        plugins.push([
            '@vuepress/pwa',
            {
                serviceWorker: true,
                updatePopup: true,
            },
        ])
    }

    const config = {
        plugins,
        define: {
            THEME_BLOG_PAGINATION_COMPONENT: themeConfig.paginationComponent
                ? themeConfig.paginationComponent
                : 'Pagination',
        },
        alias: {
            fonts: path.resolve(__dirname, 'fonts'),
        },
        /**
         * Generate summary.
         */
        extendPageData(pageCtx) {
            const strippedContent = pageCtx._strippedContent;
            if (!strippedContent) {
                return
            }
            if (themeConfig.summary) {
                pageCtx.summary =
                    removeMd(
                        strippedContent
                            .trim()
                            .replace(/^#+\s+(.*)/, '')
                            .slice(0, pageCtx.frontmatter.lang === "en" ? themeConfig.summaryLengthEN : themeConfig.summaryLength)
                    ) + ' ...';
                pageCtx.frontmatter.description = pageCtx.summary
            }
            if (pageCtx.frontmatter.summary) {
                pageCtx.frontmatter.description = pageCtx.frontmatter.summary
            }
        },
    };

    return config
};
