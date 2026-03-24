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
     │              │          │                  │          │  ◆ incidents │
     │              │          │                  │          │  ◆ observe   │
     │              │          │                  │          │  ◆ api       │
     │              │          │                  │          │  ◆ database  │
     │              │          │                  │          │  ◆ ADRs      │
     │              │          │                  │          │  ◆ debt      │
     │              │          │                  │          │  ◆ staff     │
     └──────────────┘          └──────────────────┘          └──────────────┘
      YOU + AI                  Protocol Layer                 Standards DB
```

---

## 🛠️ Tools

| Tool | Description |
|------|-------------|
| `get_standard` | Retrieve a specific engineering standard (14 available — see Standards Included below) |
| `review_branch_name` | Check if a branch name follows conventions |
| `review_commit_message` | Check if a commit message follows conventions |
| `staff_engineer_review` | Get the staff engineer thinking checklist for a given phase of work |

---

## 📚 Standards Included

### General

| Standard | Key | Covers |
|----------|-----|--------|
| **Git Conventions** | `git` | Branch naming, commits, rebase workflow, commit hygiene |
| **Code Review** | `code_review` | Tone, structure, what to look for, giving and receiving feedback |
| **PR Standards** | `pr` | Size, description, pre-merge checklist, hotfix protocol |
| **Staff Engineer Checklist** | `staff_engineer` | Thinking prompts for each phase of work |

### Rails

| Standard | Key | Covers |
|----------|-----|--------|
| **Rails Standards** | `rails` | Architecture, security, performance, migrations, Hotwire, deployment |
| **Testing Philosophy** | `testing` | Rails/RSpec strategy, FactoryBot, system specs, N+1 detection, CI integration |

### Frontend

| Standard | Key | Covers |
|----------|-----|--------|
| **Frontend Standards** | `frontend` | TypeScript, components, accessibility, state management, performance, testing, security |

### Operations

| Standard | Key |Covers |
|----------|-----|-------|
| **Deployment Standards** | `deployment` | Three-phase migration strategy, strong_migrations, zero-downtime deploys, rollback strategy |
| **Incident Response** | `incident_response` | Severity levels, incident commander, postmortems, on-call, game days |
| **Observability** | `observability` | Structured logging, metrics (RED/USE), alerting, SLIs/SLOs, dashboards, tracing |

### Architecture

| Standard | Key | Covers |
|----------|-----|--------|
| **API Design** | `api_design` | REST conventions, versioning, error format, pagination, idempotency |
| **Database Design** | `database_design` | PostgreSQL/Rails, indexing, constraints, partitioning, connection management |
| **Architecture Decision Records** | `architecture_decisions` | ADR template, when to write them, lifecycle, ADR vs RFC |
| **Technical Debt** | `technical_debt` | Classification, severity, when to pay it down, prevention, metrics |

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
git clone https://github.com/rajgurung/claude-engineering-standards.git
cd claude-engineering-standards
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
- Call `get_standard("api_design")` before building or modifying API endpoints
- Call `get_standard("database_design")` before schema changes
- Call `get_standard("deployment")` before any migration or deploy work

### Before committing
- Call `review_branch_name` to validate your branch name
- Call `review_commit_message` to validate your commit message

### Before opening a PR
- Call `staff_engineer_review` with phase `before_pr`
- Call `get_standard("code_review")` for review expectations

### During incidents
- Call `get_standard("incident_response")` for severity levels and response protocol
- Call `get_standard("observability")` for debugging and monitoring guidance

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
├── deployment-standards.md      ← Safe deploys, migrations, rollback strategy
├── incident-response.md         ← Severity levels, postmortems, on-call
├── observability.md             ← Logging, metrics, alerting, SLIs/SLOs
├── api-design.md                ← REST conventions, versioning, error format
├── database-design.md           ← PostgreSQL/Rails, indexing, partitioning
├── architecture-decisions.md    ← ADR template and lifecycle
└── technical-debt.md            ← Classification, prioritisation, prevention
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
