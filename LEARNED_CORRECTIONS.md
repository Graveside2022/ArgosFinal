# LEARNED_CORRECTIONS - Critical Compliance Failures

## Violation #1: Sequential Execution Instead of Parallel

**Date**: 2025-07-05
**Severity**: CRITICAL
**Rule Violated**: CLAUDE.md Mandatory Parallel Execution

### What Happened:

- User requested security vulnerability fix
- I executed tasks SEQUENTIALLY instead of deploying 5 parallel agents
- This violates the ABSOLUTE BINDING RULE of parallel execution

### Correct Approach:

```
For ANY task:
- Simple tasks: Deploy 5 agents in ONE message
- Complex tasks: Deploy 10 agents in ONE message
- NEVER sequential execution
```

### Root Cause:

- Failed to perform COMPLIANCE CHECK before executing task
- Ignored explicit parallel execution mandate in:
    1. Global CLAUDE.md binding rules
    2. Project CLAUDE.md enforcement
    3. /Parallel_Orchestrator_Prime command parameters

### Correction Applied:

- IMMEDIATE enforcement of parallel execution
- All future tasks MUST deploy appropriate agent count
- NO EXCEPTIONS to this rule

### Prevention:

Before EVERY task:

1. Check task complexity
2. Deploy 5 (simple) or 10 (complex) agents
3. NEVER use sequential execution
4. Document parallel deployment in response
