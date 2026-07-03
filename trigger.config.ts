import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID!,
  maxDuration: 600,
  dirs: ["./trigger"],
});
