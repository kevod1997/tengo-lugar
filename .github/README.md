# GitHub Automation Setup

This directory contains automated workflows for dependency management and code reviews.

## 📦 Dependabot Configuration

### What it does
- **Automatic dependency updates** every Monday at 9 AM (Argentina time)
- **Smart grouping** of related dependencies (Radix UI, AWS SDK, React ecosystem, etc.)
- **Ignores major updates** for critical packages (Next.js, Tailwind, Prisma, Zod, etc.)
- **Maximum 10 open PRs** at a time to avoid overwhelming you

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

## 🤖 Automated Code Reviews

### 1. Dependabot Auto-Review
**Workflow:** [`.github/workflows/dependabot-auto-review.yml`](./workflows/dependabot-auto-review.yml)

**Triggers:** Automatically on every Dependabot PR

**Features:**
- 📊 **Risk assessment** (Low/Medium/High based on update type)
- 🏷️ **Auto-labels** PRs (major-update, minor-update, patch-update, dev-dependency)
- ✅ **Review checklist** customized for update type
- ⚠️ **Critical package alerts** for important dependencies
- 🚀 **Auto-merge recommendations** for safe updates (patch dev dependencies)

**Example output:**
```
## 🔧 Dependabot Auto-Review

### Package: `@radix-ui/react-dialog`
Update: 1.1.2 → 1.1.15 (patch)
Type: Production Dependency
Risk Level: LOW RISK - Bug fixes only

### 📋 Review Checklist
- [ ] All CI/CD checks pass
- [ ] Reviewed CHANGELOG
- [ ] Ran `npm run build` locally
- [ ] Ran `npm run lint` locally
```

### 2. Gemini Code Assist (On-Demand)
**Workflow:** [`.github/workflows/gemini-code-assist.yml`](./workflows/gemini-code-assist.yml)

**Triggers:** Comment `/gemini review` on any PR

**Features:**
- 📝 **Comprehensive checklist** based on CLAUDE.md guidelines
- 🔒 **Security verification** (auth, validation, error handling)
- ⚡ **Performance checks** (Prisma queries, caching, React Query)
- 🎨 **Code style validation** (ESLint, TypeScript strict mode)
- 🏗️ **Architecture patterns** (Server Actions, Services, Background jobs)

**How to use:**
1. Open any Pull Request
2. Comment: `/gemini review`
3. Wait for the bot to analyze and post a detailed review

**Note:** Currently provides a detailed checklist. To enable AI-powered reviews:
1. Get an API key from:
   - [Google AI Studio](https://aistudio.google.com/) (Gemini)
   - [OpenAI](https://platform.openai.com/) (GPT-4)
   - [Anthropic](https://console.anthropic.com/) (Claude)
2. Add to GitHub Secrets: `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`
3. Modify the workflow to call the API

## 🚀 Quick Start

### Testing with the Current PR

The PR #16 (`bump @vitejs/plugin-react-swc from 3.11.0 to 4.1.0`) is currently open.

1. **See auto-review in action:**
   - Push your changes to enable the workflows
   - The Dependabot Auto-Review will trigger automatically
   - Check the PR for the automated comment and labels

2. **Test Gemini Code Assist:**
   - Go to PR #16
   - Comment: `/gemini review`
   - See the detailed checklist appear

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
| **dependabot-auto-review.yml** | Dependabot PRs | Automatic risk assessment & checklist |
| **gemini-code-assist.yml** | `/gemini review` comment | On-demand detailed review |

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
