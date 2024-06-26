// // ****Auto Instrumentation****

// const { NodeSDK } = require("@opentelemetry/sdk-node");
// const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");
// const {
//   getNodeAutoInstrumentations,
// } = require("@opentelemetry/auto-instrumentations-node");
// const {
//   PeriodicExportingMetricReader,
//   ConsoleMetricExporter,
// } = require("@opentelemetry/sdk-metrics");

// const {
//   OTLPTraceExporter,
// } = require("@opentelemetry/exporter-trace-otlp-http");

// // const {
// //   OTLPTraceExporter,
// // } = require("@opentelemetry/exporter-trace-otlp-proto");

// // const {
// //   OTLPTraceExporter,
// // } = require("@opentelemetry/exporter-trace-otlp-grpc");

// const sdk = new NodeSDK({
//   traceExporter: new OTLPTraceExporter({
//     url: "grpc://otel-collector:4317",
//     headers: {},
//   }),
//   metricReader: new PeriodicExportingMetricReader({
//     exporter: new ConsoleMetricExporter(),
//   }),
//   instrumentations: [getNodeAutoInstrumentations()],
// });

// sdk.start();

/****Manual Instrumentation ****/
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require("@opentelemetry/sdk-metrics");
const { Resource } = require("@opentelemetry/resources");
const {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} = require("@opentelemetry/semantic-conventions");

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: "booking-service",
    [SEMRESATTRS_SERVICE_VERSION]: "0.1.0",
  }),
  // traceExporter: new ConsoleSpanExporter(),
  traceExporter: new OTLPTraceExporter({
    url: "grpc://otel-collector:4317",
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
});

sdk.start();
