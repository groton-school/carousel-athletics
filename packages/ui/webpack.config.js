import bundle from '@battis/webpack';

export default bundle.fromTS.toSPA({
  root: import.meta.dirname,
  appName: 'Carousel - Athletics',
  output: { path: './dist' },
  production: true
});
