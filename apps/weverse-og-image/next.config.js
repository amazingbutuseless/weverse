//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  async rewrites() {
    return [
      {
        source: '/:artist/artist/:file(.+\\.png)',
        destination: '/api/thumbnail',
      },
      {
        source: '/:artist/artist/:id',
        has: [{ type: 'header', key: 'accept', value: 'image/png' }],
        destination: '/api/thumbnail',
      },
      { source: '/:artist/artist/:id', destination: '/' },
    ];
  },
};

module.exports = withNx(nextConfig);
