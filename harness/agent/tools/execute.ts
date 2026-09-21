import { createExecuteTool } from "../../src/eve-adapter.js";
import { executeForSession } from "../../src/supervisor.js";

export default createExecuteTool(async (input, ctx) => {
  const sandbox = await ctx.getSandbox();
  return executeForSession(sandbox.id, sandbox, input);
});
