# Slide Designer

A web-based tool for designing professional KPI slides with drag-and-drop functionality, multiple pages, cloud storage, and user authentication.

## Overview

This application allows users to create custom KPI dashboards by:
- Signing in with email/password or social providers (Google, GitHub, Apple) via Replit Auth
- Starting with pre-built templates or blank slides
- Adding draggable stat blocks and chart blocks to a canvas
- Editing block data (current/previous values, chart data points)
- Positioning blocks freely on the slide with snap-to-grid alignment
- Creating multiple pages/slides within a project
- Configuring canvas size (PowerPoint, HD, LinkedIn presets)
- Exporting slides as PNG (download or copy to clipboard)
- Saving/loading projects to cloud storage with per-user data persistence

## Tech Stack

- **Frontend**: React with TypeScript, Vite
- **Backend**: Express with PostgreSQL database
- **Authentication**: Replit Auth (OIDC with social providers)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts (pie charts, bar charts)
- **Drag & Drop**: react-draggable with 20px grid snapping
- **Export**: html-to-image for PNG, native JSON for project files

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── BlockEditor.tsx    # Dialog for editing block data
│   │   ├── BlockPicker.tsx    # Sidebar with block templates
│   │   ├── ChartBlock.tsx     # Pie/bar chart component
│   │   ├── DraggableBlock.tsx # Wrapper for draggable blocks with grid snap
│   │   ├── ExportDialog.tsx   # PNG export dialog
│   │   ├── SlideCanvas.tsx    # Main canvas area
│   │   ├── StatBlock.tsx      # KPI stat component
│   │   ├── TextBlock.tsx      # Text block component
│   │   ├── GanttBlock.tsx     # Gantt chart component
│   │   ├── TableBlock.tsx     # Table block with inline cell editing
│   │   ├── ImageBlock.tsx     # Image/logo block component
│   │   ├── TimelineBlock.tsx  # Events timeline with month axis and fold/unfold details
│   │   ├── PipelineBlock.tsx  # Stacked bar chart for sales pipeline opportunities
│   │   ├── FunnelBlock.tsx    # Marketing conversion funnel visualization
│   │   └── SimpleValueBlock.tsx # Simple value block (icon, title, value only)
│   ├── lib/
│   │   ├── types.ts      # TypeScript types, templates, block templates, and constants
│   │   └── utils.ts      # Utility functions
│   ├── pages/
│   │   ├── SlideDesigner.tsx  # Main page with multi-page support
│   │   ├── Landing.tsx        # Landing page for logged-out users
│   │   ├── TermsAndConditions.tsx # Terms & Conditions page
│   │   ├── PrivacyPolicy.tsx  # Privacy Policy page
│   │   └── AdminDashboard.tsx # Admin login + dashboard
│   ├── App.tsx           # App entry with routing
│   └── index.css         # Tailwind and custom styles
server/
├── index.ts             # Express server entry
├── routes.ts            # API routes (minimal for this frontend-focused app)
└── storage.ts           # Storage interface
```

## Key Features

### Block Types
- **Simple Value Blocks**: Display a single value (text or number) with icon and title, no trend or comparison
- **Stat Blocks**: Display KPI metrics with current/previous values and trend indicators
- **Pie Charts**: Show data distribution
- **Bar Charts**: Compare values across categories
- **Text Blocks**: Add custom text/titles (supports multi-line with inline editing)
- **Gantt Charts**: Project timeline with up to 20 tasks, section separators, and color-coded task bars
- **Table Blocks**: Editable tables with configurable columns/rows, inline cell editing via double-click, colored headers
- **Image Blocks**: Upload and display images/logos with resizable containers and object-fit options

### Block Categories
- Sales KPIs (Revenue Won, Deals Won, Pipeline Value, Win Rate, etc.)
- Partners KPIs (Partner Revenue, Partner Pipeline, Opportunities In-Flight, Active Partners, Partner Win Rate, Avg Deal Size)
- LinkedIn KPIs (Followers, Posts, Profile Views, etc.)
- Email KPIs (Open Rate, Click Rate, Bounce Rate, etc.)
- Marketing KPIs (Leads, Cost per Lead, Conversion Rate, etc.)
- Website KPIs (Page Views, Visitors, Bounce Rate, etc.)
- Planning (Gantt Chart for project timelines)

### Slide Templates
Pre-built templates to get started quickly:
- **Blank Slide**: Start with an empty canvas
- **Sales Overview**: Revenue, deals, win rate, pipeline chart, win/loss comparison
- **LinkedIn Analytics**: Followers, posts, engagement, impressions, weekly performance
- **Marketing Dashboard**: Leads, CPL, conversion rate, ROI, channel performance
- **Website Analytics**: Page views, visitors, bounce rate, traffic sources
- **Email Campaign**: Emails sent, open rate, click rate, bounce rate, performance breakdown
- **Partner Activity**: Partner revenue, pipeline, opportunities table, partnership status text, revenue by partner chart, active partners
- **Campaign Planning**: Full-page Gantt chart with 16 realistic campaign tasks across 6 phases (Planning, Asset Creation, Review & Approval, Launch, Execution, Wrap-up)

### Canvas Sizes
Configurable canvas dimensions with presets:
- PowerPoint 16:9 (960x540) - Default
- PowerPoint 4:3 (720x540)
- Full HD 1080p (1920x1080)
- HD 720p (1280x720)
- Standard 4:3 (800x600)
- LinkedIn Post (1200x675)

### Multi-Page Support
- Create unlimited pages within a project
- Navigate between pages with arrow buttons
- Rename pages by clicking the page name
- Delete pages (minimum 1 page required)

### Grid Snapping
- 20px grid for precise block alignment
- Visual dotted grid pattern on canvas
- Blocks automatically snap to grid when dragged

### Block Styling
- Rounded corners (rounded-xl) for modern look
- Subtle shadows (shadow-sm) for depth
- Clean borders and consistent spacing

### Export/Import
- **PNG Export**: Download current page as high-resolution PNG or copy to clipboard
- **JSON Export**: Save entire project (all pages, blocks, canvas size, footer settings) as JSON file
- **JSON Import**: Load previously exported projects to restore all content including footer

### Customizable Footer
- Enable/disable footer per project
- Configurable height (30-120px)
- Custom text content
- Upload company logo with position options (left, center, right)
- Customizable background and text colors
- Footer automatically reserves space at bottom of canvas
- Footer settings persist with project save/load and JSON export/import

### Snapshot History
- Take timestamped snapshots of projects for weekly tracking
- View all snapshots in a dedicated history dialog
- Each snapshot captures the current canvas as a PNG image
- Download snapshots individually
- Delete old snapshots when no longer needed
- Snapshots are stored per project and per user

## Development

The app runs on port 5000 with the `npm run dev` command which starts both the Vite dev server and Express backend.

## Specification & GitHub

The authoritative product specification lives in **`SPECIFICATION.md`** at the project root. It covers all block types, data structures, API routes, database schema, templates, export formats, and more.

**GitHub repository:** https://github.com/krykk-software/krykk-slide-designer

### Keeping the spec up to date

Whenever you add a new feature or change an existing one, you MUST:
1. Update the relevant section(s) of `SPECIFICATION.md` (see the Section Update Map in §19).
2. Add a line to the `## Changelog` table at the bottom of `SPECIFICATION.md` with today's date.
3. Update the "Recent Changes" list in this `replit.md`.
4. Push the updated `SPECIFICATION.md` to GitHub (via the GitHub integration) alongside the feature code.

The GitHub repo is connected via the Replit GitHub integration (`connection:conn_github_01KG6CDDXV618Z67N70SAQ2KS2`). Files are pushed using the GitHub Contents API via `@replit/connectors-sdk`.

## Recent Changes

- Initial implementation of slide designer
- Added drag-and-drop block positioning with grid snapping
- Implemented stat blocks with trend indicators
- Added pie and bar chart support
- Created block editor for data modification
- Implemented PNG export functionality
- Added multi-page support with navigation
- Added JSON export/import for saving/loading projects
- Added project validation for imported JSON files
- Added rounded corners and shadows to blocks for modern styling
- Added configurable canvas sizes with PowerPoint default
- Added template selection dialog with 6 pre-built templates
- Added Gantt chart block type supporting up to 20 tasks with section separators and color-coded task bars
- Added "Campaign Planning" template with full-page Gantt chart showing 16 realistic campaign tasks across 6 phases
- Added Replit Auth (OIDC) for user authentication with social login support (Google, GitHub, Apple)
- Created Landing page for logged-out users with feature showcase and sign-in CTAs
- Added PostgreSQL database with users, sessions, and projects tables
- Implemented cloud save/load for projects with per-user data persistence
- Added Projects dialog to view, open, and delete saved projects
- Added user avatar/dropdown with logout functionality in header
- Added customizable footer with logo upload, text, colors, and position options
- Added snapshot history feature to track project progress over time with camera capture and history dialog
- Added inline editing for stat block values (current/previous) and chart block legend labels/values
- Added Terms & Conditions page (/terms) with Krykk Ltd legal details (UK 15883695)
- Added Privacy Policy page (/privacy) with UK GDPR compliance
- Added account deletion feature (user can delete account + all data from user menu)
- Added admin dashboard (/admin) with email/password login for admin@krykk.com
- Admin features: user stats cards, user management table (suspend, delete, invite users)
- Added suspended user enforcement in auth middleware
- Added last login tracking for all users
- Added Timeline, Pipeline, and Funnel block types with inline editing and BlockEditor support
- Added "Events Timeline" slide template with timeline block
- Updated Sales Overview and Marketing Dashboard templates with pipeline and funnel blocks
- Added Contact Us page (/contact) with form submission stored in database
- Added contact_messages table to PostgreSQL schema
- Added admin endpoint to view contact messages (/api/admin/contact-messages)
- Redesigned landing page with sample slide images, improved hero section, showcase gallery
- Updated footer: copyright notice, trademark, links to Terms, Privacy, and Contact us
- Company: Krykk Ltd, UK 15883695, support@krykk.com
- Fixed Safari icon rendering (replaced hex alpha with proper hsla for cross-browser compatibility)
- Fixed Pipeline block chart rendering (corrected chart padding for proper stacked bar display)
- Added Simple Value block type (icon, title, value only - no trend/comparison)
- Added copy-as-image for individual blocks (via hover button or right-click)
- Added HubSpot CRM integration: users can connect HubSpot via OAuth and import live deal, pipeline, contact, and company data directly onto slides as pre-populated blocks
  - New "HubSpot" tab in the block picker sidebar alongside the existing "Blocks" tab
  - Import cards: Deals Won, Deals Lost, Revenue Won, Pipeline Value, Win/Loss/Open bar chart, Pipeline by Stage pie chart, Value by Stage bar chart, Total Contacts, Total Companies
  - Blocks are inserted with real CRM data (static once placed, no auto-refresh)
  - Uses Replit's connectors-sdk for authenticated HubSpot API proxy calls
  - New server module: server/hubspot.ts; new API routes under /api/hubspot/
- Added theme color customization (monochromatic scale from a single hue, preset + custom slider)
- Added Calendar block type with three view modes (week, month, year): interactive grid with time slots, day cells, or year overview; calendar-event block type (10 event types: Busy, Meeting, Focus Time, Travel, Break, Lunch, Out of Office, Holiday, Deadline, Workshop); Calendar slide template with a configuration dialog for view, date, working hours, and weekend toggle; Calendar Events category in block picker sidebar
