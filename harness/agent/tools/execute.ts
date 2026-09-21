import { DENIED, verifyAuthorization } from "../../src/capability.js";
import { createExecuteTool } from "../../src/eve-adapter.js";
import { executeAuthorized } from "../../src/supervisor.js";

export default createExecuteTool(async (input, ctx) => {
  const publicKey = process.env.INC2_SUPERVISOR_PUBLIC_KEY ?? "";
  const auth = verifyAuthorization(input.authorization, publicKey, ctx.session.id);
  if (!auth) return DENIED;
  return executeAuthorized(auth, await ctx.getSandbox(), input);
});
