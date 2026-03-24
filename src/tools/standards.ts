import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const standardsDir = join(__dirname, "..", "standards");

function readStandard(filename: string): string {
  return readFileSync(join(standardsDir, filename), "utf-8");
}

const STANDARDS: Record<string, string> = {
  git: "git-conventions.md",
  code_review: "code-review.md",
  pr: "pr-standards.md",
  staff_engineer: "staff-engineer-checklist.md",
  testing: "testing-philosophy.md",
  rails: "rails-standards.md",
  frontend: "frontend-standards.md",
  deployment: "deployment-standards.md",
  incident_response: "incident-response.md",
  observability: "observability.md",
  api_design: "api-design.md",
  database_design: "database-design.md",
  architecture_decisions: "architecture-decisions.md",
  technical_debt: "technical-debt.md",
};

export function registerStandardsTools(server: McpServer): void {
  server.registerTool(
    "get_standard",
    {
      title: "Get Engineering Standard",
      description:
        "Retrieve a specific engineering standard. Available standards: git, code_review, pr, staff_engineer, testing, rails, frontend, deployment, incident_response, observability, api_design, database_design, architecture_decisions, technical_debt",
      inputSchema: {
        standard: z
          .enum(["git", "code_review", "pr", "staff_engineer", "testing", "rails", "frontend", "deployment", "incident_response", "observability", "api_design", "database_design", "architecture_decisions", "technical_debt"])
          .describe("The standard to retrieve"),
      },
    },
    async ({ standard }) => {
      const filename = STANDARDS[standard];
      const content = readStandard(filename);
      return {
        content: [{ type: "text" as const, text: content }],
      };
    }
  );

  server.registerTool(
    "review_branch_name",
    {
      title: "Review Branch Name",
      description:
        "Check if a git branch name follows conventions (issue ID prefix, kebab-case)",
      inputSchema: {
        branch_name: z.string().describe("The branch name to review"),
      },
    },
    async ({ branch_name }) => {
      const issues: string[] = [];
      const suggestions: string[] = [];

      const issueIdPattern = /^[A-Z]+-\d+-.+/;
      if (!issueIdPattern.test(branch_name)) {
        issues.push(
          "Missing issue tracker ID prefix. Branch should start with an ID like PROJ-123 or TEAM-456"
        );
      }

      const kebabPattern = /^[A-Z]+-\d+-[a-z0-9]+(-[a-z0-9]+)*$/;
      const idMatch = branch_name.match(/^[A-Z]+-\d+-/);
      if (idMatch) {
        const description = branch_name.slice(idMatch[0].length);
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(description)) {
          issues.push(
            "Description should be kebab-case (lowercase, hyphens only)"
          );
        }
        if (description.split("-").length > 6) {
          suggestions.push(
            "Branch name is quite long — consider a shorter description"
          );
        }
      }

      if (issues.length === 0 && suggestions.length === 0) {
        return {
          content: [{ type: "text" as const, text: `✓ Branch name "${branch_name}" looks good.` }],
        };
      }

      const parts: string[] = [];
      if (issues.length > 0) {
        parts.push(`Issues:\n${issues.map((i) => `- ${i}`).join("\n")}`);
      }
      if (suggestions.length > 0) {
        parts.push(
          `Suggestions:\n${suggestions.map((s) => `- ${s}`).join("\n")}`
        );
      }

      return {
        content: [{ type: "text" as const, text: parts.join("\n\n") }],
      };
    }
  );

  server.registerTool(
    "review_commit_message",
    {
      title: "Review Commit Message",
      description:
        "Check if a commit message follows conventions (imperative mood, subject length, structure)",
      inputSchema: {
        message: z.string().describe("The commit message to review"),
      },
    },
    async ({ message }) => {
      const lines = message.split("\n");
      const subject = lines[0];
      const issues: string[] = [];
      const suggestions: string[] = [];

      if (subject.length > 72) {
        issues.push(
          `Subject line is ${subject.length} characters — max 72`
        );
      }

      if (subject.endsWith(".")) {
        issues.push("Subject line should not end with a period");
      }

      const pastTenseStarts = [
        "fixed",
        "added",
        "updated",
        "removed",
        "changed",
        "implemented",
        "refactored",
        "merged",
      ];
      const firstWord = subject.split(" ")[0].toLowerCase();
      if (pastTenseStarts.includes(firstWord)) {
        issues.push(
          `Use imperative mood: "${firstWord}" → "${firstWord.replace(/ed$/, "").replace(/ged$/, "ge")}" (e.g. "Fix" not "Fixed")`
        );
      }

      if (subject.toLowerCase().startsWith("wip")) {
        issues.push("WIP commits should not be pushed to shared branches");
      }

      if (lines.length > 1 && lines[1].trim() !== "") {
        issues.push(
          "Leave a blank line between the subject and body"
        );
      }

      if (subject.length < 10) {
        suggestions.push(
          "Subject is very short — make sure it conveys the intent of the change"
        );
      }

      const body = lines.slice(2).join("\n").trim();
      if (!body && subject.length < 50) {
        suggestions.push(
          "Consider adding a body explaining why this change was needed"
        );
      }

      if (issues.length === 0 && suggestions.length === 0) {
        return {
          content: [{ type: "text" as const, text: `✓ Commit message looks good.` }],
        };
      }

      const parts: string[] = [];
      if (issues.length > 0) {
        parts.push(`Issues:\n${issues.map((i) => `- ${i}`).join("\n")}`);
      }
      if (suggestions.length > 0) {
        parts.push(
          `Suggestions:\n${suggestions.map((s) => `- ${s}`).join("\n")}`
        );
      }

      return {
        content: [{ type: "text" as const, text: parts.join("\n\n") }],
      };
    }
  );

  server.registerTool(
    "staff_engineer_review",
    {
      title: "Staff Engineer Review",
      description:
        "Run through the staff engineer thinking checklist for a given context (pre-code, pre-pr, post-merge, incident)",
      inputSchema: {
        phase: z
          .enum(["before_coding", "during_implementation", "before_pr", "after_merge", "incident"])
          .describe("The phase of work to get the checklist for"),
        context: z
          .string()
          .optional()
          .describe("Brief description of what you're working on"),
      },
    },
    async ({ phase, context }) => {
      const content = readStandard("staff-engineer-checklist.md");
      const sections = content.split("## ");

      const phaseMap: Record<string, string> = {
        before_coding: "Before Writing Code",
        during_implementation: "During Implementation",
        before_pr: "Before Opening the PR",
        after_merge: "After Merging",
        incident: "Incident Response",
      };

      const sectionTitle = phaseMap[phase];
      const section = sections.find((s) => s.startsWith(sectionTitle));

      if (!section) {
        return {
          content: [{ type: "text" as const, text: "Section not found." }],
        };
      }

      let response = `## ${section}`;
      if (context) {
        response = `Context: ${context}\n\n${response}`;
      }

      return {
        content: [{ type: "text" as const, text: response }],
      };
    }
  );
}
