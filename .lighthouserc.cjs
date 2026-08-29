module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start -- -p 3000",
      startServerReadyPattern: "Ready|ready|Local",
      startServerReadyTimeout: 60000,
      url: ["http://127.0.0.1:3000/"],
      numberOfRuns: 3,
      settings: {
        maxWaitForLoad: 45000,
      },
    },
    assert: {
      assertions: {
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 2500, aggregationMethod: "median" },
        ],
        "cumulative-layout-shift": [
          "error",
          { maxNumericValue: 0.1, aggregationMethod: "median" },
        ],
        "total-blocking-time": [
          "warn",
          { maxNumericValue: 300, aggregationMethod: "median" },
        ],
        "categories:performance": [
          "warn",
          { minScore: 0.9, aggregationMethod: "median" },
        ],
        "categories:accessibility": [
          "warn",
          { minScore: 0.95, aggregationMethod: "median" },
        ],
        "categories:best-practices": [
          "warn",
          { minScore: 0.9, aggregationMethod: "median" },
        ],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./artifacts/lighthouse",
    },
  },
};
