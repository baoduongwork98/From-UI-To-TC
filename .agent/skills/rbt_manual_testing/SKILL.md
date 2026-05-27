---
name: RBT Manual Testing
description: Skill for generating manual test cases with 2 modes — QUICK (fast generation from requirements) and FULL RBT (6-step AI-RBT process with risk assessment). Master skill for all manual test case tasks.
---

# RBT Manual Testing

## Description

This is the **Master Skill** for all manual test case generation tasks. The skill provides **2 operating modes** to fit any scale of requirements:

| Mode | When to Use | Time |
|------|-------------|-----------|
| **QUICK** | Simple modules, fast TC needed, clear requirements | Single pass (no user wait) |
| **FULL RBT** | Complex modules, risk analysis needed, large systems | 6 sequential steps (with checkpoints) |

**Core Principles:**
- **Human Strategy:** Humans define strategy, risk level, and standards
- **AI Execution:** AI performs analysis, writes TCs, and identifies gaps
- **Human Verification:** Humans review results before finalizing

---

## When to Use

Use this skill when:

- Generating manual test cases from requirements / user stories
- Analyzing requirements to detect ambiguities
- Decomposing systems into modules / features
- Building traceability matrices
- Applying Risk-Based Testing (risk assessment for test cases)
- Standardizing test cases into Markdown tables (Jira/Excel format)
- Quick test case generation from simple requirements

**Do NOT** use this skill when:

- Automation code generation is needed → use `qa_automation_engineer`
- DOM inspection / locator generation is needed → use `ui_debug_agent` / `smart_locator_agent`
- Only test data generation is needed → use `test_data_generator`

---

## Mode Routing — How to Choose a Mode

The agent automatically selects a mode based on **trigger keywords** and **context**:

### → Mode QUICK

Triggered when:
- User invokes workflow `/generate_testcases_from_requirements`
- User says: "quick test cases", "create TCs from this requirement", "write test cases for form..."
- Requirements are clear, small scope (1 module / 1 feature)
- User does not request risk analysis or formal process

### → Mode FULL RBT

Triggered when:
- User invokes workflow `/generate_manual_testcases_rbt`
- User says: "6-step process", "RBT analysis", "full test cases", "comprehensive TC set"
- Large scope (multiple modules, complex system)
- User requires Traceability Matrix or Risk Level assessment
- Requirements are unclear, need Ambiguity analysis

### → When Unclear

If the mode cannot be determined, the agent **asks the user**:
```
Which mode do you want for test case generation?
1. QUICK — Fast generation from requirements (no analysis steps)
2. FULL RBT — Complete 6-step process (analysis → decomposition → RBT → TC generation)
```

---

# Mode 1: QUICK — Fast Test Case Generation

## Purpose

Generate test cases **quickly with sufficient quality** from clear requirements/user stories, suitable for simple modules or when immediate results are needed.

## Process (Single Pass)

**The agent must:**

1. **Read and understand the requirements** provided
2. **Identify key flows:**
   - Happy Path (main flow)
   - Negative Path (wrong/missing data)
   - Boundary Cases (boundary values)
3. **Apply test case design techniques** automatically:
   - **Equivalence Partitioning (EP):** Divide inputs into equivalent groups
   - **Boundary Value Analysis (BVA):** Test values at boundaries
   - **Decision Table:** List condition combinations (when multiple rules exist)
   - **State Transition:** Test state changes (when workflow exists)
4. **Generate test cases** with all required fields:
   - TC ID (format: `[PROJECT]_[MODULE]_TC_[NUMBER]`)
   - Module
   - Test Case Title / Test Scenario
   - Pre-conditions
   - Test Steps (numbered)
   - Expected Results (corresponding numbers)
   - Test Data (**must be specific**, no placeholders)
   - Priority (Critical / High / Medium / Low)
5. **Output in standard Markdown table** ready to copy to Excel/Jira

## Output Table

```
| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```

## Test Data Rules (applies to both modes)

```
❌ Wrong: "Enter a valid code"
✅ Right: "Enter code: KH-2026-0012"

❌ Wrong: "Enter a valid email"
✅ Right: "Enter email: test_khachhang_01@domain.com"

❌ Wrong: "Enter a value exceeding the limit"
✅ Right: "Enter 256 characters in the Name field (max: 255)"
```

## Anti-Patterns (Mode QUICK)

- ❌ Generic / placeholder test data
- ❌ Only Happy Path, missing Negative/Boundary
- ❌ Ignoring validation rules in requirements
- ❌ Vague Test Steps ("enter data" → must specify what to enter, where)

---

# Mode 2: FULL RBT — 6-Step AI-RBT Process

## Purpose

Formal, sequential process for complex modules. Includes Ambiguity analysis, system decomposition, Traceability Matrix, Risk Level assessment, and detailed test case generation.

> ⚠️ **IMPORTANT:** This process **MUST run sequentially** step by step. Do NOT combine multiple steps into one. Each step must be completed and confirmed by the user before proceeding.

> [!NOTE]
> **2 separate usage flows:**
> - **Antigravity flow (slash command):** Agent follows general instructions below. Agent does NOT need to read prompt.txt files.
> - **Copy-Paste flow (ChatGPT/Claude):** QA team copies detailed prompt content from `plans/manual/01-06/prompt.txt` into AI chat, one step at a time.

### Step 1: Context & Role-play (Context Initialization)

**Purpose:** Set up the Senior QA Engineer role and load project context.

**The agent must:**
1. Request the user to provide:
   - Project / feature name
   - Current system description
   - MVP testing objectives
   - Requirements documents (Requirements, User Stories, Figma links, PDFs...)
2. Read documents carefully and confirm understanding
3. Summarize the testing scope
4. **Wait for user confirmation** before proceeding to Step 2

**Output:** Context understanding confirmation + testing scope summary.

---

### Step 2: Analysis & Q&A (Requirements Analysis)

**Purpose:** Analyze documents to detect ambiguities, gaps, and contradictions.

**The agent must:**
1. Identify flows:
   - Happy Path (main flow)
   - Alternate Paths (branch flows)
   - Exception Paths (exception flows)
2. Detect Ambiguities:
   - Missing requirements (textbox length unspecified, timeout, connection loss behavior...)
   - Contradictory requirements
   - Unclear requirements
3. Ask numbered Q&A questions (Q1, Q2...) for user/PO/BA to answer, each with context and assumption if unanswered
4. **STOP — Wait for user to answer** questions before continuing

**Output:** Flow list + Ambiguities + Q&A questions.

> [!IMPORTANT]
> **This is the most critical checkpoint.** If the agent skips this step and guesses logic, test cases will be seriously wrong. The agent MUST stop and wait for user feedback.

---

### Step 3: Decomposition (System Decomposition)

**Purpose:** Break down complex features into small, manageable Modules / Sub-modules.

**The agent must:**
1. Decompose using one of two approaches:
   - **By UI:** Header, Data Table, Form popup, Sidebar...
   - **By flow:** Create flow, Edit flow, Delete flow...
2. Briefly describe the function of each Module
3. Identify Dependencies between Modules

**Output:** Module/Sub-module list + Dependencies.

---

### Step 4: Traceability (Coverage Assurance)

**Purpose:** Establish a traceability matrix to ensure 100% requirements are covered by test scenarios.

**The agent must:**
1. Map each Module/Rule to a Requirement code (REQ-01, REQ-02...)
2. Cross-check for any requirements missing from the decomposition list (Gap Analysis)
3. List High-Level Test Scenarios for each Module, focusing on:
   - Security / permissions
   - UI Validation
   - Business Logic
   - Data Integrity
   - Error Handling
4. **Wait for user review** of the scenario list before generating detailed test cases

**Output:** Traceability Matrix + High-Level Test Scenarios.

> [!WARNING]
> **Human Checkpoint:** User must review the scenario list to add edge cases that AI may miss. This is the risk assessment step performed by humans.

---

### Step 5: RBT & TC Generation (Detailed Test Case Generation)

**Purpose:** Generate detailed test cases following the Risk-Based Testing strategy.

**The agent must:**
1. Assess Risk Level for each Module:
   - **High Risk:** Thorough testing, many cases (critical business logic, finance-related, security)
   - **Medium Risk:** Moderate testing
   - **Low Risk:** Basic testing, happy path
2. Generate test cases with all required fields:
   - Module / Sub-module
   - Test Case Title
   - Pre-conditions
   - Test Steps (numbered)
   - Expected Results (corresponding numbers)
   - Test Data (**must be specific**, no generic placeholders)
   - Priority
3. Diverse coverage:
   - Happy Path
   - Negative Path (boundary values, character overflow)
   - Edge Cases (timeout, connection loss...)
4. Apply appropriate **test case design techniques**:
   - **Equivalence Partitioning:** Divide inputs into equivalent groups, test one representative per group
   - **Boundary Value Analysis (BVA):** Test at boundaries (min, min+1, max-1, max)
   - **Decision Table:** List condition → result combinations (for multi-condition logic)
   - **State Transition:** Test valid + invalid state transitions (for workflows)
5. If scenarios are too many → generate module by module, ask user to continue

**Output:** Detailed Test Case list with Risk Levels.

---

### Step 6: Template Mapping (Format Standardization)

**Purpose:** Package test cases into a standard Markdown table, ready to copy to Excel/Jira.

**The agent must:**
1. Standardize all test cases into Markdown table:

```
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data |
```

2. Table rules:
   - TC ID follows consistent format (e.g.: `CRM_CUST_TC_001`)
   - Test Steps and Expected Results are numbered, use `<br>` for line breaks within cells
   - **NEVER omit** any test case generated in Step 5
   - If too long → split into Part 1, Part 2... and ask user to continue
3. Output as Artifact (`test_cases_<module>.md`)

**Output:** Complete Markdown Test Cases table.

---

## Anti-Patterns (STRICTLY FORBIDDEN — applies to both modes)

- ❌ Combining multiple steps into one in FULL RBT (MUST be sequential)
- ❌ Guessing business logic without asking user (Step 2 - FULL RBT)
- ❌ Skipping the Ambiguity analysis step (FULL RBT)
- ❌ Generic / placeholder test data
- ❌ Abbreviating or omitting test cases when mapping to table
- ❌ Generating all test cases at once for large systems (must go module by module)
- ❌ Only Happy Path, missing Negative/Boundary cases (QUICK)
- ❌ Vague Test Steps without specifying input data

---

## Prompt Templates

Sample prompt templates for the FULL RBT process are located at:

```
plans/manual/
├── 01_context_and_roleplay/prompt.txt
├── 02_analysis_and_qna/prompt.txt
├── 03_decomposition/prompt.txt
├── 04_traceability/prompt.txt
├── 05_rbt_and_tc_generation/prompt.txt
└── 06_template_mapping/prompt.txt
```

The agent should read the corresponding prompt template **before** executing each step (FULL RBT mode).

Mode QUICK does not require reading prompt templates — the agent applies EP/BVA/Decision Table techniques directly.

---

## Output Format

### Mode QUICK

| Output | Description |
|--------|--------|
| Markdown TC Table | Complete Test Cases, ready to copy to Excel/Jira |

### Mode FULL RBT

| Step | Output |
|------|--------|
| 1 | Context confirmation |
| 2 | Flows + Ambiguities + Q&A questions |
| 3 | Module Decomposition + Dependencies |
| 4 | Traceability Matrix + High-Level Scenarios |
| 5 | Detailed Test Cases (Risk Level + Test Data) |
| 6 | Standard Markdown table (Jira/Excel ready) |

All output must be in **Vietnamese** (matching the application language), format **Markdown**, using **Artifact** for long content.
