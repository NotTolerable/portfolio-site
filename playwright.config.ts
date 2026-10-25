import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  // WebGL suites share a software GPU; simultaneous worlds distort animation timing.
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3012",
    channel: "chrome",
    launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3012",
    url: "http://127.0.0.1:3012",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
