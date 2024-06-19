const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
const Browser = require("@sentry/browser");

Sentry.init({
  dsn: "ADD_YOUR_DSN",
  integrations: [
    nodeProfilingIntegration(),
    Browser.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
