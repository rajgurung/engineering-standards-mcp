# Engineering Standards MCP Server

A personal MCP (Model Context Protocol) server that encodes engineering standards, git etiquette, code review conventions, and staff-engineer-level thinking into tools your AI assistant can call.

## Why?

Good engineering habits shouldn't live in your head — they should be encoded, shareable, and enforceable. This MCP server gives your AI assistant access to your engineering standards so it can help you follow them consistently.

## Tools

| Tool | Description |
|------|-------------|
| `get_standard` | Retrieve a specific engineering standard (git, code_review, pr, staff_engineer, testing) |
| `review_branch_name` | Check if a branch name follows conventions |
| `review_commit_message` | Check if a commit message follows conventions |
| `staff_engineer_review` | Get the staff engineer thinking checklist for a given phase of work |

## Standards Included

- **Git Conventions** — branch naming, commit messages, rebase workflow, commit hygiene
- **Code Review** — tone, structure, what to look for, giving and receiving feedback
- **PR Standards** — size, description, pre-merge checklist, hotfix protocol
- **Staff Engineer Checklist** — thinking prompts for each phase of work
- **Testing Philosophy** — behaviour over implementation, real objects over mocks, flaky test prevention

## Setup

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

## Customising

The standards are plain markdown files in `src/standards/`. Edit them to match your team's conventions, then rebuild:

```bash
npm run build
```

## Development

```bash
npm run dev    # Watch mode — recompiles on change
npm run build  # One-off build
npm start      # Run the server
```

## License

MIT
