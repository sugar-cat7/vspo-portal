import { check } from "k6";
import http from "k6/http";
import type { Options } from "k6/options";

const ENV = {
  // Load test configuration
  VUS: Number(__ENV.VUS || 1), // Number of virtual users to run concurrently
  DURATION: __ENV.DURATION || "5s", // Total test execution time
  USE_STAGES: __ENV.USE_STAGES === "true", // Whether to use staged load adjustment; VUS/DURATION is used if false

  // Staging configuration (parameters required for staged load adjustment)
  RAMP_UP_TARGET: Number(__ENV.RAMP_UP_TARGET || 5), // Target VU count for ramp-up phase
  RAMP_UP_DURATION: __ENV.RAMP_UP_DURATION || "10s", // Duration of ramp-up phase
  PEAK_TARGET: Number(__ENV.PEAK_TARGET || 50), // Target VU count for peak phase
  PEAK_DURATION: __ENV.PEAK_DURATION || "30s", // Duration of peak phase
  RAMP_DOWN_TARGET: Number(__ENV.RAMP_DOWN_TARGET || 0), // Target VU count for ramp-down phase
  RAMP_DOWN_DURATION: __ENV.RAMP_DOWN_DURATION || "10s", // Duration of ramp-down phase

  // API configuration
  TARGET_HOST: __ENV.TARGET_HOST || "", // Base URL of the API

  // Test execution configuration
  SCENARIO_NAME: __ENV.SCENARIO_NAME || "default", // Name of the scenario to execute

  // CF Access configuration
  CF_ACCESS_CLIENT_ID: __ENV.CF_ACCESS_CLIENT_ID || "",
  CF_ACCESS_CLIENT_SECRET: __ENV.CF_ACCESS_CLIENT_SECRET || "",
};

export const options: Options = ENV.USE_STAGES
  ? {
      stages: [
        // Ramp-up phase - gradually increase VUs
        { target: ENV.RAMP_UP_TARGET, duration: ENV.RAMP_UP_DURATION },
        // Peak phase - maintain maximum load for a certain period
        { target: ENV.PEAK_TARGET, duration: ENV.PEAK_DURATION },
        // Ramp-down phase - gradually decrease VUs
        { target: ENV.RAMP_DOWN_TARGET, duration: ENV.RAMP_DOWN_DURATION },
      ],
      thresholds: {
        // HTTP request error rate threshold
        http_req_failed: ["rate<0.01"], // Require error rate below 1%
        // Response time threshold
        http_req_duration: ["p(95)<500"], // Require 95% of requests to be under 500ms
      },
    }
  : {
      vus: ENV.VUS,
      duration: ENV.DURATION,
      thresholds: {
        // HTTP request error rate threshold
        http_req_failed: ["rate<0.01"], // Require error rate below 1%
        // Response time threshold
        http_req_duration: ["p(95)<500"], // Require 95% of requests to be under 500ms
      },
    };

const defaultHeaders = {
  "Content-Type": "application/json",
  "CF-Access-Client-Id": ENV.CF_ACCESS_CLIENT_ID,
  "CF-Access-Client-Secret": ENV.CF_ACCESS_CLIENT_SECRET,
};

// Debug: Log environment variables and headers
console.log("=== Environment Configuration ===");
console.log("TARGET_HOST:", ENV.TARGET_HOST);
console.log("SCENARIO_NAME:", ENV.SCENARIO_NAME);
console.log("================================");

// Get scenario name from environment variable
const scenarioName = ENV.SCENARIO_NAME;

// List of VSPO schedule site endpoints
const endpoints = [
  "/schedule/all",
  "/schedule/live",
  "/schedule/upcoming",
  "/clips",
  "/events/2025-05",
];

// List of internationalized endpoints
const localizedEndpoints = [
  ...endpoints,
  ...endpoints.map((endpoint) => `/ja${endpoint}`),
  ...endpoints.map((endpoint) => `/en${endpoint}`),
];

/**
 * Default scenario - access all endpoints
 */
function defaultScenario(): void {
  console.log("Running default scenario - testing all endpoints");

  for (const endpoint of localizedEndpoints) {
    const url = `${ENV.TARGET_HOST}${endpoint}`;
    console.log(`Testing: ${url}`);

    const response = http.get(url, { headers: defaultHeaders });

    // Debug: Log response details
    console.log(
      `  Status: ${response.status}, Duration: ${response.timings.duration}ms`,
    );
    if (response.status !== 200) {
      console.log(`  Error ${response.status}`);
    }

    check(response, {
      "status is 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
      "response has content": (r) =>
        r.body != null && typeof r.body === "string" && r.body.length > 0,
    });
  }
}

/**
 * Schedule page specific scenario
 */
function scheduleScenario(): void {
  console.log("Running schedule scenario - testing schedule endpoints only");

  const scheduleEndpoints = localizedEndpoints.filter((endpoint) =>
    endpoint.includes("/schedule/"),
  );

  for (const endpoint of scheduleEndpoints) {
    const url = `${ENV.TARGET_HOST}${endpoint}`;
    console.log(`Testing: ${url}`);

    const response = http.get(url, { headers: defaultHeaders });

    check(response, {
      "status is 200": (r) => r.status === 200,
      "response time < 300ms": (r) => r.timings.duration < 300,
      "response has content": (r) =>
        r.body != null && typeof r.body === "string" && r.body.length > 0,
    });
  }
}

/**
 * Internationalization test scenario
 */
function i18nScenario(): void {
  console.log("Running i18n scenario - testing localized endpoints");

  const i18nEndpoints = localizedEndpoints.filter(
    (endpoint) => endpoint.startsWith("/ja/") || endpoint.startsWith("/en/"),
  );

  for (const endpoint of i18nEndpoints) {
    const url = `${ENV.TARGET_HOST}${endpoint}`;
    console.log(`Testing: ${url}`);

    const response = http.get(url, { headers: defaultHeaders });

    check(response, {
      "status is 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
      "response has content": (r) =>
        r.body != null && typeof r.body === "string" && r.body.length > 0,
    });
  }
}

/**
 * Random endpoint access scenario
 */
function randomScenario(): void {
  console.log("Running random scenario - testing random endpoints");

  // Randomly select an endpoint
  const randomEndpoint =
    localizedEndpoints[Math.floor(Math.random() * localizedEndpoints.length)];
  const url = `${ENV.TARGET_HOST}${randomEndpoint}`;

  console.log(`Testing random endpoint: ${url}`);

  const response = http.get(url, { headers: defaultHeaders });

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "response has content": (r) =>
      r.body != null && typeof r.body === "string" && r.body.length > 0,
  });
}

// List of available scenarios
const scenarios: Record<string, () => void> = {
  default: defaultScenario,
  schedule: scheduleScenario,
  i18n: i18nScenario,
  random: randomScenario,
};

export default (): void => {
  if (scenarios[scenarioName]) {
    scenarios[scenarioName]();
  } else {
    console.log(`Unknown scenario: ${scenarioName}, falling back to default`);
    scenarios.default();
  }
};
