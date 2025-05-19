export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '2001', 10),
  app: { name: process.env.APP_NAME, slug: process.env.APP_SLUG },
});
