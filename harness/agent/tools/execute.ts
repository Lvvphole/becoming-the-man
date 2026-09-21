import { DENIED, selectGrant, verifyAuthorization } from "../../src/capability.js";
import { createExecuteTool } from "../../src/eve-adapter.js";
import { executeAuthorized } from "../../src/supervisor.js";

export default createExecuteTool(async (input, ctx) => {
  const auth = verifyAuthorization(
    input.authorization, process.env.INC2_SUPERVISOR_PUBLIC_KEY ?? "", ctx.session.id,
  );
  if (!auth || !selectGrant(auth, input)) return DENIED;
  return executeAuthorized(auth, await ctx.getSandbox(), input);
});
