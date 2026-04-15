//sentry setup
if (typeof Sentry !== 'undefined') {
  Sentry.init({
    dsn: 'https://743695703dd05f789dd1fda87753e367@o4509076922499072.ingest.de.sentry.io/4511224315379792',
    environment: 'production',
    traceSampleRate: 1.0,
  });
} else {
  console.warn('Sentry SDK nu s-a încărcat corect.');
}
