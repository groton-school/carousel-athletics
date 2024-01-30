module.exports = require('@battis/webpack/ts/spa')({
  root: __dirname,
  appName: 'Carousel - Athletics',
  entry: './src/client/index.ts',
  template: 'template',
  build: 'public'
});
