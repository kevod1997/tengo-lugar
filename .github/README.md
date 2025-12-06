# GitHub Automation Setup

This directory contains intelligent automated workflows for dependency management and AI-powered code reviews.

## 🎯 Overview: Smart Dependency Management

Our system uses **risk-based automation** to handle dependency updates intelligently:

- **🟢 Low Risk** (patch dev deps) → **Auto-merged** when build passes
- **🟡 Medium Risk** (minor updates) → **AI review** + manual decision
- **🔴 High Risk** (major updates) → **Converted to Issues** for planning

**Result:** ~70% time savings, cleaner PR list, safer updates.

---

## 📦 Dependabot Configuration

### What it does
- **Automatic dependency updates** every Monday at 9 AM (Argentina time)
- **Smart grouping** of related dependencies (Radix UI, AWS SDK, React ecosystem, etc.)
- **Blocks major updates** for critical packages (converted to issues instead)
- **Maximum 10 open PRs** at a time (major updates don't count - they become issues)

### Configuration File
[`.github/dependabot.yml`](./dependabot.yml)

### Protected Packages (Major updates blocked)
These require manual review and migration planning:
- `next` - Framework updates need careful migration
- `tailwindcss` - v4 is a complete rewrite
- `prisma` / `@prisma/client` - Database migration required
- `zod` - Schema changes affect entire codebase
- `better-auth` - Security critical
- `react` / `react-dom` - Framework updates

### Allowed Auto-Updates
- ✅ **Minor & Patch** updates for all dependencies
- ✅ **Grouped updates** for related packages (Radix UI components together)
- ✅ **Dev dependencies** updates (linters, types, etc.)

## 🤖 Automated Workflows

### 1. Dependabot Auto-Review (Basic Assessment)
**Workflow:** [`.github/workflows/dependabot-auto-review.yml`](./workflows/dependabot-auto-review.yml)

**Triggers:** Automatically on every Dependabot PR

**Features:**
- 📊 **Risk assessment** (Low/Medium/High based on update type)
- 🏷️ **Auto-labels** PRs (major-update, minor-update, patch-update, dev-dependency)
- ✅ **Review checklist** customized for update type
- ⚠️ **Critical package alerts** for important dependencies

---

### 2. Dependabot Smart Review (Intelligent Routing) ⭐ NEW
**Workflow:** [`.github/workflows/dependabot-smart-review.yml`](./workflows/dependabot-smart-review.yml)

**Triggers:** Automatically on every Dependabot PR

**Intelligent Actions Based on Risk:**

#### 🟢 LOW RISK (patch + dev dep)
- Adds comment: "Safe to auto-merge"
- Eligible for automatic merging (see workflow #4)
- Example: `eslint 8.1.0 → 8.1.1`

#### 🟡 MEDIUM RISK (minor or patch prod)
- **Auto-triggers `/gemini review`** (no manual comment needed!)
- AI analyzes the changes
- You decide based on AI feedback
- Example: `@radix-ui/dialog 1.1.0 → 1.2.0`

#### 🔴 HIGH RISK (major updates)
- **Creates GitHub Issue** with migration checklist
- **Closes the PR** (keeps PR list clean)
- Adds links to changelog and breaking changes
- You plan upgrade in issue when ready
- Example: `next 15.0.0 → 16.0.0` → Issue #X created

**Why Issues for Major Updates?**
- ✅ No PR limit clutter
- ✅ Better planning and discussion
- ✅ Can assign to team members
- ✅ Add to milestones (Q1 2026 Migrations)
- ✅ No accidental merges

---

### 3. Gemini AI Code Review (Enhanced) ⭐ NEW
**Workflow:** [`.github/workflows/gemini-code-assist.yml`](./workflows/gemini-code-assist.yml)

**Triggers:**
- Comment `/gemini review` on any PR (manual)
- **Auto-triggered** by Smart Review for MEDIUM risk PRs

**Features:**
- 🤖 **Real AI analysis** (Gemini 1.5 Flash)
- 🔒 **Security verification** (auth, validation, error handling)
- ⚡ **Performance checks** (Prisma queries, caching, React Query)
- 🎨 **Code style validation** (ESLint, TypeScript strict mode)
- 🏗️ **Architecture patterns** based on CLAUDE.md

**Setup (Required for AI):**
1. Get free API key from [Google AI Studio](https://aistudio.google.com/)
2. Add to GitHub Secrets: `GEMINI_API_KEY`
3. That's it! AI reviews will start working automatically

**Fallback:** If no API key, shows detailed checklist instead.

---

### 4. Dependabot Auto-Merge (Safe Automation) ⭐ NEW
**Workflow:** [`.github/workflows/dependabot-auto-merge.yml`](./workflows/dependabot-auto-merge.yml)

**Triggers:** When all checks pass on LOW risk PRs

**Safety Requirements:**
- ✅ PATCH update only (x.x.1 → x.x.2)
- ✅ Development dependency only
- ✅ All CI/CD checks pass (Vercel build)
- ✅ Not a critical package
- ✅ No merge conflicts

**How it works:**
1. Smart Review marks PR as LOW risk
2. Auto-Merge waits for all checks to pass
3. Approves and merges automatically
4. Posts summary comment

**Override:** Add label `skip-auto-merge` to prevent automatic merging.

**Rollback:** `git revert <sha>` (commit SHA provided in merge comment)

## 🚀 Quick Start

### Setup in 2 Minutes

1. **Enable AI reviews (optional but recommended):**
   ```bash
   # Get free API key from https://aistudio.google.com/
   # Add to: Settings → Secrets and variables → Actions → New repository secret
   # Name: GEMINI_API_KEY
   # Value: <your-api-key>
   ```

2. **Enable auto-merge (required for workflow #4):**
   - Go to: Settings → General → Pull Requests
   - ✅ Check "Allow auto-merge"
   - Go to: Settings → Actions → General → Workflow permissions
   - ✅ Select "Read and write permissions"
   - ✅ Check "Allow GitHub Actions to create and approve pull requests"

3. **Done!** Next Monday at 9 AM, automation starts.

### What to Expect

**Monday 9 AM:**
- Dependabot scans for updates
- Creates PRs (max 10)
- Workflows analyze each PR:
  - 🟢 Low risk → Auto-merged in ~3 min
  - 🟡 Medium risk → AI review posted
  - 🔴 High risk → Issue created, PR closed

**Your Weekly Action (estimated 4-6 min):**
- Review 2-3 MEDIUM risk PRs with AI analysis
- Merge based on AI recommendations
- LOW risk already merged ✅
- HIGH risk tracked in issues (review when ready)

### Manual Dependency Updates

```bash
# Check for updates
npx npm-check-updates

# Update only minor/patch (safe)
npx npm-check-updates -u --target minor
npm install

# Update specific package
npx npm-check-updates -u --filter "react"
npm install

# Interactive mode
npx npm-check-updates -i
```

## 📋 Workflow Summary

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **dependabot-auto-review.yml** | Dependabot PRs (auto) | Basic risk assessment & checklist |
| **dependabot-smart-review.yml** ⭐ | Dependabot PRs (auto) | Intelligent routing: auto-merge, AI review, or issue creation |
| **gemini-code-assist.yml** ⭐ | `/gemini review` or auto-trigger | Real AI-powered code review |
| **dependabot-auto-merge.yml** ⭐ | Checks pass (auto) | Safe automatic merging of low-risk updates |

## 🔧 Customization

### Add more protected packages
Edit [`.github/dependabot.yml`](./dependabot.yml), add to `ignore` section:

```yaml
ignore:
  - dependency-name: "your-package"
    update-types: ["version-update:semver-major"]
```

### Change review schedule
Edit [`.github/dependabot.yml`](./dependabot.yml):

```yaml
schedule:
  interval: "weekly"  # or "daily", "monthly"
  day: "monday"       # any day
  time: "09:00"       # any time
```

### Enable AI-powered reviews
See [Gemini Code Assist section](#2-gemini-code-assist-on-demand) above.

## 🐛 Troubleshooting

### Dependabot not creating PRs
- Check [Dependabot settings](../../settings/security_and_analysis)
- Ensure Dependabot is enabled for the repository
- Check the configuration syntax is valid

### Workflows not running
- Ensure workflows are committed to the `main` branch
- Check [Actions tab](../../actions) for errors
- Verify permissions in workflow files

### PR not getting auto-reviewed
- Check that the actor is `dependabot[bot]`
- Verify the workflow file is on the default branch
- Check [Actions tab](../../actions) for execution logs

## 📚 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Project development guidelines
- [Code Style](../docs/agent/standards/code-style.md) - Style enforcement rules
- [Troubleshooting](../docs/agent/operations/troubleshooting.md) - Common issues

## 🎯 Best Practices

1. **Review before merging** - Even with automation, always review changes
2. **Test locally** - Run `npm run build` and `npm run lint` before merging
3. **Check changelogs** - Major updates need careful migration planning
4. **Monitor CI** - Ensure all checks pass before merging
5. **Use `/gemini review`** - For complex PRs or when unsure

---

*🤖 Automated with ❤️ for Tengo Lugar*
