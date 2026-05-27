---
description: End-to-end workflow for generating Requirements + Test Cases + Excel for a module from its URL — based on real testing of the BDP Data Definition module.
skills:
  - requirements_analyzer
  - rbt_manual_testing
  - ui_debug_agent
---

# Workflow: Generate Full Module Test Cases (End-to-End)

> **Purpose:** Generate complete test documentation (Requirements → Test Cases → Excel) for a module from a live URL.
> This workflow is distilled from real testing experience on the BDP Create New Data Definition module.

---

## Input Configuration (TASK Config)

Before starting, read `TASK.md` (if available) or ask the user to provide:

```
MODULE_NAME=<Module name, e.g: Add New Data Definition>
ITEM_TEST_MAIN=<Main group, e.g: Data Definition>
ITEM_TEST_SUB=<Sub group, e.g: Add>
URL=<Module URL to test>
OUTPUT_FOLDER=<Output folder, e.g: output_sonet>
START_NUMBER=<Starting TC ID number, default: 1>
```

**Output file names** (derived from MODULE_NAME, lowercase, spaces → underscores):
- Requirements: `{OUTPUT_FOLDER}/requirements_{module_slug}.md`
- Test Cases MD: `{OUTPUT_FOLDER}/testcases_{module_slug}.md`
- Test Cases XLSX: `{OUTPUT_FOLDER}/testcases_{module_slug}.xlsx`

**Required TC ID format:** `TC - {sequence number}` starting from `START_NUMBER` — e.g.: `TC - 1`, `TC - 2`, `TC - 25`

---

## Step 0: Browser Setup

### 0.1 Check and release browser lock (if needed)

If `Browser is already in use` error occurs:
```bash
# Kill old browser process
pkill -f "mcp-chrome" ; pkill -f "playwright"
# Remove singleton lock
rm -f ~/Library/Caches/ms-playwright/mcp-chrome-*/SingletonLock
```
Then retry navigation.

### 0.2 Start browser in the correct order

Execute in **mandatory sequence:**
```
navigate(URL) → resize(1920×1080) → wait_for_load → snapshot → screenshot
```

> **Note:** Always resize to 1920×1080 immediately after navigate. Never guess locators before taking a snapshot.

---

## Step 1: Collect Requirements from UI

### 1.1 Inspect the list page

- Snapshot the list page → record title, action buttons, filters, pagination
- Save screenshot: `{OUTPUT_FOLDER}/screenshot_list_page.png`

### 1.2 Open the create form

- Click "Add" / "Create" / equivalent button
- If click is blocked by pointer-events, use JavaScript:
  ```javascript
  // Instead of direct click, use evaluate:
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  // Or:
  document.querySelector('selector').click()
  ```
- Snapshot form → save screenshot: `{OUTPUT_FOLDER}/screenshot_01_form_open.png`

### 1.3 Inspect each section of the form

For **each section / tab / accordion** in the form:

1. **Snapshot DOM** — record all fields visible in the default state
2. **Identify required fields** — check for asterisk (`*`) in real DOM, DO NOT assume
   ```javascript
   // Find labels with asterisk
   document.querySelectorAll('.ant-form-item-required, [class*="required"]')
   ```
3. **For Dropdown/Select** — open via JS mousedown/click on `.ant-select-selector`, read options, then **close via JS blur** (DO NOT use `keyboard.press('Escape')` as it will close the entire modal/drawer):
   ```javascript
   // Open dropdown
   const selector = formItem.querySelector('.ant-select-selector');
   selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
   selector.click();

   // Read options (after waiting 1s)
   const opts = document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');

   // Close dropdown — use blur or click form title, DO NOT use Escape
   document.querySelector('.ant-form-item-label')?.click();
   // Or:
   selector.dispatchEvent(new MouseEvent('blur', { bubbles: true }));
   ```
4. **Scroll virtual list** to avoid missing options:
   ```javascript
   // For rc-virtual-list (Ant Design):
   const holder = document.querySelector('.rc-virtual-list-holder')
   if (holder) holder.scrollTop = holder.scrollHeight
   ```
5. **Screenshot** each important section

### 1.4 Explore Conditional UI — MUST be fully executed

> **Core principle:** Each potentially conditional field must be interacted with using **all possible values** to discover hidden fields. Never skip this step.

#### A. Identify Trigger Fields

Field types that commonly cause conditional UI:

| Field Type | How to Detect |
|---|---|
| Checkbox / Toggle / Switch | OFF (default) → ON |
| Dropdown / Select | Each option may render different UI |
| Radio button | Each selection may show/hide fields |
| Tab / Accordion | Each tab may have different content |
| Numeric input | Value > 0 or > N may reveal more fields |

#### B. Exploration Process for Each Trigger Field

For **each trigger field**, execute **each value sequentially**:

```
1. Record current state (snapshot)
2. Interact with new value (click checkbox / select dropdown option)
3. Snapshot again → compare with previous state
4. Record: new fields appeared / fields hidden / fields with changed attributes
5. Screenshot (named by convention: screenshot_{field}_{value}.png)
6. If new field appears → repeat B for that field (check cascading)
7. Return field to default state before moving to next field
```

#### C. Real Example (BDP Data Definition)

```
Dropdown "Loại dữ liệu":
  → Select "String"   → field "Điều kiện: Bằng, Khác, Chứa, Không chứa..." appears
  → Select "Number"   → field "Điều kiện: =, ≠, >, >=, <, <=..." appears
  → Select "Boolean"  → field "Điều kiện: True, False" appears
  → Select "DateTime" → field "Điều kiện: Trước, Sau, Trong khoảng..." appears

Checkbox "Thông số sắp xếp":
  → OFF (default) → no additional fields
  → ON            → "Tên trường sắp xếp", "Chiều sắp xếp" (sub-checkbox) appear
    → "Chiều sắp xếp" ON → "Giá trị mặc định" dropdown (ASC/DESC) appears
```

#### D. Document the Conditional UI Map

After exploration, create a **mapping table** in requirements:

```markdown
### Conditional UI Map

| Trigger Field | Value | Fields Shown | Fields Hidden | Notes |
|---|---|---|---|---|
| Checkbox "Sắp xếp" | ON  | Field Name, Sort Direction | — | — |
| Checkbox "Sắp xếp" | OFF | — | Field Name, Sort Direction | Default state |
| Dropdown "Loại" | String | Condition (text ops) | — | 4 operators |
| Dropdown "Loại" | Number | Condition (number ops) | — | 6 operators |
```

#### E. Required Test Cases from Conditional UI

For **each row** in the Conditional UI Map, there must be at least:
- 1 TC: Trigger → verify new field appears + can be filled
- 1 TC: Untrigger → verify field is hidden + value not submitted
- 1 TC: Fill hidden field → trigger ON → verify data saved correctly

### 1.5 Check validation

- Submit empty form → snapshot error messages → record **exact content** of each message
- Test each field with invalid data (too long, special characters, wrong format)
- Screenshot: `{OUTPUT_FOLDER}/screenshot_04_validation.png`

### 1.6 Write Requirements file

Save to `{OUTPUT_FOLDER}/requirements_{module_slug}.md` with structure:

```markdown
# Requirements: {MODULE_NAME}

## 1. Overview
[Describe module purpose]

## 2. Functional Requirements
| Code | Description |
|---|---|
| US-01 | ... |

## 3. Field Specifications

### 3.1 {Section Name 1}
| Field | Type | Required | Values/Constraints | Notes |
|---|---|---|---|---|

## 4. Processing Flows & Validation
[Describe Happy Path flow + Validation rules]

## 5. Clarification Questions (Ambiguities)
[Unclear points that need confirmation with PO/BA]
```

---

## Step 2: Generate Test Cases

### 2.1 Risk analysis and scope

Based on requirements, classify risks:
- **High:** Required field validation, successful/failed submit, main flows
- **Medium:** Conditional UI, dropdown options, boundary values
- **Low:** UI cosmetic, optional fields, rare edge cases

### 2.2 Define TC groups and Description grouping

| TC Group | Technique | Description Pattern | Example |
|---|---|---|---|
| Negative / Field Validation | EP | `Kiểm tra tính bắt buộc của trường [X]` | One TC per required field |
| Boundary values | BVA | `Kiểm tra giới hạn ký tự trường [X]` | 1 TC per required text field |
| Optional field / dropdown | Verification | `Kiểm tra [field/dropdown]` | Default value, option list |
| Dropdown options count | Verification | `Dropdown [X] — kiểm tra đủ N options` | 1 TC per important dropdown |
| Switch/Toggle | State | `Toggle [X] — bật/tắt [chức năng]` | ON→save, OFF→save |
| Conditional UI — toggle | State Transition | `[Component] — [Parameter Name]` | Merge Description for ON + OFF + cascade TCs |
| Multi-value / multi-config | Dynamic | `Kiểm tra thêm nhiều [X]` | Add, remove each item |
| Delete action | Negative | `Xóa một [cấu hình / thuộc tính]` | Delete → verify no longer shown |
| Cancel / Close | Normal flow | `Kiểm tra nút [Huỷ bỏ]` | Close form, no save |
| Happy Path | Normal flow | `Xác minh luồng chính khi nhập dữ liệu hợp lệ` | Fill all → submit → success |

**TC group priority order (top to bottom in table):**
1. Required field validation — one TC per required field
2. Boundary values — character limits (if max length assumed)
3. Optional fields / default values
4. Dropdown options count
5. Switch/Toggle
6. Conditional UI (each trigger field: ON→fields appear, OFF→fields hidden, cascade)
7. Multi-config / multi-value (add multiple, add Nth config)
8. Delete actions (delete config, delete attribute)
9. Cancel / Close form
10. **Happy Path — always placed last**

**Description grouping rules (for cell merging in Excel):**
- TCs testing the same feature (e.g.: Checkbox Sort ON, OFF, cascade) → **same Description**, only written in the first TC
- TCs testing different fields/dropdowns → **separate Description**

### 2.3 Required output table format

```markdown
| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
| TC - 1 | Định nghĩa dữ liệu | Thêm | Kiểm tra tính bắt buộc của trường [Mã] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Để trống trường [Mã]<br>2. Nhập các trường khác hợp lệ<br>3. Nhấn [Lưu mới] | 3. Hệ thống hiển thị lỗi tại trường dữ liệu: "Mã phải là bắt buộc". |
```

**Column order must not change. Exactly 7 columns — no additions, no removals.**

### 2.4 Test case writing rules

#### TC ID
- Format: `TC - {sequence number}` starting from `START_NUMBER` (default 1)
- Example: `TC - 1`, `TC - 2`, ..., `TC - 25`, `TC - 26`

#### Item Test Main / Sub
- **Main:** High-level feature group — e.g.: `Định nghĩa dữ liệu`, `Khách hàng`
- **Sub:** Specific action — e.g.: `Thêm`, `Sửa`, `Xóa`, `Xem`
- **Merge rule:** If consecutive TCs share the same Main/Sub, **only write in the first TC**, subsequent TCs leave **blank** → script will auto-merge cells in Excel

#### Description
- Brief description of test objective (≤ 80 characters)
- Standard patterns (in Vietnamese, matching app language):
  - `Kiểm tra tính bắt buộc của trường [FieldName]`
  - `Kiểm tra giới hạn ký tự trường [FieldName]`
  - `Dropdown [DropdownName] — kiểm tra đủ N options`
  - `Toggle [ToggleName] — bật/tắt [feature]`
  - `[ComponentName] — [test action]`
- Field names, buttons, UI sections → always wrap in `[brackets]`
- **Merge rule:** If consecutive TCs belong to the same group/feature (e.g.: Sort ON/OFF/cascade all belong to "Sort Parameters"), **only write in the first TC**, subsequent TCs leave **blank**

#### Pre-conditions
- Use sequence numbers: `1. Condition A`
- If multiple conditions: `1. ...\n2. ...\n3. ...` (use `\n` for line breaks within cell)
- **Brevity principle:** Only record the minimum conditions needed to start the test. Do not record obvious or duplicate conditions.
  - ✅ DO: `1. Đang ở form [Thêm mới X]` — sufficient to state form is open
  - ❌ DON'T: `1. Đang ở trang Danh sách X\n2. Form [Thêm mới X] đang mở` — line 2 is redundant
- Record specific state when testing conditional UI: `Checkbox "X" = OFF`, `Switch [Y] = ON`
- When testing validation of a sub-section (e.g.: active sync config), write briefly: `Đã thêm 1 cấu hình đồng bộ chủ động`

#### Step
- Numbered: `1. Action A\n2. Action B\n3. Action C`
- Use `\n` for line breaks within the same cell (do not split into multiple table rows)
- Button/link names: wrap in `[brackets]` — e.g.: `Nhấn [Lưu mới]`, `Click [Thêm thuộc tính]`
- Use `<br>` instead of `\n` in Markdown tables for proper script handling
- **Generic principle:** Use `"Nhập các trường khác hợp lệ"` instead of specific test data when the test targets only 1 field — specific test data makes steps long and hard to maintain.
  - ✅ DO: `1. Để trống trường [Mã]<br>2. Nhập các trường khác hợp lệ<br>3. Nhấn [Lưu mới]`
  - ❌ DON'T: `1. Để trống trường [Mã]<br>2. Nhập [Tên]: "Test Định nghĩa"<br>3. Nhấn [Lưu mới]`
- Only write specific test data when it is the **core** of the TC (e.g.: Happy Path TC, boundary value TC)

#### Expected Results
- Can reference step numbers: `3. Hệ thống hiển thị lỗi...`
- Or overall result: `Hệ thống hiển thị danh sách...`
- Specific description, can include exact error message content in `"double quotes"`
- If multiple results: use `\n` or `<br>` for line breaks
- **Standard validation error pattern:** `N. Hệ thống hiển thị lỗi tại trường dữ liệu: "Error message".`
  - ✅ DO: `3. Hệ thống hiển thị lỗi tại trường dữ liệu: "Mã phải là bắt buộc".`
  - ❌ DON'T: `3. Hệ thống hiển thị lỗi tại trường [Mã]: "Mã phải là bắt buộc". Form không được lưu.`
  - Reason: "tại trường dữ liệu" is the consistent standard pattern; "Form không được lưu" is obvious and need not be stated

### 2.5 Save file

Save to `{OUTPUT_FOLDER}/testcases_{module_slug}.md`

---

## Step 3: Export Excel

Run after the complete MD file is ready:

```bash
node scripts/convert_excel/md_to_xlsx.js \
  {OUTPUT_FOLDER}/testcases_{module_slug}.md \
  {OUTPUT_FOLDER}/testcases_{module_slug}.xlsx
```

Check output log: `Found N tables, total M test cases → Exported M test cases`

---

## Step 4 (Optional): Review & QA

After all 3 output files are ready, perform review:

### 4.1 TC ID Checklist
- [ ] Correct format: `TC - N` (sequential, starting from START_NUMBER)
- [ ] No duplicate sequence numbers
- [ ] Sequential numbering (no gaps)

### 4.2 Markdown Table Format Checklist
- [ ] Exactly 7 columns: `Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results`
- [ ] Main/Sub: only written in the first row, subsequent rows left blank
- [ ] Description: only written in the first TC of a group, subsequent TCs in group left blank
- [ ] Step and Pre-conditions: use `<br>` for line breaks (do not split into multiple table rows)
- [ ] Field/button/section names: always wrapped in `[brackets]`

### 4.3 Coverage Checklist
- [ ] Each required field has at least 1 TC for validation (required)
- [ ] Each required text field has a TC for boundary value (character limit)
- [ ] Each important dropdown has a TC for option list (correct count)
- [ ] Each conditional UI (checkbox/switch) has TCs for both ON and OFF states
- [ ] TC for deleting config / attribute (delete action) is present
- [ ] TC for Cancel / Close form button is present
- [ ] **Happy Path TC is placed last in the table**

### 4.4 Step Quality Checklist
- [ ] Steps describe specific actions (not vague)
- [ ] Expected Results clearly state messages/states
- [ ] Pre-condition records accurate initial state (e.g.: `Checkbox "X" = OFF`)

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Browser lock: `Browser is already in use` | `pkill -f "mcp-chrome"` + remove `SingletonLock` |
| Click blocked (pointer-events) | Use `evaluate` with `element.click()` or `dispatchEvent` |
| Dropdown missing options (virtual scroll) | Scroll `rc-virtual-list-holder` to `scrollHeight` then re-query |
| Stale ref after interaction | Re-snapshot before using new ref |
| Multiple elements with same text/selector | Use JS `querySelectorAll` + filter by index or parent |
| Form does not trigger validation | Submit using the official button, not keyboard shortcut |
| `Escape` closes modal/drawer | **NEVER** use `keyboard.press('Escape')` inside modal — use JS blur or click form title area |
| Dropdown doesn't close after reading options | Use `selector.dispatchEvent(new MouseEvent('blur', { bubbles: true }))` or click another field's label |

---

## Completion Checklist

- [ ] `requirements_{module_slug}.md` — complete sections, validated from real DOM
- [ ] `testcases_{module_slug}.md` — correct format, sufficient coverage, correct TC IDs
- [ ] `testcases_{module_slug}.xlsx` — exported successfully, correct TC count
- [ ] Screenshots saved for reference
- [ ] No important clarification questions left unanswered

---

## Real Example

| Config | Value |
|---|---|
| MODULE_NAME | Thêm mới Định nghĩa dữ liệu |
| ITEM_TEST_MAIN | Định nghĩa dữ liệu |
| ITEM_TEST_SUB | Thêm |
| URL | https://bdp-data-gate-admin.zminiapp.me/data/masters |
| OUTPUT_FOLDER | output_sonet |
| START_NUMBER | 1 |
| TC ID sample | TC - 1, TC - 2, ..., TC - 30 |
| Generated files | requirements_them_moi_dinh_nghia_du_lieu.md, testcases_them_moi_dinh_nghia_du_lieu.md, .xlsx |

### Sample Markdown Table

```markdown
| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
| TC - 1 | Định nghĩa dữ liệu | Thêm | Kiểm tra tính bắt buộc của trường [Mã] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Để trống trường [Mã]<br>2. Nhập các trường khác hợp lệ<br>3. Nhấn [Lưu mới] | 3. Hệ thống hiển thị lỗi tại trường dữ liệu: "Mã phải là bắt buộc". |
| TC - 2 |  |  | Kiểm tra tính bắt buộc của trường [Tên] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Để trống trường [Tên]<br>2. Nhập các trường khác hợp lệ<br>3. Nhấn [Lưu mới] | 3. Hệ thống hiển thị lỗi tại trường dữ liệu: "Tên phải là bắt buộc". |
| TC - 3 |  |  | Kiểm tra giới hạn ký tự trường [Mã] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Nhập chuỗi ký tự dài hơn giới hạn vào trường [Mã] | Hệ thống không cho phép nhập tiếp hoặc tự động cắt chuỗi tại ký tự giới hạn. |
| TC - 4 |  |  | Dropdown [Method] — kiểm tra đủ 5 options | Card config đồng bộ chủ động đang hiển thị | 1. Mở dropdown [Method] | Dropdown hiển thị đúng 5 options: GET, POST, PUT, PATCH, DELETE |
| TC - 5 |  |  | Cấu hình đồng bộ chủ động — Thông số sắp xếp | Checkbox "Thông số sắp xếp" = OFF | 1. Click checkbox [Thông số sắp xếp] để bật ON | Sub-section "Sắp xếp theo" xuất hiện với các field: Tham số kết nối, Tham số, Giá trị |
| TC - 6 |  |  |  | Checkbox "Thông số sắp xếp" = ON | 1. Click checkbox [Thông số sắp xếp] để tắt OFF | Sub-section "Sắp xếp theo" và toàn bộ fields bị ẩn |
| TC - 7 |  |  | Xóa một cấu hình | Đã thêm ít nhất 1 cấu hình đồng bộ chủ động | 1. Click nút xóa (×) trên card config | Card config bị xóa. Không còn hiển thị trong form. |
| TC - 8 |  |  | Kiểm tra nút [Huỷ bỏ] | 1. Đang ở form [Thêm mới Định nghĩa dữ liệu] | 1. Nhập một số thông tin<br>2. Nhấn nút [Huỷ bỏ] | Hệ thống đóng form và quay lại màn hình danh sách. Dữ liệu vừa nhập không được lưu. |
| TC - 9 |  |  | Xác minh luồng chính khi nhập dữ liệu hợp lệ. | 1. Nhập đầy đủ [Mã], [Tên]<br>2. Chọn [Kết nối] | 1. Nhấn nút [Lưu mới] | 1. Hệ thống tạo định nghĩa dữ liệu thành công<br>2. Hiển thị thông báo thành công |
```

> **Important notes:**
> - TC - 5 and TC - 6 belong to the same "Sort Parameters" group → TC - 6 Description is blank → script auto-merges 2 D cells in Excel.
> - **Happy Path (TC - 9) is always placed last** — after all validation, dropdowns, conditional UI.
> - Pre-conditions are 1 line when condition is simple — do not add redundant "Form is open".
> - Steps use "Nhập các trường khác hợp lệ" instead of specific test data (except Happy Path, Boundary).
