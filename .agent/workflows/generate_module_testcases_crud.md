---
description: End-to-end workflow for generating Test Cases for a complete CRUD module (List + Add + View + Edit + Delete + Secondary Actions). Distilled from real testing experience.
skills:
  - requirements_analyzer
  - rbt_manual_testing
  - ui_debug_agent
---

# Workflow: Generate Full CRUD Module Test Cases

> **Purpose:** Generate complete test cases for a module with standard layout:
> - List screen (search + list + pagination)
> - Add new (form drawer/modal)
> - View detail (read-only drawer)
> - Edit (pre-filled form drawer)
> - Delete (confirm dialog)
> - Secondary actions by status (module-specific)

---

## Input Configuration (TASK Config)

Read `TASK.md` or ask user to provide:

```
MODULE_NAME=<Module name, e.g: Customer Segment>
ITEM_TEST_MAIN=<Main group, e.g: Customer Segment>
URL=<List page URL>
OUTPUT_FOLDER=<Output folder, e.g: output_claude_workflow>
START_NUMBER=<Starting TC ID number, default: 1>
```

**Output file names:**
- Requirements: `{OUTPUT_FOLDER}/requirements_{module_slug}.md`
- Test Cases MD: `{OUTPUT_FOLDER}/testcases_{module_slug}.md`
- Test Cases XLSX: `{OUTPUT_FOLDER}/testcases_{module_slug}.xlsx`

**TC ID format:** `TC - {sequence number}` starting from `START_NUMBER`

---

## Step 0: Browser Setup

```
navigate(URL) → resize(1920×1080) → wait_for_load → snapshot
```

Kill browser lock if needed:
```bash
pkill -f "mcp-chrome" ; rm -f ~/Library/Caches/ms-playwright/mcp-chrome-*/SingletonLock
```

---

## Step 1: Explore the List Page

### 1.1 Take full-page screenshot

Save: `{OUTPUT_FOLDER}/screenshot_list_page.png`

### 1.2 Record Filter/Search

For **each filter field**:
- Field type (text, dropdown, date range, ...)
- Placeholder
- Open dropdown to get option list (if dropdown type)

### 1.3 Record the data table

- Number of columns and column names
- List section heading name
- Is there an "Add" button?

### 1.4 Record Pagination

- Display format: "Showing X to Y of Z records"
- Buttons: previous page, next page, page numbers

### 1.5 Record Action Buttons per row

Use JS to map buttons by SVG icon:

```javascript
const rows = document.querySelectorAll('tbody tr');
rows.forEach(row => {
  const id = row.querySelector('td')?.textContent?.trim();
  const statusCells = Array.from(row.querySelectorAll('td'));
  const btns = row.querySelectorAll('button');
  const btnInfo = Array.from(btns).map((b, i) => ({
    i,
    path: b.querySelector('path')?.getAttribute('d')?.substring(0, 40) || '',
    polyline: b.querySelector('polyline')?.getAttribute('points') || '',
    hasLine: !!b.querySelector('line'),
    hasCircle: !!b.querySelector('circle'),
  }));
  console.log(id, btns.length, 'buttons', JSON.stringify(btnInfo));
});
```

**Common icon identification (Lucide/Feather icons):**

| SVG signature | Icon | Common Function |
|---|---|---|
| `has-line + has-circle` (no path/polyline) | Eye | View detail |
| `polyline "12 6 12 12 16 14" + circle` | Clock | History / Log |
| `path "M17 21v-2a4 4..."` | Users | Member list |
| `path "M11 4H4a2 2 0 0 0-2..."` | Edit/Pencil | Edit |
| `path "M19 6v14..." + polyline "3 6 5 6 21 6"` | Trash | Delete |
| `has-line + has-circle` (in extra btn) | Ban/Circle-slash | Cancel / Disable |

Click **each button** sequentially to confirm:
```javascript
row.querySelectorAll('button')[N]?.click();
```
Snapshot → record the drawer/modal title that opens.

---

## Step 2: Explore the Add Form

### 2.1 Open form

Click "Add" button → wait 1s → snapshot.

### 2.2 Record title and buttons

- Form title (drawer/modal header)
- Submit button name ("Lưu mới" / "Tạo mới" / ...)
- Close button name ("Huỷ bỏ" / "×" / "Close" / ...)

### 2.3 Record each field

For each field:
- Label + required (`*`)
- Input type (text, select, radio, checkbox, date, drag-and-drop, ...)
- Placeholder
- Default value

Check required markers:
```javascript
document.querySelectorAll('.ant-form-item-required, [class*="required"]')
  .forEach(el => console.log(el.textContent));
```

### 2.4 Explore Conditional UI

For **each trigger field** (radio, checkbox, dropdown):
1. Record current state (snapshot)
2. Change value
3. Snapshot again → identify which fields appear/hide
4. Screenshot: `screenshot_conditional_{field}_{value}.png`
5. Return to default state before testing next trigger

### 2.5 Test Validation

Submit empty form → check all errors:
```javascript
const alerts = document.querySelectorAll('[role="alert"], .ant-form-item-explain-error');
Array.from(alerts).map(el => el.textContent.trim()).filter(t => t);
```

Screenshot: `screenshot_validation_add.png`

### 2.6 Test Successful Submit

Fill all required fields → submit → record:
- Success notification message
- New record status in list

---

## Step 3: Explore the View Detail Form

### 3.1 Open View Detail

Click Eye button on a record → wait 1s → snapshot.

### 3.2 Record

- Drawer title
- List of displayed fields (label + value)
- Is there a submit button? (if yes → View Detail includes edit)
- Screenshot: `screenshot_view_detail.png`

---

## Step 4: Explore the Edit Form

### 4.1 Identify editable record

Based on button map from Step 1 — find record with Edit (Pencil) button.

### 4.2 Open Edit form

Click Edit button → wait 1s → snapshot.

### 4.3 Record

- Title: "Edit {module name}"
- Fields pre-filled with existing data (same fields as Add)
- Submit button: "Cập nhật" (or equivalent)
- Screenshot: `screenshot_edit_form.png`

### 4.4 Test Edit Validation

Clear a required field → submit → verify errors similar to Add form.

### 4.5 Test Successful Edit Submit

Change a field → submit → record:
- Success notification
- Updated data in list/detail

---

## Step 5: Explore Delete

### 5.1 Open Delete Confirmation

Click Trash button on a record → wait 0.5s → check confirm dialog:
```javascript
document.querySelector('.ant-modal-confirm, [role="alertdialog"]')?.textContent?.substring(0, 300)
```

### 5.2 Record

- Confirm title: "Xác nhận xóa {module name}"
- Confirmation message content
- Buttons: "Đóng" / "Xác nhận" (or equivalent)
- Which record status has the Delete button

### 5.3 Close confirmation (do not actually delete)

Click "Đóng" to cancel.

---

## Step 6: Explore Secondary Actions (by status)

For each button not part of basic CRUD:
1. Click button → record the drawer/modal title that opens
2. Record fields and buttons in that dialog
3. Close without submitting

Common secondary actions:
- Processing history / Log
- Member / Customer list
- Cancel / Disable / Activate
- Process now / Manual trigger

---

## Step 7: Write Requirements

Save to `{OUTPUT_FOLDER}/requirements_{module_slug}.md` with structure:

```markdown
# Requirements: {MODULE_NAME}

## 1. Overview
## 2. Functional Requirements (US-01 ... US-N)
## 3. Field Specifications
### 3.1 Add / Edit Form
### 3.2 View Detail Screen
### 3.3 List Page
## 4. Processing Flows & Validation
## 5. Action Buttons by Status
## 6. Clarification Questions (Ambiguities)
```

---

## Step 8: Generate Test Cases

### 8.1 TC Group Order (top to bottom in table)

```
1.  [LIST]    Display list
2.  [LIST]    Filter / Search per field
3.  [LIST]    Pagination
4.  [ADD]     Required field validation — per required field
5.  [ADD]     Boundary values — character limits
6.  [ADD]     Optional fields / default values
7.  [ADD]     Dropdown options count
8.  [ADD]     Conditional UI (radio/checkbox: ON/OFF/cascade)
9.  [ADD]     Multi-value / drag-and-drop (if applicable)
10. [ADD]     Close form button
11. [ADD]     Happy Path Add new
12. [VIEW]    View detail — verify all fields displayed correctly
13. [EDIT]    Required field validation when editing
14. [EDIT]    Conditional UI in edit form
15. [EDIT]    Close edit form button
16. [EDIT]    Happy Path Update successful
17. [DELETE]  Confirm Delete — click Close (cancel)
18. [DELETE]  Confirm Delete — click Confirm (delete)
19. [ACTION]  Secondary features by status (if applicable)
```

### 8.2 Item Test Sub mapping

| TC Group | Item Test Sub |
|---|---|
| List, filter, pagination | Danh sách |
| Add new | Thêm |
| View detail | Xem |
| Edit | Sửa |
| Delete | Xóa |
| Secondary actions | by name (Lịch sử, Huỷ, ...) |

### 8.3 Required output table format

```markdown
| Test case ID | Item Test Main | Item Test Sub | Description | Pre-conditions | Step | Expected Results |
|---|---|---|---|---|---|---|
```

**7 columns, fixed order. No additions, no removals.**

### 8.4 Writing Rules

#### TC ID
- `TC - {N}` starting from START_NUMBER
- Sequential, no gaps

#### Cell Merging
- **Item Test Main/Sub**: only write in the first TC of the group, subsequent TCs leave blank
- **Description**: only write in the first TC of the same feature group (e.g.: ON/OFF for same feature)

#### Pre-conditions
- Brief: `1. Đang ở trang danh sách [Module]`
- Record specific state when testing conditional: `Checkbox "X" = OFF`
- Record record status when testing edit/delete: `Record có Trạng thái = "Chờ xử lý"`

#### Step
- Numbered, use `<br>` for line breaks within cell
- Field/button names: wrap in `[brackets]`
- Use "Nhập các trường khác hợp lệ" instead of specific test data (except Happy Path, Boundary)

#### Expected Results
- Validation pattern: `N. Hệ thống hiển thị lỗi tại trường dữ liệu: "Error message".`
- Success pattern: `Hệ thống hiển thị thông báo: "Notification content".`
- Delete success pattern: `Bản ghi không còn hiển thị trong danh sách.`

#### Priority Order
- **Happy Path Add** and **Happy Path Edit** always placed last in their respective groups
- **Delete - Confirm** is the last TC in the Delete group

---

## Step 9: Export Excel

```bash
node scripts/convert_excel/md_to_xlsx.js \
  {OUTPUT_FOLDER}/testcases_{module_slug}.md \
  {OUTPUT_FOLDER}/testcases_{module_slug}.xlsx
```

Verify log: `Found N tables, total M test cases → Exported M test cases`

---

## Step 10: Review Checklist

### TC ID
- [ ] Correct format: `TC - N`, sequential from START_NUMBER
- [ ] No duplicates

### Table Format
- [ ] Exactly 7 columns
- [ ] Main/Sub/Description merge correct (only in first TC of group)
- [ ] Steps use `<br>`, not split rows

### CRUD Coverage
- [ ] **List**: correct columns displayed, record count
- [ ] **Search/Filter**: each filter field
- [ ] **Pagination**: next/prev, page numbers
- [ ] **Add**: validate each required field, Happy Path
- [ ] **View detail**: verify all fields
- [ ] **Edit**: validate, update successful, correct record edited
- [ ] **Delete**: cancel + confirm
- [ ] **Secondary actions**: each action button has ≥ 1 TC

### Action Button Coverage
- [ ] Each button on each status has at least 1 TC
- [ ] TC clearly states Pre-condition: record must be in the correct status for button to appear

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Old modal still in DOM | `document.querySelectorAll('.ant-modal-close').forEach(b => b.click())` + Escape |
| Drag-and-drop not working via `mcp__playwright__browser_click` | Use `mcp__playwright__browser_drag` with startTarget/endTarget |
| Button has no title/tooltip | Inspect SVG path/polyline to identify icon |
| Edit button only appears for certain statuses | Clearly state Pre-condition status in TC |
| `Ref not found` after interaction | Re-snapshot to get new ref |

---

## Real Example — Customer Segment Module

| Config | Value |
|---|---|
| MODULE_NAME | Phân khúc khách hàng |
| ITEM_TEST_MAIN | Phân khúc khách hàng |
| URL | https://bdp-mini-app-admin.zminiapp.me/segments |
| OUTPUT_FOLDER | output_claude_workflow |

### Action Buttons by Status (actual inspect results)

| Recurring Processing Status | Status | Button Count | Buttons |
|---|---|---|---|
| Not processing | Completed | 4 | View Detail, History, Customer List, Delete |
| Waiting for next processing | Completed | 5 | View Detail, History, Customer List, Cancel Recurring Update, Delete |
| Not processing | Pending | 3 | View Detail, Edit, History |
| Not processing | Cancelled | 2 | View Detail, History |

### Delete Confirm Dialog
- Title: "Xác nhận xóa Phân khúc khách hàng"
- Message: "Bạn có chắc chắn muốn xóa Phân khúc khách hàng {name} không?"
- Buttons: "Đóng" (cancel) / "Xác nhận" (delete)

### Edit Form
- Title: "Chỉnh sửa phân khúc khách hàng"
- Fields: same as Add form, pre-filled with current data
- Submit button: "Cập nhật"
