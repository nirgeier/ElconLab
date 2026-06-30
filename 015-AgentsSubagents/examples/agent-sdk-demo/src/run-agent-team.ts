import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const prompt = [
    "You are an orchestrator.",
    "Use subagents researcher, implementer, reviewer in sequence.",
    "Task: In this demo folder, create TODO.md with three bullet points for an internal CRM rollout plan.",
    "Then ask reviewer to verify clarity and risks.",
    "Return a final summary with changed files and risks."
  ].join(" ");

  for await (const msg of query({
    prompt,
    options: {
      cwd: process.cwd(),
      permissionMode: "default",
      allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "Task"]
    }
  })) {
    if (msg.type === "result") {
      console.log("\n=== FINAL RESULT ===\n");
      console.log(msg.result);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
