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

```
     ┌──────────────┐          ┌──────────────────┐          ┌──────────────┐
     │              │  query   │                  │  read    │  ◆ git       │
     │  Claude Code ├─────────►│  MCP Server      ├─────────►│  ◆ reviews   │
     │  / Desktop   │          │  (this thing)    │          │  ◆ PRs       │
     │              │◄─────────┤                  │◄─────────┤  ◆ testing   │
     │              │ response │                  │ standard │  ◆ rails     │
     │              │          │                  │          │  ◆ staff     │
     └──────────────┘          └──────────────────┘          └──────────────┘
      YOU + AI                  Protocol Layer                 Standards DB
```

## 🛠️ Tools

- 📖 **`get_standard`** — Retrieve a specific engineering standard (git, code_review, pr, staff_engineer, testing, rails)
- 🔍 **`review_branch_name`** — Check if a branch name follows conventions
- ✍️ **`review_commit_message`** — Check if a commit message follows conventions
- 🧠 **`staff_engineer_review`** — Get the staff engineer thinking checklist for a given phase of work

## 📚 Standards Included

### General

- **Git Conventions** — branch naming, commits, rebase workflow, commit hygiene
- **Code Review** — tone, structure, what to look for, giving and receiving feedback
- **PR Standards** — size, description, pre-merge checklist, hotfix protocol
- **Staff Engineer Checklist** — thinking prompts for each phase of work

### Rails

- **Rails Standards** — architecture, security, performance, migrations, Hotwire, deployment
- **Testing Philosophy** — Rails/RSpec testing strategy, FactoryBot, system specs, N+1 detection, CI integration

## 🤖 Companion Agents

These standards are designed to work alongside specialized Claude Code subagents from [awesome-claude-code-subagents](https://github.com/rajgurung/awesome-claude-code-subagents). The MCP provides the *what* (your team's standards), the agents provide the *how* (code generation and implementation).

| Agent | Role | Link |
|-------|------|------|
| **rails-expert** | Rails 7.x/8.x implementation, version-aware patterns, Hotwire, deployment | [rails-expert.md](https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/02-language-specialists/rails-expert.md) |
| **frontend-developer** | React, Vue, Angular — TypeScript, accessibility, component architecture | [frontend-developer.md](https://github.com/rajgurung/awesome-claude-code-subagents/blob/main/categories/01-core-development/frontend-developer.md) |

> When the MCP returns a standard, it includes a reference to the relevant agent. Claude Code can then delegate implementation to that agent automatically.

## ⚙️ Setup

### Install

```bash
git clone https://github.com/yourusername/engineering-standards-mcp.git
cd engineering-standards-mcp
npm install
npm run build
```

### Register with Claude Code

Add to your Claude Code MCP settings (`~/.claude/.mcp.json` or project-level):

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

### Register with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

## 🎨 Customising

The standards are plain markdown files in `src/standards/`. Edit them to match your team's conventions, then rebuild:

```
src/standards/
├── git-conventions.md           ← branch naming, commits
├── code-review.md               ← review tone & structure
├── pr-standards.md              ← PR size, checklists
├── staff-engineer-checklist.md  ← thinking prompts
├── testing-philosophy.md        ← test strategy (Rails/RSpec)
└── rails-standards.md           ← Rails conventions + rails-expert agent
```

```bash
npm run build
```

## 🧑‍💻 Development

```bash
npm run dev    # Watch mode — recompiles on change
npm run build  # One-off build
npm start      # Run the server
```

## 📄 License

MIT
