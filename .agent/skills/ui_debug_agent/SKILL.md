---
name: UI Debug Agent
description: Skill for inspecting web/mobile applications via browser tools, analyzing DOM elements, identifying stable locators, debugging UI automation failures, and supporting Page Object class generation.
---

# UI Debug Agent

## Description

Specialized skill for inspecting web/mobile applications directly in a real browser, analyzing the DOM, collecting stable locators, and debugging UI automation issues.

The agent can:

- Open a real browser, navigate to any URL
- Inspect DOM elements — identify attributes, hierarchy, state
- Collect stable locators for Playwright, Selenium, Appium
- Debug automation failures (element not found, click intercepted, timeout)
- Capture UI state (snapshot, screenshot) for analysis
- Analyze dynamic content, iframes, shadow DOM, SPA navigation

---

## When to Use

Use this skill when:

- Need to **explore the UI** of a new web page/module
- Need to **find a locator** for a specific element
- Need to **debug** test automation failure due to UI changes
- Need to **verify** a locator works on the actual DOM
- Need to **analyze DOM** to understand UI structure (forms, tables, modals)
- Need to **capture evidence** (screenshot) for test reports

Trigger keywords: "inspect UI", "find locator", "debug element", "open browser", "check DOM"

---

## MCP Command Sequence (REQUIRED)

When using Playwright MCP to debug UI, **ALWAYS** follow this order:

```
1. browser_navigate(url)           → Open page
2. browser_resize(1920, 1080)      → Desktop viewport
3. browser_wait_for(text/time)     → Wait for page load
4. browser_snapshot()              → Collect DOM (for analysis + locator finding)
5. browser_click/type/hover(ref)   → Interact (if needed)
6. browser_take_screenshot()       → Capture image (evidence on failure or milestone)
```

### Key Rules:

| Rule | Detail |
|---|---|
| **Do NOT re-navigate** if already on the right page | Avoid unintended reloads |
| **ALWAYS resize** immediately after navigate | `browser_resize(1920, 1080)` — ensures desktop viewport |
| **ALWAYS wait** before snapshot | Wait for page to finish loading |
| **Use snapshot for analysis** | Snapshot returns accessibility tree — fast, accurate, with `ref` for interaction |
| **Use screenshot for reporting** | Screenshot is an image — use when visual evidence is needed |

---

## Snapshot vs Screenshot

| | `browser_snapshot` | `browser_take_screenshot` |
|---|---|---|
| **Returns** | Accessibility tree (text + ref IDs) | Image (PNG/JPEG) |
| **Purpose** | Analyze DOM, find locators, identify elements | Visual evidence, reports, layout debugging |
| **When to use** | ⭐ Always use before interacting | Only on failure or important milestones |
| **Has ref for interaction** | ✅ Yes — use ref to click/type/hover | ❌ No — image only |
| **Speed** | Fast | Slower |

**Rule:** Prefer `snapshot` for analysis, use `screenshot` for evidence.

---

## UI Inspection Process

### 1. Open & Prepare the Page

```
browser_navigate → target URL
browser_resize → 1920 × 1080
browser_wait_for → wait for page load indicator (text or time)
```

If the page requires login:
- Ask user for credentials OR use project fixture
- **DO NOT read `.env` directly** (security rule)

### 2. Collect DOM Structure

```
browser_snapshot → accessibility tree
```

From snapshot, identify:
- **Key elements:** buttons, inputs, links, headings, tables
- **Important attributes:** role, name, label, placeholder, testid
- **Hierarchy:** parent → child relationships
- **State:** visible, enabled, disabled, checked, expanded

### 3. Identify Locators

For each element needing a locator, apply the **priority order** by framework:

**Playwright:**

| Priority | Locator | Example | When to Use |
|---|---|---|---|
| 1 ⭐ | `getByRole()` | `getByRole('button', {name: 'Submit'})` | Element has clear role + accessible name |
| 2 | `getByLabel()` | `getByLabel('Email')` | Form input with label |
| 3 | `getByPlaceholder()` | `getByPlaceholder('Enter email')` | Input with placeholder, no label |
| 4 | `getByText()` | `getByText('Welcome back')` | Unique text content |
| 5 | `getByTestId()` | `getByTestId('submit-btn')` | Element with data-testid attribute |
| 6 | CSS | `page.locator('.submit-button')` | No semantic option fits |
| 7 | XPath | `page.locator('//div[@class="x"]')` | Last resort — avoid |

**Selenium:**

| Priority | Locator | Example |
|---|---|---|
| 1 ⭐ | `By.id()` | `By.id("email")` |
| 2 | `By.cssSelector("[data-testid]")` | `By.cssSelector("[data-testid='submit']")` |
| 3 | `By.name()` | `By.name("username")` |
| 4 | `By.cssSelector()` | `By.cssSelector(".login-form button")` |
| 5 | `By.xpath()` | `By.xpath("//button[text()='Login']")` |

**Appium (Mobile):**

| Priority | Locator | Example |
|---|---|---|
| 1 ⭐ | Accessibility ID | `MobileBy.accessibilityId("loginButton")` |
| 2 | ID (resource-id) | `MobileBy.id("com.app:id/login_btn")` |
| 3 | Name | `MobileBy.name("Login")` |
| 4 | XPath (relative) | `MobileBy.xpath("//android.widget.Button[@text='Login']")` |

### 4. Verify Locator

After identifying a locator, **always verify** on the real DOM:

```
browser_snapshot → find element by ref
browser_click/type(ref) → attempt interaction
browser_snapshot → confirm result
```

**Accepted locators must:**
- [ ] Be unique on page (match only 1 element)
- [ ] Be stable across multiple reloads
- [ ] Not contain dynamic classes (css-xxx, sc-xxx, MuiXxx-root)
- [ ] Not contain positional xpath (//div[3]/button[2])
- [ ] Not depend on auto-generated attributes

---

## Handling Special Cases

### Page Requires Login
- Use project login fixture or ask user for credentials
- **DO NOT read .env directly**
- After login, navigate to the page to inspect

### Modal / Dialog / Popup
- Modals are typically overlays on top of the main page
- `browser_snapshot` will show modal content in the accessibility tree
- Interact with modal elements using refs from snapshot
- Wait for modal animation to complete before interacting

### Iframe
- `browser_snapshot` may not show iframe content
- Use `browser_evaluate` to access iframe:
  ```javascript
  () => document.querySelector('iframe').contentDocument.body.innerHTML
  ```
- Or use Playwright frame locator: `page.frameLocator('#iframe-id')`

### Shadow DOM
- Playwright `locator()` automatically pierces shadow DOM
- Selenium requires `shadowRoot.findElement()`
- `browser_snapshot` may show shadow DOM content depending on MCP version

### Dynamic Content (SPA / AJAX)
- Wait for content with `browser_wait_for(text)` before snapshot
- If content loads lazily → scroll down first, then snapshot
- If content changes over time → take multiple snapshots

### Tables / Lists (many repeating elements)
- Identify locator pattern for row/cell
- Use `nth()` or `filter()` to target specific element
- Playwright example: `page.getByRole('row').filter({hasText: 'John'}).getByRole('button', {name: 'Edit'})`

### Obscured Elements (Overlay / Toast)
- Check z-index, opacity, visibility in DOM
- Wait for overlay to disappear: `browser_wait_for(textGone: 'Loading...')`
- If toast notification blocks button → wait for toast timeout

---

## Anti-Patterns (FORBIDDEN)

| ❌ Wrong | ✅ Right | Reason |
|---|---|---|
| Guess locator from feature name | Inspect real DOM then get locator | 100% accurate locator |
| Use screenshot to select locator | Use snapshot (accessibility tree) | Snapshot has refs, screenshot does not |
| Copy locator from old code without verifying | Always verify locator on current browser | DOM may have changed |
| Use dynamic class `.css-1abc` | Use role/label/testid | Dynamic class changes every build |
| Use positional xpath `//div[3]` | Use relative xpath or CSS | Positional xpath breaks easily |
| Take screenshots continuously | Only screenshot on failure or milestone | Wastes resources, slows down |
| Re-navigate when already on the right page | Only navigate when URL needs to change | Avoid unnecessary reloads |

---

## Output

This skill can return:

- **Locator recommendations** — primary + fallback table for each element
- **DOM analysis** — element structure, attributes, state, hierarchy
- **Page Object suggestions** — class structure for the inspected page
- **Screenshots** — visual evidence at milestones
- **Debug findings** — root cause of element not found / click fail + fix

---

## Rules References

The agent MUST follow the detailed rules in:

- `.agent/rules/locator_strategy.md` — Master locator priority map
- `.agent/rules/playwright_rules.md` — Playwright browser setup and locator rules
- `.agent/rules/selenium_rules.md` — Selenium locator and wait rules
- `.agent/rules/appium_rules.md` — Appium mobile locator rules
- `.agent/rules/automation_rules.md` — General automation best practices
