export default {
  outdir: './src/paraglide',
  emitTsDeclarations: true,
  outputStructure: 'message-modules',
  cookieName: 'PARAGLIDE_LOCALE',
  strategy: ['url', 'cookie', 'baseLocale'],
  urlPatterns: [
    {
      pattern: '/api/:path(.*)?',
      localized: [['en', '/api/:path(.*)?'], ['zh-cn', '/api/:path(.*)?'], ['ja', '/api/:path(.*)?']],
    },
    {
      pattern: '/',
      localized: [['en', '/'], ['zh-cn', '/zh-cn'], ['ja', '/ja']],
    },
    {
      pattern: '/:path(.*)?',
      localized: [['zh-cn', '/zh-cn/:path(.*)?'], ['ja', '/ja/:path(.*)?'], ['en', '/:path(.*)?']],
    },
  ],
};
