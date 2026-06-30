# 09 · AI Automations: LLM Nodes & Agents

> How n8n turns large language models into workflow building blocks - chat models, an agent that can call tools, memory, and vector stores for retrieval.

---

## n8n AI building blocks

- n8n ships a dedicated set of LangChain-based nodes ("Advanced AI") for working with LLMs inside workflows
- The centerpiece is the AI Agent node, which reasons over a prompt and decides which connected tools to call
- Chat model nodes provide the actual LLM; the agent stays provider-agnostic and plugs into whichever model you attach
- Sub-nodes (model, memory, tool, output parser) connect to a root node via dedicated input ports, not the normal data wire
- A simpler alternative is the Basic LLM Chain node for one-shot prompt-to-completion calls with no tool use

---

## Chat model nodes and providers

- Each provider has its own chat model node that you attach to the agent's "Chat Model" input
- Available providers include OpenAI, Anthropic, Google Gemini, Azure OpenAI, AWS Bedrock, Groq, Mistral Cloud, and Ollama for local models
- The Anthropic Chat Model node lets you select Claude models (the Sonnet, Opus, and Haiku families) as the agent's reasoning engine
- Credentials are stored once per provider in n8n's credential store and reused across nodes
- You can swap providers by changing only the attached model node - the rest of the workflow stays the same

```yaml
# Anthropic Chat Model node - typical settings
credential: "Anthropic account"
model: "claude-sonnet-4-5"
options:
  temperature: 0.2
  maxTokensToSample: 1024
```

---

## The AI Agent node

- Implements a tool-calling loop: the model reads the input, optionally calls tools, observes results, and repeats until it can answer
- You set a system prompt to define the agent's role, constraints, and tone
- The "Tool Agent" type relies on the model's native function/tool-calling support, which is the recommended default
- It exposes input ports for a Chat Model, Memory, Tools, and an optional Output Parser
- Input text usually comes from a Chat Trigger, a webhook, or any upstream node field referenced with an expression

```
[Chat Trigger] --> [AI Agent] --> [Respond]
                        |  |  |
              Chat Model |  |  Tool(s)
                      Memory
```

---

## Giving the agent tools

- Tools are sub-nodes the agent may invoke; each tool's name and description tell the model when to use it
- Built-in tool nodes include Calculator, HTTP Request Tool, Code Tool, Wikipedia, SerpAPI, and the Vector Store retriever
- Any other n8n workflow can become a tool via the "Call n8n Workflow Tool" node, letting the agent trigger sub-workflows
- MCP client tools let the agent reach external Model Context Protocol servers
- Write clear, specific tool descriptions - the model picks tools based on that text, so vague descriptions cause wrong calls

```json
{
  "name": "get_order_status",
  "description": "Look up the shipping status of an order by its numeric order ID.",
  "inputSchema": { "orderId": "string" }
}
```

---

## Memory

- By default the agent is stateless - each execution starts fresh with no recollection of prior turns
- Attach a memory sub-node to persist conversation history across messages in a chat session
- Options include Simple Memory (in-memory window buffer), Postgres Chat Memory, Redis Chat Memory, and MongoDB Chat Memory
- A session key groups messages into a conversation; use a stable identifier (such as a user or chat ID) so turns stay linked
- Window-based memory keeps only the last N exchanges to control token cost; external stores survive restarts

---

## Vector stores and retrieval (RAG)

- Vector stores hold embeddings so the agent can retrieve relevant chunks instead of stuffing everything into the prompt
- Supported stores include the in-memory store, Pinecone, Qdrant, Supabase, PGVector, and Weaviate
- An Embeddings node (for example OpenAI or Cohere embeddings) converts text into vectors on both insert and query
- Typical RAG setup: one workflow ingests and embeds documents; another queries the store and feeds results to the agent
- Attach the Vector Store as a retriever tool so the agent decides when to search the knowledge base

```yaml
# Retrieval flow
ingest:  Document -> Text Splitter -> Embeddings -> Vector Store (insert)
query:   Question -> Embeddings -> Vector Store (search) -> AI Agent context
```

---

## Building a simple AI agent workflow

- Start with a Chat Trigger so you can test in the built-in chat panel
- Add an AI Agent node and connect a Chat Model (for example the Anthropic Chat Model with a Claude model)
- Attach Simple Memory keyed on the chat session so multi-turn conversation works
- Add one or two tools, such as the Calculator and an HTTP Request Tool, with precise descriptions
- Write a focused system prompt, then run the chat and inspect each node's execution data to see tool calls
- Once it behaves, swap the Chat Trigger for a Webhook or schedule to run it unattended

```
System prompt:
"You are a support assistant. Use the order-status tool for any
question about shipping. If you are unsure, say so - do not guess."
```

---

## Practical tips and gotchas

- Lower temperature for tool-heavy or factual agents; reserve higher values for creative drafting
- Cap tokens and memory window size to keep cost predictable, especially on chat-triggered agents
- Use "Pin Data" and the execution view to debug exactly which tool the agent chose and what it received
- Handle errors with the Output Parser or an Error Trigger workflow so a bad model response does not break the run
- Keep secrets in credentials, never in prompts; remember every external tool call may expose data to that provider
- Test tools in isolation first - if a tool node fails on its own, the agent cannot use it either

---

## Key takeaways

- The AI Agent node is the hub; chat model, memory, tools, and vector store attach to it as sub-nodes
- Providers are swappable, including the Anthropic Chat Model for running Claude models as the agent's brain
- Tools turn an LLM into an actor - clear names and descriptions drive correct tool selection
- Add memory for multi-turn chat and a vector store for retrieval-augmented answers over your own data
- Start simple with a Chat Trigger, verify behavior in the execution view, then promote to a webhook or schedule for production
