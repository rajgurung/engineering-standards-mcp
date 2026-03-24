```
                ███████╗███╗   ██╗ ██████╗    ███████╗████████╗██████╗ ███████╗
                ██╔════╝████╗  ██║██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝
                █████╗  ██╔██╗ ██║██║  ███╗   ███████╗   ██║   ██║  ██║███████╗
                ██╔══╝  ██║╚██╗██║██║   ██║   ╚════██║   ██║   ██║  ██║╚════██║
                ███████╗██║ ╚████║╚██████╔╝██╗███████║   ██║   ██████╔╝███████║
                ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚═════╝ ╚══════╝
                
                             // Engineering Standards MCP Server //
                
                          Your engineering brain, exported as a protocol.
```

> *Good engineering habits shouldn't live in your head — they should be encoded, shareable, and enforceable.*

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░ HOW IT WORKS ░░░░░░░░░░░░░░░░░░░░░░    │
└─────────────────────────────────────────────────────────────┘

     ┌──────────────┐          ┌──────────────────┐          ┌──────────────┐
     │              │  query   │                  │  read    │  ◆ git       │
     │  Claude Code ├─────────►│  MCP Server      ├─────────►│  ◆ reviews   │
     │  / Desktop   │          │  (this thing)    │          │  ◆ PRs       │
     │              │◄─────────┤                  │◄─────────┤  ◆ testing   │
     │              │ response │                  │ standard │  ◆ staff     │
     └──────────────┘          └──────────────────┘          └──────────────┘
      YOU + AI                  Protocol Layer                 Standards DB
```

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░ TOOLS ░░░░░░░░░░░░░░░░░░░░░░░░░░    │
└─────────────────────────────────────────────────────────────┘
```

```
  ┌────────────────────────────────────────────────────────┐
  │  📖  get_standard                                      │
  │  ──────────────────────────────────────────────────    │
  │  Retrieve a specific engineering standard.             │
  │  Options: git, code_review, pr, staff_engineer,        │
  │           testing                                      │
  └────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────┐
  │  🔍  review_branch_name                                │
  │  ──────────────────────────────────────────────────    │
  │  Validates branch names follow conventions.            │
  │  Checks: issue ID prefix, kebab-case, length           │
  └────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────┐
  │  ✍️   review_commit_message                            │
  │  ──────────────────────────────────────────────────    │
  │  Validates commit messages follow conventions.         │
  │  Checks: imperative mood, subject ≤72 chars,           │
  │          body structure                                │
  └────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────┐
  │  🧠  staff_engineer_review                             │
  │  ──────────────────────────────────────────────────    │
  │  Staff engineer thinking checklist for any phase.      │
  │  Phases: before_coding, during_implementation,         │
  │          before_pr, after_merge, incident              │
  └────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░ STANDARDS DB ░░░░░░░░░░░░░░░░░░░░░░░    │
└─────────────────────────────────────────────────────────────┘
```

```
  ╔════════════════════╦═══════════════════════════════════════════════════╗
  ║  Standard          ║  What it covers                                   ║
  ╠════════════════════╬═══════════════════════════════════════════════════╣
  ║  Git Conventions   ║  Branch naming, commits, rebase workflow,         ║
  ║                    ║  commit hygiene                                   ║
  ╠════════════════════╬═══════════════════════════════════════════════════╣
  ║  Code Review       ║  Tone, structure, what to look for, giving        ║
  ║                    ║  and receiving feedback                           ║
  ╠════════════════════╬═══════════════════════════════════════════════════╣
  ║  PR Standards      ║  Size, description, pre-merge checklist,          ║
  ║                    ║  hotfix protocol                                  ║
  ╠════════════════════╬═══════════════════════════════════════════════════╣
  ║  Staff Engineer    ║  Thinking prompts for each phase of work          ║
  ╠════════════════════╬═══════════════════════════════════════════════════╣
  ║  Testing           ║  Behaviour over implementation, real objects      ║
  ║                    ║  over mocks, flaky test prevention                ║
  ╚════════════════════╩═══════════════════════════════════════════════════╝
```

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░ SETUP ░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
└─────────────────────────────────────────────────────────────┘
```

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

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░ CUSTOMISING ░░░░░░░░░░░░░░░░░░░░░░░░     │
└─────────────────────────────────────────────────────────────┘
```

The standards are plain markdown files in `src/standards/`. Edit them to match your team's conventions, then rebuild:

```
  src/standards/
  ├── git-conventions.md        ← branch naming, commits
  ├── code-review.md            ← review tone & structure
  ├── pr-standards.md           ← PR size, checklists
  ├── staff-engineer-checklist.md  ← thinking prompts
  └── testing-philosophy.md     ← test strategy
```

```bash
npm run build
```

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░ DEVELOPMENT ░░░░░░░░░░░░░░░░░░░░░░░░     │
└─────────────────────────────────────────────────────────────┘
```

```bash
npm run dev    # Watch mode — recompiles on change
npm run build  # One-off build
npm start      # Run the server
```

```
┌─────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░ LICENSE ░░░░░░░░░░░░░░░░░░░░░░░░░░     │
└─────────────────────────────────────────────────────────────┘
```

MIT

```
╔══════════════════════════════════════════════════════════════╗
║  Built with ♥ and strong opinions about commit messages.     ║
╚══════════════════════════════════════════════════════════════╝
```
