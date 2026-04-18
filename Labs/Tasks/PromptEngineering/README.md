# Prompt Engineering Tasks

- Hands-on prompt engineering exercises covering techniques from basic to advanced.
- Each task includes a clear scenario, helpful hints, and detailed solutions with explanations.
- Practice these tasks to master communicating with AI for business system development.

---

#### Table of Contents

- [01. Zero-Shot Basic Prompt](#01-zero-shot-basic-prompt)
- [02. Zero-Shot with Constraints](#02-zero-shot-with-constraints)
- [03. Few-Shot Classification](#03-few-shot-classification)
- [04. Few-Shot Data Extraction](#04-few-shot-data-extraction)
- [05. System Prompt Definition](#05-system-prompt-definition)
- [06. Chain-of-Thought Reasoning](#06-chain-of-thought-reasoning)
- [07. Structured JSON Output](#07-structured-json-output)
- [08. Multi-Step Instructions](#08-multi-step-instructions)
- [09. Role-Based Prompting](#09-role-based-prompting)
- [10. Prompt for Code Generation](#10-prompt-for-code-generation)
- [11. Prompt for SQL Generation](#11-prompt-for-sql-generation)
- [12. Prompt for Data Analysis](#12-prompt-for-data-analysis)
- [13. Prompt for Document Summarization](#13-prompt-for-document-summarization)
- [14. Prompt for Email Drafting](#14-prompt-for-email-drafting)
- [15. Iterative Refinement](#15-iterative-refinement)
- [16. Negative Prompting (What NOT to do)](#16-negative-prompting-what-not-to-do)
- [17. Template-Based Prompts](#17-template-based-prompts)
- [18. Multi-Turn Conversation Design](#18-multi-turn-conversation-design)
- [19. Prompt for Business Process Modeling](#19-prompt-for-business-process-modeling)
- [20. Meta-Prompting: Prompt that Generates Prompts](#20-meta-prompting-prompt-that-generates-prompts)

---

#### 01. Zero-Shot Basic Prompt

- Write a prompt that asks Claude to generate a list of 10 items an instrumentation company needs to track in its inventory system, with no examples provided.

#### Scenario:

- You need to quickly brainstorm data fields for a new inventory module. Zero-shot prompting lets you get useful results without providing examples.

Hint: Be specific about the domain (instrumentation/control) and the desired output format (numbered list with descriptions).

??? success "Solution"

    **Prompt:**
    ```
    List 10 essential data fields that an instrumentation and control company
    should track for each item in its inventory system. For each field, provide
    the field name, data type, and a one-sentence description of why it matters.
    Format as a numbered list.
    ```

    **Why it works:** The prompt specifies the domain, desired count, output structure (name + type + description), and format. This gives Claude enough context to produce relevant results without examples.

---

#### 02. Zero-Shot with Constraints

- Write a prompt that generates a purchase order summary email, constrained to exactly 3 sentences, professional tone, and must include the PO number, supplier, and total.

#### Scenario:

- Your procurement team sends dozens of PO notifications daily. You need a consistent, concise format that works for every PO.

Hint: Explicitly state each constraint: sentence count, tone, required fields.

??? success "Solution"

    **Prompt:**
    ```
    Write a purchase order notification email body in exactly 3 sentences.
    Use a professional business tone. The email must include:
    - PO Number: PO-2026-0142
    - Supplier: TechSensors Ltd.
    - Total Amount: $12,450.00 USD

    Do not include a greeting or sign-off - only the 3-sentence body.
    ```

    **Why it works:** Each constraint is explicit and measurable. The "Do not include" instruction prevents extras.

---

#### 03. Few-Shot Classification

- Write a prompt with 3 examples that teaches Claude to classify incoming emails into categories: ORDER, SUPPORT, INVOICE, or OTHER.

#### Scenario:

- Elcon receives hundreds of emails daily. Automating classification routes them to the correct department.

Hint: Provide 3 clear examples with input/output pairs, then ask for classification of a new email.

??? success "Solution"

    **Prompt:**
    ```
    Classify the following email into one of these categories:
    ORDER, SUPPORT, INVOICE, OTHER

    Examples:

    Email: "Hi, we'd like to order 50 units of the PT-100 temperature sensor.
    Please send a quote."
    Category: ORDER

    Email: "The pressure transmitter we received last week is showing
    error code E-04. Can you help troubleshoot?"
    Category: SUPPORT

    Email: "Please find attached invoice #INV-2026-089 for the March delivery.
    Payment terms: Net 30."
    Category: INVOICE

    Now classify this email:
    Email: "We need to reorder the calibration kit, part number CK-200.
    Quantity: 5 units. Delivery to our Haifa warehouse."
    Category:
    ```

    **Expected output:** `ORDER`

---

#### 04. Few-Shot Data Extraction

- Write a prompt with 2 examples that teaches Claude to extract structured data (supplier, part number, quantity, delivery date) from free-text purchase requests.

#### Scenario:

- Procurement managers send requests via email in free text. You need to extract structured data for the system.

Hint: Show 2 input/output pairs where the output is a consistent JSON structure.

??? success "Solution"

    **Prompt:**
    ```
    Extract purchase request details from free text into JSON format.

    Example 1:
    Input: "Need 200 temperature probes from SensorTech, model TP-500,
    delivered by end of March"
    Output: {"supplier": "SensorTech", "part_number": "TP-500",
    "quantity": 200, "delivery_date": "2026-03-31"}

    Example 2:
    Input: "Order 50 pressure gauges PG-100 from MechSupply GmbH,
    need them before April 15th"
    Output: {"supplier": "MechSupply GmbH", "part_number": "PG-100",
    "quantity": 50, "delivery_date": "2026-04-15"}

    Now extract from this text:
    Input: "Please arrange 120 flow meters FM-300 from FlowDynamics Inc,
    required delivery by May 20th 2026"
    Output:
    ```

---

#### 05. System Prompt Definition

- Write a system prompt that configures Claude as an Elcon procurement assistant that only answers questions about purchasing, suppliers, and inventory.

#### Scenario:

- You're building an internal chatbot and need to restrict it to procurement-related topics.

Hint: Define the role, allowed topics, and what to do when asked about off-topic subjects.

??? success "Solution"

    **System Prompt:**
    ```
    You are the Elcon Procurement Assistant. You help Elcon employees with:
    - Supplier information and contact details
    - Purchase order status and tracking
    - Inventory levels and reorder points
    - Pricing and quote comparisons
    - Delivery schedules and logistics

    Rules:
    1. Only answer questions related to procurement, suppliers, and inventory.
    2. If asked about unrelated topics, politely redirect:
       "I'm the procurement assistant. For that question, please contact
       the relevant department."
    3. Always be professional and concise.
    4. When providing data, format it in tables when appropriate.
    5. If you don't have specific data, say so clearly rather than guessing.
    ```

---

#### 06. Chain-of-Thought Reasoning

- Write a prompt that asks Claude to calculate the total landed cost of an import order, showing step-by-step reasoning.

#### Scenario:

- Import cost calculations involve multiple steps (unit price × quantity + shipping + customs + insurance). Showing the reasoning ensures accuracy.

Hint: Ask Claude to "think step by step" and show each calculation.

??? success "Solution"

    **Prompt:**
    ```
    Calculate the total landed cost for this import order. Think step by step
    and show all calculations.

    Order details:
    - 500 temperature sensors at $24.50 each (USD)
    - Shipping (FOB): $1,200
    - Insurance: 1.5% of goods value
    - Customs duty: 8% of (goods + shipping + insurance)
    - Port handling: $350 flat fee
    - USD to ILS exchange rate: 3.65

    Show each step, then provide the final total in both USD and ILS.
    ```

    **Why it works:** "Think step by step" activates chain-of-thought reasoning. Listing all inputs prevents Claude from making assumptions.

---

#### 07. Structured JSON Output

- Write a prompt that generates a JSON schema for a supplier record, including validation rules.

#### Scenario:

- You're designing a database and need Claude to output a precise JSON schema that can be used directly in code.

Hint: Specify the exact JSON format, required fields, types, and validation constraints.

??? success "Solution"

    **Prompt:**
    ```
    Generate a JSON object representing a supplier record for an instrumentation
    company. Include these fields with proper types and validation:

    Required: name, email, phone, country, payment_terms
    Optional: website, tax_id, rating (1-5), notes

    Output format:
    {
      "field_name": {
        "type": "string|number|boolean",
        "required": true|false,
        "validation": "description of validation rule",
        "example": "sample value"
      }
    }

    Return ONLY the JSON object, no additional text.
    ```

---

#### 08. Multi-Step Instructions

- Write a prompt that guides Claude through creating a complete purchase order workflow: validate inputs → calculate totals → check budget → generate PO document.

#### Scenario:

- Complex business logic needs to be broken into clear sequential steps for the AI to follow.

Hint: Number each step clearly and specify what the output of each step should be.

??? success "Solution"

    **Prompt:**
    ```
    Create a purchase order by following these steps in order:

    Step 1 - Validate Inputs:
    Check that all required fields are present and valid:
    - Supplier: TechParts Ltd (must be a known supplier)
    - Items: [{part: "TP-100", qty: 50, price: 35.00}]
    - Requester: "David Cohen"
    Report any validation errors. If valid, proceed.

    Step 2 - Calculate Totals:
    For each line item: subtotal = qty × price
    Add 17% VAT
    Show line items table and grand total.

    Step 3 - Budget Check:
    Department budget remaining: $5,000
    If total exceeds budget, flag as "Requires Manager Approval"
    If within budget, mark as "Auto-Approved"

    Step 4 - Generate PO:
    Create a formatted PO document with:
    PO number (format: PO-YYYY-NNNN), date, all details, approval status.

    Execute all 4 steps and show the output of each.
    ```

---

#### 09. Role-Based Prompting

- Write a prompt where Claude acts as a senior database architect reviewing a proposed schema and providing professional feedback.

#### Scenario:

- You want expert-level feedback on your database design before implementation.

Hint: Define the role, their expertise, and the specific task (review + feedback).

??? success "Solution"

    **Prompt:**
    ```
    You are a senior database architect with 15 years of experience in
    PostgreSQL and enterprise ERP systems.

    Review this proposed schema for an inventory management system:

    Table: products
    - id (serial)
    - name (varchar 100)
    - price (float)
    - quantity (int)
    - supplier (varchar 200)
    - created (timestamp)

    Provide your review covering:
    1. Data type issues (suggest better types)
    2. Missing fields for a real-world system
    3. Normalization problems
    4. Index recommendations
    5. Security concerns

    Be direct and specific. Suggest the improved CREATE TABLE statement.
    ```

---

#### 10. Prompt for Code Generation

- Write a prompt that generates a complete TypeScript function for calculating delivery dates based on supplier lead times and holidays.

#### Scenario:

- You need production-ready code, not pseudocode. The prompt must specify language, edge cases, and expected behavior.

Hint: Specify language, function signature, edge cases, and include test examples.

??? success "Solution"

    **Prompt:**
    ```
    Write a TypeScript function called calculateDeliveryDate with this signature:

    function calculateDeliveryDate(
      orderDate: Date,
      leadTimeDays: number,
      holidays: Date[]
    ): Date

    Requirements:
    - Skip weekends (Saturday and Sunday)
    - Skip dates in the holidays array
    - If the result falls on a weekend or holiday, move to the next business day
    - leadTimeDays counts only business days

    Include:
    - JSDoc comment with @param and @returns
    - 3 unit test examples as comments
    - Handle edge case: leadTimeDays = 0 returns next business day
    ```

---

#### 11. Prompt for SQL Generation

- Write a prompt that generates a SQL query to find suppliers with declining order volume over the last 3 quarters.

#### Scenario:

- Management needs analytics on supplier relationships. The query must be correct, performant, and readable.

Hint: Describe the tables, the metric (order volume per quarter), and the condition (declining = each quarter less than previous).

??? success "Solution"

    **Prompt:**
    ```
    Write a PostgreSQL query to find suppliers whose order volume has
    declined for 3 consecutive quarters.

    Tables:
    - suppliers (id, name, email, is_active)
    - purchase_orders (id, supplier_id, order_date, total_value, status)

    Requirements:
    - Calculate total order count per supplier per quarter
    - A supplier is "declining" if Q4 < Q3 < Q2 (each quarter strictly less)
    - Use the last 3 completed quarters relative to CURRENT_DATE
    - Only include active suppliers
    - Return: supplier name, Q2 count, Q3 count, Q4 count, trend percentage
    - Order by steepest decline first

    Add comments explaining each CTE or subquery.
    ```

---

#### 12. Prompt for Data Analysis

- Write a prompt that analyzes a CSV dataset of purchase orders and produces insights with recommendations.

#### Scenario:

- The procurement manager has exported PO data and wants AI-driven insights without writing code.

Hint: Describe the data columns, the type of analysis wanted, and the output format.

??? success "Solution"

    **Prompt:**
    ```
    Analyze this purchase order data and provide business insights.

    Data columns: po_number, supplier, order_date, delivery_date, total_value,
    currency, status (Pending/Delivered/Overdue/Cancelled), category

    Sample data (first 5 rows):
    PO-001, TechSensors, 2026-01-15, 2026-02-01, 12000, USD, Delivered, Sensors
    PO-002, MechSupply, 2026-01-20, 2026-02-15, 8500, EUR, Overdue, Mechanical
    PO-003, TechSensors, 2026-02-01, 2026-02-20, 15000, USD, Delivered, Sensors
    PO-004, FlowDyn, 2026-02-10, 2026-03-01, 6200, USD, Pending, Flow
    PO-005, MechSupply, 2026-02-15, 2026-03-10, 9100, EUR, Overdue, Mechanical

    Provide:
    1. Summary statistics (total orders, total value, avg order size)
    2. Supplier reliability analysis (on-time vs overdue rates)
    3. Category spending breakdown
    4. Top 3 concerns or risks identified
    5. 3 actionable recommendations

    Format with tables where appropriate.
    ```

---

#### 13. Prompt for Document Summarization

- Write a prompt that summarizes a long technical specification document into a one-page executive summary.

#### Scenario:

- Engineering sends 20-page specs. Management needs a one-page summary highlighting key decisions and costs.

Hint: Define the target audience, desired length, and which sections to prioritize.

??? success "Solution"

    **Prompt:**
    ```
    Summarize the following technical specification into a one-page
    executive summary for Elcon's management team.

    Target audience: Non-technical managers who make purchasing decisions
    Maximum length: 300 words

    Must include:
    1. Project purpose (1-2 sentences)
    2. Key technical requirements (bullet points, plain language)
    3. Cost estimate and timeline
    4. Risks and mitigation
    5. Recommendation (approve/revise/reject with reasoning)

    Avoid jargon. Replace technical terms with business-friendly language.

    Document:
    [paste technical specification here]
    ```

---

#### 14. Prompt for Email Drafting

- Write a prompt that generates a professional follow-up email to a supplier about a delayed delivery.

#### Scenario:

- A critical shipment is 2 weeks late. The email must be firm but professional, and request a specific action.

Hint: Specify tone, key facts, desired outcome, and any constraints (no threats, maintain relationship).

??? success "Solution"

    **Prompt:**
    ```
    Draft a professional follow-up email to a supplier about a delayed delivery.

    Facts:
    - PO Number: PO-2026-0089
    - Supplier: GlobalSensors Inc.
    - Original delivery date: March 15, 2026
    - Current status: Not shipped, 14 days overdue
    - Items: 200 pressure transmitters, model PT-4000
    - Impact: Production line delay at customer site

    Tone: Firm but professional. Maintain good relationship.

    The email must:
    1. Reference the PO number and original delivery date
    2. State the business impact clearly
    3. Request a specific response: updated delivery date within 48 hours
    4. Mention that we may need to explore alternative suppliers if unresolved
    5. Offer to discuss any issues on their side

    Keep under 200 words. Include subject line.
    ```

---

#### 15. Iterative Refinement

- Start with a basic prompt, identify weaknesses in the output, then refine the prompt 3 times to improve quality.

#### Scenario:

- Real-world prompt engineering is iterative. This task teaches you to analyze AI output and improve your prompts.

Hint: Write version 1, evaluate the output, identify what's missing or wrong, write version 2, repeat.

??? success "Solution"

    **Version 1 (Basic):**
    ```
    Create a supplier evaluation form.
    ```
    *Problem: Too vague. Output will be generic.*

    **Version 2 (Add context):**
    ```
    Create a supplier evaluation form for an instrumentation and control company.
    Include scoring criteria and rating scale.
    ```
    *Problem: Better, but missing specific criteria and format.*

    **Version 3 (Add specifics):**
    ```
    Create a supplier evaluation form for Elcon, an instrumentation company.

    Categories to evaluate (weight each):
    - Quality (30%): defect rate, certifications, testing procedures
    - Delivery (25%): on-time rate, lead time accuracy, packaging
    - Price (20%): competitiveness, price stability, payment terms
    - Service (15%): responsiveness, technical support, warranty
    - Innovation (10%): new products, customization, R&D investment

    Use a 1-5 rating scale with clear descriptions for each level.
    Output as a formatted table with weighted score calculation.
    ```
    *Result: Specific, structured, actionable output.*

    **Lesson:** Each iteration adds specificity, constraints, and structure.

---

#### 16. Negative Prompting (What NOT to do)

- Write a prompt that includes explicit "do not" instructions to prevent common AI mistakes when generating a database migration.

#### Scenario:

- AI often adds unnecessary complexity. Negative prompting prevents unwanted behavior.

Hint: List specific things the AI should NOT do alongside what it should do.

??? success "Solution"

    **Prompt:**
    ```
    Generate a PostgreSQL migration to add a "lead_score" column to the
    contacts table.

    DO:
    - Use ALTER TABLE with ADD COLUMN
    - Set default value to 0
    - Add a CHECK constraint (0-100)
    - Add a comment on the column
    - Include a rollback (DOWN) migration

    DO NOT:
    - Do not drop and recreate the table
    - Do not add any other columns
    - Do not modify existing columns
    - Do not use ORM syntax (raw SQL only)
    - Do not add indexes unless asked
    - Do not wrap in a transaction (Supabase handles this)
    ```

---

#### 17. Template-Based Prompts

- Create a reusable prompt template with placeholders for generating API endpoint documentation.

#### Scenario:

- You have 20 endpoints to document. A template lets you generate consistent docs by filling in variables.

Hint: Use `{{placeholder}}` syntax and provide instructions for filling them in.

??? success "Solution"

    **Template:**
    ```
    Generate API documentation for the following endpoint:

    Endpoint: {{METHOD}} {{PATH}}
    Description: {{DESCRIPTION}}
    Auth Required: {{AUTH_REQUIRED}}

    Request Parameters:
    {{PARAMETERS}}

    Generate documentation in this format:
    1. Description (one paragraph)
    2. Request (method, URL, headers, body with example)
    3. Response (success example with status code)
    4. Error responses (list common errors)
    5. cURL example
    6. TypeScript fetch example

    Keep examples relevant to an instrumentation company CRM.
    ```

    **Usage example:**
    ```
    Endpoint: POST /api/contacts
    Description: Create a new contact in the CRM
    Auth Required: Yes (Bearer token)
    Parameters: first_name (required), last_name (required),
    email (required), company_id (optional), phone (optional)
    ```

---

#### 18. Multi-Turn Conversation Design

- Design a 4-turn conversation flow where each turn builds on the previous response to create a complete database schema.

#### Scenario:

- Complex tasks work better when broken into a multi-turn conversation rather than one massive prompt.

Hint: Plan what each turn accomplishes and how it references the previous turn's output.

??? success "Solution"

    **Turn 1 - Define entities:**
    ```
    I'm building a CRM for Elcon (instrumentation company).
    List the main entities we need with a 1-sentence description each.
    Just the entity names and descriptions, no schema yet.
    ```

    **Turn 2 - Define relationships:**
    ```
    Good. Now for each entity you listed, define:
    1. The relationships to other entities (1:1, 1:N, N:M)
    2. Draw a simple text-based ER diagram
    ```

    **Turn 3 - Generate schema:**
    ```
    Now generate the CREATE TABLE statements for all entities.
    Include: proper types, foreign keys, indexes, timestamps, soft delete.
    Use UUID for primary keys. Add comments on each table.
    ```

    **Turn 4 - Add security:**
    ```
    Add Row Level Security policies for multi-user access.
    Users should only see records they created or are assigned to.
    Admins see everything. Generate the RLS policy SQL.
    ```

---

#### 19. Prompt for Business Process Modeling

- Write a prompt that generates a complete business process description for Elcon's purchase order approval workflow, including a mermaid diagram.

#### Scenario:

- Before building automation, you need to document the current process. AI can generate both the description and visual diagram.

Hint: Describe the real-world process steps, roles involved, and decision points. Ask for mermaid diagram output.

??? success "Solution"

    **Prompt:**
    ```
    Model Elcon's purchase order approval workflow as a business process.

    Participants:
    - Requester (any employee)
    - Department Manager
    - Procurement Team
    - Finance Director (for orders > $10,000)
    - Supplier

    Rules:
    - Orders < $1,000: auto-approved
    - Orders $1,000 - $10,000: manager approval required
    - Orders > $10,000: manager + finance director approval
    - Rejected orders go back to requester with comments
    - Approved orders are sent to supplier automatically

    Output:
    1. Step-by-step process description (numbered list)
    2. Mermaid flowchart diagram
    3. RACI matrix (who is Responsible, Accountable, Consulted, Informed)
    4. List of automation opportunities
    ```

---

#### 20. Meta-Prompting: Prompt that Generates Prompts

- Write a meta-prompt that generates specialized prompts for any business task at Elcon.

#### Scenario:

- Instead of writing prompts from scratch, you can use a meta-prompt to generate task-specific prompts.

Hint: The meta-prompt should ask for the task type, context, and desired output, then generate an optimized prompt.

??? success "Solution"

    **Meta-Prompt:**
    ```
    You are a prompt engineering expert. Generate an optimized prompt for
    the following task.

    Task type: {{TASK_TYPE}}
    Context: The user works at Elcon, an instrumentation and control company
    in Israel. They use Claude, Supabase, n8n, and Next.js.

    When generating the prompt, apply these techniques:
    1. Add a clear role/persona for Claude
    2. Include specific context about Elcon's domain
    3. Define the exact output format
    4. Add constraints to prevent common mistakes
    5. Include 1-2 examples if the task benefits from few-shot learning
    6. Add a "Do not" section for common pitfalls

    Output the generated prompt inside a code block so the user can copy it.
    Also explain why you made each prompt design choice (brief bullet points).

    Task type: "Generate a weekly procurement status report"
    ```

    **Why it works:** This meta-prompt encodes prompt engineering best practices and applies them automatically to any new task.
