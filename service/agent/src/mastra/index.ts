import { Mastra } from "@mastra/core";
import { CloudflareDeployer } from "@mastra/deployer-cloudflare";
import { clipAgent } from "./agents/clipAgent";

export const mastra = new Mastra({
  agents: {
    clipAgent,
  },
  deployer: new CloudflareDeployer({
    scope: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    projectName: process.env.CLOUDFLARE_PROJECT_NAME || "",
    auth: {
      apiToken: process.env.CLOUDFLARE_API_TOKEN || "",
    },
  }),
});
