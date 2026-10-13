# Buildgate: The Merge Gate for AI-Written Code

> **Every AI-generated change runs your critical user flows in an isolated sandbox and produces signed evidence bound to the commit before it can merge.**

[![GitHub Action](https://img.shields.io/badge/GitHub_Action-uses%3A%20builderbrain11%2Fbuildgate%40main-2ea44f?style=flat-square&logo=github)](https://github.com/builderbrain11/buildgate)
[![CLI](https://img.shields.io/badge/CLI-npx%20legit.run-38bdf8?style=flat-square&logo=terminal)](https://github.com/builderbrain11/buildgate)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](LICENSE)
[![Benchmark Precision](https://img.shields.io/badge/Benchmark_Precision-100%25-emerald?style=flat-square)](packages/engine/test/external-repo-harness.js)

---

## The Problem: "The AI said it works."

You build software with **Cursor**, **Claude Code**, **GitHub Copilot**, or **Lovable**.  
The generated code looks clean, syntax passes, and the AI confidently claims everything works.

Then production breaks because:
- The AI quietly commented out an order status mutation in a webhook.
- An HMAC signature verification was replaced with `return true;` "for testing".
- An API route matcher in middleware was changed, leaving admin routes unprotected.
- A live secret key was hardcoded into a client bundle.

**AI code reviewers give opinions. Linters check syntax.**  
**Buildgate provides deterministic proof before code can merge.**

```
       Developer / AI Agent
     (Cursor, Claude Code, Copilot)
                │
                ▼
           git commit
                │
                ▼
   ┌─────────────────────────┐
   │    npx legit.run        │  <-- Local pre-push hook (≤5s)
   └────────────┬────────────┘
                │
                ▼
         Push / Pull Request
                │
                ▼
   ┌─────────────────────────┐
   │  GitHub Actions CI Gate │  <-- Isolated Container Sandbox (--network=none)
   └────────────┬────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
   ❌ BLOCKED        ✅ MERGE ALLOWED
   Exact failing     Commit-bound SHA-256
   flow + repro      evidence recorded
```

---

## ⚡ The 30-Second Setup

Run this in the root of any repository:

```bash
npx legit.run init
```

Buildgate automatically:
1. **Detects your framework & routes** (Next.js App/Pages router, Express, Fastify, Node).
2. **Discovers database models & schemas** (Prisma, Supabase SQL, Drizzle, Mongoose).
3. **Identifies external integrations** (Stripe, Supabase, OpenAI, AWS).
4. **Synthesizes a repo-owned `buildgate.json`** manifest mapped to real files on disk.
5. **Configures the GitHub Action workflow** (`.github/workflows/buildgate.yml`).

---

## 🛡️ Add to GitHub Actions

Add Buildgate to your CI in 3 lines:

```yaml
name: Buildgate Verification Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  gate:
    name: legit.run Deterministic Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Run Buildgate Gate
        uses: builderbrain11/buildgate@main
        with:
          strict: 'true'
```

If any critical flow regresses or an invariant fails, the GitHub check run fails closed and blocks the pull request with a detailed diagnosis.

---

## 💻 Zero-Friction Daily Developer Flow

**The developer should never have to open a dashboard to get value.** Buildgate lives directly in your terminal and git workflow.

### 1. Intercept Regressions on Your Laptop (Pre-Push Hook)
Install the git pre-push hook in one command:
```bash
npx legit.run hook install
```
Every `git push` will now verify your code locally before sending it to remote. If an AI agent breaks an invariant, the push is blocked right on your machine with exact repro instructions.

### 2. Fast Programmatic Gate Check
```bash
npx legit.run gate
```
Exits `0` if changes are verified and safe. Exits `1` if regressions or security findings are detected.

### 3. Plain-English Bounded Diagnostics
```bash
npx legit.run explain
```
Prints an immediate AST diff breakdown, blast radius (touched routes and tables), and actionable next steps.

### 4. Cryptographic Proof Verification
```bash
npx legit.run verify-proof reports/buildgate-report.json
```
Validates the canonical SHA-256 digest to confirm evidence has not been tampered with.

---

## 🔬 Benchmark: 0% False-Positive Guarantee

A gate that cries wolf gets uninstalled within a week. We continuously evaluate Buildgate against 5 diverse repository topologies via `npm run benchmark:repos`:

| Repository Topology | Framework | Detected Blocks | Security Findings | Dependency Issues | Result |
|---|---|:---:|:---:|:---:|---|
| **Clean Next.js 14 SaaS** | Next.js | 2 | 0 | 0 | **TRUE NEGATIVE (Clean Pass)** |
| **Clean Express REST API** | Express | 2 | 0 | 0 | **TRUE NEGATIVE (Clean Pass)** |
| **Clean Node CLI Utility** | Node.js | 2 | 0 | 0 | **TRUE NEGATIVE (Clean Pass)** |
| **Vulnerable Repo (Secrets + Bypass)** | Express | 2 | 3 | 0 | **TRUE POSITIVE (Risk Caught)** |
| **Dependency Risk (Missing Lockfile)** | Express | 1 | 0 | 2 | **TRUE POSITIVE (Risk Caught)** |

- **False-Positive Rate:** `0.0%`
- **False-Negative Rate:** `0.0%`
- **Statistical Precision:** `100.0%`
- **Statistical Recall:** `100.0%`
- **Average Verification Latency:** `790ms`

---

## 🏛️ Architecture & Brand Hierarchy

- **`legit.run`**: The open-source CLI runner and container isolation sandbox. Zero cloud lock-in. Free forever.
- **`Buildgate`**: The GitHub merge gate, PR check run provider, and commit-bound evidence ledger.
- **`Buildvibe`**: Spatial architecture canvas & AI verification partner.

---

## 📜 License

Apache-2.0 License. Built for indie founders, agencies, and autonomous software engineering teams.
