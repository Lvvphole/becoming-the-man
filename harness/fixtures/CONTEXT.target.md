# INC-1 Shadow CONTEXT Target

This file is a non-authoritative routing fixture. Root `CONTEXT.md` remains the active repository router.

SHADOW_ROUTING_TABLE_BEGIN

```json
{
  "version": 1,
  "path_routes": [
    {
      "id": "harness",
      "exact": [],
      "prefixes": ["harness/"],
      "sources": ["inc1-contract"],
      "checks": ["harness-lint", "harness-typecheck", "harness-test"]
    },
    {
      "id": "harness-src",
      "exact": [],
      "prefixes": ["harness/src/"],
      "sources": ["inc1-contract"],
      "checks": ["harness-lint", "harness-typecheck", "harness-test"]
    },
    {
      "id": "workflow",
      "exact": [".github/workflows/pr-verification.yml"],
      "prefixes": [],
      "sources": ["inc1-contract"],
      "checks": ["harness-lint", "harness-typecheck", "harness-test"]
    }
  ],
  "requirements": [
    {
      "id": "INC1_ROUTING",
      "source": "inc1-contract",
      "selector": "Section 13",
      "checks": ["harness-test"]
    }
  ],
  "sources": [
    {
      "id": "inc1-contract",
      "path": "stages/03_contract/output/implementation-contract.md"
    }
  ],
  "checks": [
    {
      "id": "harness-lint",
      "argv": ["npx", "eslint", "harness/src/routing.ts", "harness/tests/routing.test.ts"]
    },
    {
      "id": "harness-typecheck",
      "argv": ["npm", "--prefix", "harness", "run", "typecheck"]
    },
    {
      "id": "harness-test",
      "argv": ["npm", "--prefix", "harness", "run", "test"]
    }
  ],
  "protected_paths": ["CLAUDE.md", "AGENTS.md", "CONTEXT.md"]
}
```

SHADOW_ROUTING_TABLE_END
