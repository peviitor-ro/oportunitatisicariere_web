/* global Sentry */
// sentry setup
const PRODUCTION_HOSTS = ['oportunitatisicariere.ro', 'www.oportunitatisicariere.ro'];
const isProduction = PRODUCTION_HOSTS.includes(window.location.hostname);

if (typeof Sentry !== 'undefined') {
  Sentry.init({
    dsn: 'https://743695703dd05f789dd1fda87753e367@o4509076922499072.ingest.de.sentry.io/4511224315379792',
    environment: isProduction ? 'production' : 'development',
    enabled: isProduction,
    traceSampleRate: 1.0,
    ignoreErrors: [/Object Not Found Matching Id/i],
    beforeSend(event, hint) {
      const error = hint.originalException;
      const errorMessage =
        (error && error.message) || (typeof error === 'string' ? error : null);

      if (errorMessage && /Object Not Found Matching Id/i.test(errorMessage)) {
        return null;
      }

      // erori din scripturi injectate de browser (ex. traducerea Chrome iOS), fara fisier sursa
      const frames = (event.exception?.values || []).flatMap((value) => value.stacktrace?.frames || []);
      if (frames.length > 0 && frames.every((frame) => !/^https?:\/\//.test(frame.filename || ''))) {
        return null;
      }
      return event;
    },
  });
} else {
  console.warn('Sentry SDK nu s-a încărcat corect.');
}
