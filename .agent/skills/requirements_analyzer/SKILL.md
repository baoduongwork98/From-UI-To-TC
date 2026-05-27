---
name: requirements_analyzer
description: Skill for analyzing web pages/modules and generating standardized Requirements Documents / User Stories.
---

# Requirements Analyzer Skill

This skill provides detailed instructions for the AI agent to convert a web UI or DOM/HTML structure into clear, detailed Requirements Documents — directly usable by QA, Testers, and Developers.

## 1. Core Objectives
- Build requirements documents grounded in the actual running system.
- Ensure consistency and comprehensive coverage for both Happy Path and Edge Cases.
- Output in a professional format (using Artifact structure).

## 2. Information Extraction Process
When asked to create Requirements from a web page:
1. **Layout Analysis:** Identify Header, Footer, Sidebar, and Main Content sections.
2. **Collect Forms & Inputs:**
   - Find all input fields (`input`, `select`, `textarea`).
   - Record attributes: `type` (text, email, password, number), `required`, `maxlength`, `minlength`, `pattern`.
3. **Collect Interactive Elements (Buttons/Links/Actions):**
   - Identify the function of each button (Save, Submit, Cancel, Delete, Edit).
   - Alerts, toasts, and validation messages that appear on error interaction.
4. **Extract Workflows:**
   - Dependencies between components (e.g., Submit button only enabled when a "I agree" checkbox is checked).

## 3. Output Format (Requirements Document Structure)
Output must be formatted in professional Markdown or saved as an Artifact (`requirements_spec.md`).

**Required sections:**

### 3.1. Overview
Brief description of the feature and purpose of the web page/module.

### 3.2. Functional Requirements
Broken into **User Stories** or **Use Cases**:
- **Feature name** (e.g., Login Feature)
- **Description:** "As a user, I want to... so that I can..."
- **Acceptance Criteria:** Clearly state the conditions that must be satisfied.

### 3.3. Field Specifications
The core section for Automation Testers:
* Use Markdown Tables to list:
  - Field Name (Label)
  - Type (UI Type)
  - Validation Rules (Required / Default / Length limits).
  - Notes.

### 3.4. Business Rules & Validations
List all expected validation messages when the user enters invalid data.

## 4. Strict Rules
- Always write output in **Vietnamese** (language of the application being tested).
- Do not infer complex business requirements without UI evidence. If logic is missing, list them under "Questions / Clarifications for PO-User".
- If Playwright MCP is available, prefer opening a real browser to screenshot/capture the interface.
