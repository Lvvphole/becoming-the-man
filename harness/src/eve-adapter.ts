import { defineAgent } from "eve";
import { defineTool, type ToolContext } from "eve/tools";
import { docker } from "eve/sandbox/docker";
import { z } from "zod";
import type { ExecuteInput, ExecuteResult } from "./capability.js";

export const SANDBOX_IMAGE =
  "ghcr.io/vercel/eve@sha256:cb73db82b5f7668b4eac357c1bfa54525794f608bb3bf5db20799bfe6fc6565e";

export const createAgentDefinition = () => defineAgent({
  defaultTools: false,
  tool: false,
  model: "openai/gpt-5.6-luna-fast",
});

export const createSandboxBackend = () => docker({
  image: SANDBOX_IMAGE,
  networkPolicy: "deny-all",
  pullPolicy: "always",
  env: {},
});

export const createExecuteTool = (
  execute: (input: ExecuteInput, ctx: ToolContext) => Promise<ExecuteResult>,
) => defineTool({
  description: "Execute one supervisor-authorized capability.",
  inputSchema: z.object({
    capability_id: z.string().min(1),
    content: z.string().optional(),
  }),
  execute,
});
