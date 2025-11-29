# Design Guidelines: E-Jurnal Guru

## Design Approach

**Selected Approach:** Design System (Chakra UI-aligned) with productivity app inspiration

**Reference Applications:** Notion (clean dashboards), Linear (data clarity), Google Classroom (educational context)

**Design Principles:**
- Clarity over decoration: Educational tools prioritize information accessibility
- Consistent patterns: Teachers need predictable, learnable interfaces
- Efficiency-first: Quick data entry for busy educators
- Professional restraint: Appropriate for institutional setting

---

## Core Design Elements

### A. Typography
**Font Family:** Chakra UI default system stack (Inter-based)

**Hierarchy:**
- Page Titles: 2xl (24px), semibold
- Section Headers: xl (20px), semibold  
- Card Titles: lg (18px), medium
- Body Text: md (16px), regular
- Labels/Meta: sm (14px), medium
- Helper Text: xs (12px), regular

### B. Layout System

**Spacing Units:** Chakra spacing scale - primarily use 2, 4, 6, 8, 12, 16
- Component padding: 4, 6
- Section spacing: 8, 12
- Page margins: 16
- Card gaps: 6

**Container Structure:**
- Max-width: 1200px for dashboards
- Page padding: 8 on all sides
- Card/Panel padding: 6 internally

### C. Component Library

**Navigation:**
- Sidebar navigation (fixed left, ~240px width) with role-specific menu items
- Top bar with user profile, logout, breadcrumbs
- Active states clearly indicated with light blue background

**Dashboard Layouts:**
- Card-based grid system (grid with gap-6)
- Summary cards at top (stats, quick actions)
- Main content area below for tables/forms
- Use Chakra's SimpleGrid for responsive card layouts

**Forms:**
- FormControl components with clear labels above inputs
- Input fields: md size, rounded corners
- Dropdowns: Chakra Select with consistent styling
- Buttons: md size, light blue primary, white secondary
- Form sections separated with spacing-8

**Data Tables:**
- Chakra Table component with striped rows
- Header: light blue background, white text, semibold
- Row hover: subtle gray background
- Status badges for attendance (Hadir=green, Sakit=yellow, Izin=blue, Alfa=red)
- Responsive: stack on mobile

**Cards:**
- White background, subtle shadow
- Rounded corners (borderRadius: md)
- Padding: 6
- Hover: subtle lift effect (shadow increase)

**Attendance Interface:**
- Radio button groups or button toggles for status selection
- Visual color coding matching badge colors
- Clear student name + NIS display

**Monitoring Dashboard (Principal):**
- Summary statistics cards with large numbers
- Charts using Recharts or similar (bar/line for trends)
- Filterable tables with date range pickers
- Export action buttons (subtle, top-right placement)

### D. Interactions & States

**Buttons:**
- Primary (light blue): Solid variant
- Secondary: Outline variant
- Disabled: Reduced opacity
- States handled by Chakra's built-in variants

**Loading States:**
- Chakra Spinner for async operations
- Skeleton components for initial data loads

**Feedback:**
- Chakra Toast for success/error messages (top-right position)
- Alert components for important notices within pages

---

## Page-Specific Guidelines

**Login Page:**
- Centered card (max-width: 400px)
- School logo/name at top
- Clear input fields for NIP and Password
- Single prominent login button
- Minimal, professional aesthetic

**Admin Dashboard:**
- Registration form as primary focus (single-column, max-width: 600px, centered)
- Recently registered accounts table below
- Success toast on registration

**Teacher Dashboard:**
- Grid of class cards (3 columns on desktop, 1 on mobile)
- Each card shows: Class name, Subject, Student count
- Click card to enter journal/attendance page

**Journal & Attendance Page:**
- Two-panel layout: Journal form (top/left), Attendance table (bottom/right)
- Journal: Textarea for topic/material, subject dropdown
- Attendance: Table with student rows, status selection per row
- Fixed "Save" button (bottom-right, sticky)

**Principal Dashboard:**
- KPI cards row (total teachers, classes, attendance rate)
- Tabs for different views (Daily Reports, Teacher Performance, Attendance Trends)
- Filterable data tables with export functionality

---

## Color Application (Structural Only)

Focus on layout hierarchy - color implementation handled separately. Use Chakra's semantic tokens for consistency.

**No animations** - Maintain professional, stable interface appropriate for daily school use.