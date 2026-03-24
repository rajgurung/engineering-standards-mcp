```
                ███████╗███╗   ██╗ ██████╗    ███████╗████████╗██████╗ ███████╗
                ██╔════╝████╗  ██║██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝
                █████╗  ██╔██╗ ██║██║  ███╗   ███████╗   ██║   ██║  ██║███████╗
                ██╔══╝  ██║╚██╗██║██║   ██║   ╚════██║   ██║   ██║  ██║╚════██║
                ███████╗██║ ╚████║╚██████╔╝██╗███████║   ██║   ██████╔╝███████║
                ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚═════╝ ╚══════╝

                          ⚡ Engineering Standards MCP Server ⚡

                          Your engineering brain, exported as a protocol.
```

> *Good engineering habits shouldn't live in your head — they should be encoded, shareable, and enforceable.*

---

```
     ┌──────────────┐          ┌──────────────────┐          ┌──────────────┐
     │              │  query   │                  │  read    │  ◆ git       │
     │  Claude Code ├─────────►│  MCP Server      ├─────────►│  ◆ reviews   │
     │  / Desktop   │          │  (this thing)    │          │  ◆ PRs       │
     │              │◄─────────┤                  │◄─────────┤  ◆ testing   │
     │              │ response │                  │ standard │  ◆ rails     │
     │              │          │                  │          │  ◆ frontend  │
     │              │          │                  │          │  ◆ deploy    │
     │              │          │                  │          │  ◆ staff     │
     └──────────────┘          └──────────────────┘          └──────────────┘
      YOU + AI                  Protocol Layer                 Standards DB
```

---

## 🛠️ Tools

| Tool | Description |
|------|-------------|
| `get_standard` | Retrieve a specific engineering standard (`git`, `code_review`, `pr`, `staff_engineer`, `testing`, `rails`, `frontend`, `deployment`) |
| `review_branch_name` | Check if a branch name follows conventions |
| `review_commit_message` | Check if a commit message follows conventions |
| `staff_engineer_review` | Get the staff engineer thinking checklist for a given phase of work |

---

## 📚 Standards Included

### General

| Standard | Covers |
|----------|--------|
| **Git Conventions** | Branch naming, commits, rebase workflow, commit hygiene |
| **Code Review** | Tone, structure, what to look for, giving and receiving feedback |
| **PR Standards** | Size, description, pre-merge checklist, hotfix protocol |
| **Staff Engineer Checklist** | Thinking prompts for each phase of work |

### Rails

| Standard | Covers |
|----------|--------|
| **Rails Standards** | Architecture, security, performance, migrations, Hotwire, deployment |
| **Testing Philosophy** | Rails/RSpec strategy, FactoryBot, system specs, N+1 detection, CI integration |

### Frontend

| Standard | Covers |
|----------|--------|
| **Frontend Standards** | TypeScript, components, accessibility, state management, performance, testing, security |

### Deployment

| Standard | Covers |
|----------|--------|
| **Deployment Standards** | Three-phase migration strategy, strong_migrations, zero-downtime deploys, rollback strategy, pre/post-deploy checklists |

---

## 🤖 Companion Agents

The MCP provides the *what* (your team's standards). These agents provide the *how* (code generation and implementation).

From [awesome-claude-code-subagents](https://github.com/rajgurung/awesome-claude-code-subagents):

| Agent | Role |
|-------|------|
| [**rails-expert**](https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md) | Rails 7.x/8.x implementation, version-aware patterns, Hotwire, deployment |
| [**frontend-developer**](https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/01-core-development/frontend-developer.md) | React, Vue, Angular — TypeScript, accessibility, component architecture |

> When the MCP returns a standard, it includes a reference to the relevant agent. Claude Code can then delegate implementation to that agent automatically.

---

## ⚙️ Setup

### 1. Install

```bash
git clone https://github.com/yourusername/engineering-standards-mcp.git
cd engineering-standards-mcp
npm install
npm run build
```

### 2. Register

Add to your MCP settings file:

| Client | Config file |
|--------|-------------|
| Claude Code | `~/.claude/.mcp.json` (or project-level) |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "engineering-standards": {
      "command": "node",
      "args": ["/absolute/path/to/engineering-standards-mcp/build/index.js"]
    }
  }
}
```

---

## 📋 Wiring It Into Your Projects

Once the MCP is registered, add a `CLAUDE.md` to your project root so Claude Code knows to consult it:

```markdown
## Engineering Standards

This project follows team engineering standards via the engineering-standards MCP server.

### Before writing code
- Call `get_standard("rails")` for architecture and conventions
- Call `get_standard("testing")` for test strategy
- Call `get_standard("deployment")` before any migration or deploy work

### Before committing
- Call `review_branch_name` to validate your branch name
- Call `review_commit_message` to validate your commit message

### Before opening a PR
- Call `staff_engineer_review` with phase `before_pr`
- Call `get_standard("code_review")` for review expectations

### Implementation
- Use the rails-expert agent for Rails code generation
- Use the frontend-developer agent for frontend work
```

> Adapt this to your stack — remove what doesn't apply, add project-specific rules. The `CLAUDE.md` stays small because the standards live in the MCP, not in every repo.

---

## 🎨 Customising

The standards are plain markdown files in `src/standards/`. Edit them to match your team's conventions, then rebuild:

```
src/standards/
├── git-conventions.md           ← branch naming, commits
├── code-review.md               ← review tone & structure
├── pr-standards.md              ← PR size, checklists
├── staff-engineer-checklist.md  ← thinking prompts
├── testing-philosophy.md        ← test strategy (Rails/RSpec)
├── rails-standards.md           ← Rails conventions + rails-expert agent
├── frontend-standards.md        ← Frontend conventions + frontend-developer agent
└── deployment-standards.md      ← Safe deploys, migrations, rollback strategy
```

```bash
npm run build
```

---

## 🧑‍💻 Development

```bash
npm run dev    # Watch mode — recompiles on change
npm run build  # One-off build
npm start      # Run the server
```

---

## 📄 License

MIT
