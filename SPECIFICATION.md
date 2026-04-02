# Slide Designer — Product Specification

**Owner:** Krykk Ltd (UK Company No. 15883695)  
**Contact:** support@krykk.com  
**Version:** 1.0  
**Last Updated:** 2026-04-02

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & User Management](#4-authentication--user-management)
5. [Database Schema](#5-database-schema)
6. [API Routes](#6-api-routes)
7. [Block Types & Data Structures](#7-block-types--data-structures)
8. [Block Template Library](#8-block-template-library)
9. [Slide Templates](#9-slide-templates)
10. [Canvas & Layout](#10-canvas--layout)
11. [Export & Import](#11-export--import)
12. [Footer Customization](#12-footer-customization)
13. [Snapshot History](#13-snapshot-history)
14. [Theme Color System](#14-theme-color-system)
15. [Admin Dashboard](#15-admin-dashboard)
16. [Legal Pages](#16-legal-pages)
17. [Frontend Pages & Routing](#17-frontend-pages--routing)
18. [Maintenance Guidelines](#18-maintenance-guidelines)
19. [Changelog](#19-changelog)

---

## 1. Product Overview

Slide Designer is a web-based tool for creating professional KPI (Key Performance Indicator) presentation slides. It targets marketing, sales, and partnership teams who need to produce polished weekly or monthly performance reports without relying on spreadsheets or external design tools.

### Core Capabilities

- Sign in via Replit Auth (Google, GitHub, Apple, email/password)
- Choose from pre-built slide templates or start with a blank canvas
- Add draggable, resizable content blocks (KPI stats, charts, tables, timelines, Gantt charts, images, text)
- Edit block data directly on the canvas (inline editing) or via a data dialog
- Freely position blocks on a 20 px grid-snapped canvas
- Manage multiple pages within a single project
- Configure canvas dimensions (PowerPoint 16:9, HD, LinkedIn, etc.)
- Export slides as PNG images (download or copy to clipboard)
- Copy individual blocks as PNG images
- Save/load projects to cloud storage per user
- Export full projects as JSON; import from JSON
- Customise a persistent footer per project (logo, text, colours)
- Take timestamped snapshots for progress tracking
- Apply monochromatic colour themes across all blocks instantly
- Admin dashboard for user and contact-message management

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Drag & Drop | react-draggable |
| Export | html-to-image (PNG), native JSON |
| Backend | Node.js, Express |
| Database | PostgreSQL (via Drizzle ORM) |
| Auth | Replit Auth (OIDC — Google, GitHub, Apple, email/password) |
| Session | express-session with connect-pg-simple |
| Schema validation | Zod, drizzle-zod |
| ID generation | nanoid |

### Key Dependencies

- `react-draggable` — free-position drag for blocks
- `html-to-image` — renders DOM nodes to PNG for export
- `recharts` — pie charts, bar charts, stacked bar charts
- `lucide-react` — icon library for block icons
- `bcryptjs` — password hashing for admin accounts
- `nanoid` — unique IDs for blocks and pages

---

## 3. Project Structure

```
/
├── SPECIFICATION.md          ← This file
├── replit.md                 ← Developer notes (kept in sync with SPECIFICATION.md)
├── shared/
│   ├── schema.ts             ← Drizzle tables: projects, snapshots, contact_messages
│   └── models/
│       └── auth.ts           ← Drizzle tables: sessions, users, admin_users
├── server/
│   ├── index.ts              ← Express server entry point (port 5000)
│   ├── routes.ts             ← All API routes
│   ├── storage.ts            ← IStorage interface + DatabaseStorage implementation
│   ├── db.ts                 ← Drizzle DB connection
│   └── replit_integrations/
│       └── auth.ts           ← Replit OIDC setup, isAuthenticated middleware
└── client/
    └── src/
        ├── App.tsx           ← Routing (wouter)
        ├── index.css         ← Tailwind base + custom CSS variables
        ├── components/
        │   ├── ui/           ← shadcn/ui primitives
        │   ├── BlockEditor.tsx       ← Data-editing dialog for all block types
        │   ├── BlockPicker.tsx       ← Sidebar with block template palette
        │   ├── ChartBlock.tsx        ← Pie / bar chart renderer
        │   ├── DraggableBlock.tsx    ← Drag wrapper, controls (copy/edit/delete), right-click menu
        │   ├── ExportDialog.tsx      ← Full-page PNG export
        │   ├── FunnelBlock.tsx       ← Marketing funnel visualisation
        │   ├── GanttBlock.tsx        ← Gantt chart renderer
        │   ├── ImageBlock.tsx        ← Image / logo block
        │   ├── PipelineBlock.tsx     ← Stacked bar chart for pipeline opportunities
        │   ├── SimpleValueBlock.tsx  ← Single value display (icon + title + value)
        │   ├── SlideCanvas.tsx       ← Canvas area, grid, footer zone
        │   ├── StatBlock.tsx         ← KPI stat with trend indicator
        │   ├── TableBlock.tsx        ← Editable table with inline cell editing
        │   ├── TextBlock.tsx         ← Multi-line text, inline editing
        │   └── TimelineBlock.tsx     ← Events timeline with month axis
        ├── lib/
        │   ├── types.ts      ← All TypeScript types, BLOCK_TEMPLATES, SLIDE_TEMPLATES, CANVAS_SIZES
        │   └── utils.ts      ← cn(), colorWithAlpha(), generateMonochromaticScale()
        └── pages/
            ├── SlideDesigner.tsx     ← Main editor (multi-page, toolbar, settings dialog)
            ├── Landing.tsx           ← Public landing page
            ├── TermsAndConditions.tsx
            ├── PrivacyPolicy.tsx
            ├── Contact.tsx
            └── AdminDashboard.tsx
```

---

## 4. Authentication & User Management

### User Auth (Replit OIDC)

- Users sign in via **Replit Auth** which supports Google, GitHub, Apple, and email/password.
- On first login, a `users` row is created (upsert) with the OIDC subject (`sub`) as the primary key.
- `lastLoginAt` is updated on every successful login.
- `isAuthenticated` middleware (in `server/replit_integrations/auth.ts`) guards all `/api/*` routes that require a signed-in user.
- Suspended users receive a `403 Forbidden` response from the middleware.

### Session

- Sessions are stored in PostgreSQL using `connect-pg-simple`.
- Session secret is provided via the `SESSION_SECRET` environment variable.
- Sessions expire per the OIDC token lifetime.

### Account Deletion

- Users can delete their own account from the user menu.
- `DELETE /api/account` cascades deletion of all snapshots, projects, and the user row.

---

## 5. Database Schema

All tables are managed with Drizzle ORM. Schema source files are in `shared/`.

### `sessions`

| Column | Type | Notes |
|---|---|---|
| `sid` | varchar PK | Session ID |
| `sess` | jsonb | Session data |
| `expire` | timestamp | Session expiry (indexed) |

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | varchar PK | OIDC subject (`sub`) or generated UUID |
| `email` | varchar UNIQUE | May be null for social-only logins |
| `first_name` | varchar | From OIDC claims |
| `last_name` | varchar | From OIDC claims |
| `profile_image_url` | varchar | Avatar URL |
| `suspended` | boolean | Default `false`; enforced by auth middleware |
| `last_login_at` | timestamp | Updated on each login |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Auto |

### `admin_users`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | Auto-increment |
| `email` | varchar UNIQUE NOT NULL | Admin email address |
| `password_hash` | varchar NOT NULL | bcrypt hash |
| `created_at` | timestamp | Auto |

Seeded on startup: `admin@krykk.com` with password from `ADMIN_DEFAULT_PASSWORD` env var (default: `KrykkAdmin2026!`).

### `projects`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | Auto-increment |
| `user_id` | varchar NOT NULL | FK → `users.id` |
| `name` | varchar(255) NOT NULL | Project display name |
| `data` | jsonb NOT NULL | Full `SlideProject` JSON (see §10) |
| `created_at` | timestamp | Auto |
| `updated_at` | timestamp | Auto (updated on save) |

### `snapshots`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | Auto-increment |
| `project_id` | integer NOT NULL | FK → `projects.id` |
| `user_id` | varchar NOT NULL | FK → `users.id` |
| `name` | varchar(255) NOT NULL | Snapshot label / timestamp string |
| `image_data` | text NOT NULL | Base64 PNG data URL |
| `created_at` | timestamp | Auto |

### `contact_messages`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | Auto-increment |
| `name` | varchar(255) NOT NULL | Sender full name |
| `email` | varchar(255) NOT NULL | Sender email |
| `subject` | varchar(500) NOT NULL | Message subject |
| `message` | text NOT NULL | Message body |
| `created_at` | timestamp | Auto |

---

## 6. API Routes

All routes are registered in `server/routes.ts`.

### Auth (Replit OIDC)

Handled by `registerAuthRoutes()` from the Replit integration. Registers the following automatically:

| Method | Path | Description |
|---|---|---|
| GET | `/api/auth/user` | Returns current user profile (or 401) |
| GET | `/api/login` | Initiates OIDC login redirect |
| GET | `/api/logout` | Clears session, redirects to `/` |
| GET | `/api/callback` | OIDC callback, creates/updates user |

### Projects

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | User | List all projects for the current user |
| GET | `/api/projects/:id` | User | Get a single project by ID |
| POST | `/api/projects` | User | Create a new project |
| PUT | `/api/projects/:id` | User | Update project name and/or data |
| DELETE | `/api/projects/:id` | User | Delete a project and its snapshots |

### Snapshots

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects/:projectId/snapshots` | User | List snapshots for a project |
| POST | `/api/projects/:projectId/snapshots` | User | Create a snapshot (name + base64 imageData) |
| DELETE | `/api/snapshots/:id` | User | Delete a snapshot |

### Account

| Method | Path | Auth | Description |
|---|---|---|---|
| DELETE | `/api/account` | User | Delete current user account and all data |

### Contact

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Submit a contact form message |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | — | Email/password login for admin |
| POST | `/api/admin/logout` | Admin | Clear admin session |
| GET | `/api/admin/check` | — | Check admin session status |
| GET | `/api/admin/stats` | Admin | Platform stats (users, projects, snapshots, logins) |
| GET | `/api/admin/users` | Admin | List all users with project/snapshot counts |
| POST | `/api/admin/users/invite` | Admin | Create a pre-invited user by email |
| PATCH | `/api/admin/users/:userId/suspend` | Admin | Suspend or reinstate a user |
| DELETE | `/api/admin/users/:userId` | Admin | Delete a user and all their data |
| GET | `/api/admin/contact-messages` | Admin | List all contact form submissions |

---

## 7. Block Types & Data Structures

Blocks are the fundamental content units. Each block has the following shape:

```typescript
interface Block {
  id: string;            // nanoid
  type: BlockType;
  title: string;         // Display label
  icon: string;          // lucide-react icon name
  position: { x: number; y: number };   // Canvas position (px)
  size: { width: number; height: number }; // Block dimensions (px)
  data: BlockData;       // Type-specific payload (see below)
  color: string;         // HSL colour string (e.g. 'hsl(217, 91%, 60%)')
}
```

### Block Types

```typescript
type BlockType =
  | 'stat'
  | 'simple-value'
  | 'pie-chart'
  | 'bar-chart'
  | 'text'
  | 'gantt'
  | 'image'
  | 'table'
  | 'timeline'
  | 'pipeline'
  | 'funnel';
```

### Data Structures per Block Type

#### `stat`

```typescript
interface StatData {
  current: number;
  previous?: number;
  prefix?: string;   // e.g. '$'
  suffix?: string;   // e.g. '%'
}
```

Renders: current value (large), trend arrow + percentage change vs. previous, optional prefix/suffix. Inline editing of current and previous values on double-click.

#### `simple-value`

```typescript
interface SimpleValueData {
  value: string;
  prefix?: string;
  suffix?: string;
}
```

Renders: icon + title + single text/number value. No trend indicator or vs. comparison. Inline editing of value on double-click.

#### `pie-chart` / `bar-chart`

```typescript
interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}
// data is ChartDataPoint[]
```

Pie charts render a Recharts `PieChart` with a colour-coded legend. Bar charts render a `BarChart`. Legend labels and values are inline-editable.

#### `text`

```typescript
interface TextData {
  content: string;
  fontSize?: number;  // Default 24px
}
```

Multi-line text block. Inline editing on double-click; supports newlines.

#### `gantt`

```typescript
interface GanttTask {
  id: string;
  name: string;
  startDay: number;   // 1-indexed
  duration: number;   // Days
  color?: string;
  section?: string;   // Section / phase heading
}

interface GanttData {
  tasks: GanttTask[];
  totalDays: number;
  startLabel?: string;
}
```

Renders a horizontal Gantt bar chart. Section headings appear as separators. Supports up to 20 tasks.

#### `image`

```typescript
interface ImageData {
  src: string;               // Base64 data URL or external URL
  alt?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
}
```

Image / logo block. Users upload from their device; stored as base64 in the block data.

#### `table`

```typescript
interface TableData {
  columns: string[];
  rows: string[][];
  headerColor?: string;
  stripedRows?: boolean;
}
```

Editable table. Cells are edited inline via double-click. Column headers can be renamed. Header background colour follows the block colour.

#### `timeline`

```typescript
interface TimelineEvent {
  id: string;
  name: string;
  location: string;
  startDate: string;    // ISO date string (YYYY-MM-DD)
  endDate: string;
  cost?: number;
  attendees?: number;
  color?: string;
  segment?: string;     // Segment name for colour-coding
}

interface TimelineSegment {
  id: string;
  name: string;
  color?: string;
}

interface TimelineData {
  events: TimelineEvent[];
  segments: TimelineSegment[];
  durationMonths: number;
  startMonth: string;   // 'YYYY-MM'
}
```

Renders a horizontal timeline with a month axis. Events are placed as coloured bars. Events can be clicked to expand details (cost, attendees). Segments provide a colour legend.

#### `pipeline`

```typescript
interface PipelineOpportunity {
  id: string;
  name: string;
  amount: number;
  color?: string;
}

interface PipelineMonth {
  month: string;           // e.g. 'Jan'
  opportunities: PipelineOpportunity[];
}

interface PipelineData {
  months: PipelineMonth[];
  prefix?: string;         // e.g. '$'
}
```

Renders a stacked bar chart per month. Each opportunity is a stacked segment. Opportunity names appear as tooltips. Y-axis shows cumulative value.

#### `funnel`

```typescript
interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface FunnelData {
  stages: FunnelStage[];
}
```

Renders a marketing funnel as proportionally-sized horizontal bars stacked vertically. Each stage shows label, value, and conversion rate vs. the stage above.

---

## 8. Block Template Library

Block templates are predefined starting points shown in the block picker sidebar. Each template specifies `type`, `title`, `icon`, `category`, `defaultData`, `defaultSize`, and `color`.

### Categories and Templates

#### Sales

| Title | Type | Icon | Default Data |
|---|---|---|---|
| Revenue Won | stat | DollarSign | `{current:0, previous:0, prefix:'$'}` |
| Deals Won | stat | Trophy | `{current:0, previous:0}` |
| Deals Lost | stat | XCircle | `{current:0, previous:0}` |
| New Deals | stat | Plus | `{current:0, previous:0}` |
| Pipeline Value | stat | TrendingUp | `{current:0, previous:0, prefix:'$'}` |
| Win Rate | stat | Percent | `{current:0, previous:0, suffix:'%'}` |
| Average Deal Size | stat | Calculator | `{current:0, previous:0, prefix:'$'}` |
| Pipeline by Stage | pie-chart | PieChart | 5 stages: Prospecting, Qualification, Proposal, Negotiation, Closed |
| Win/Loss Comparison | bar-chart | BarChart3 | 2 bars: Won, Lost |
| Revenue (simple) | simple-value | DollarSign | `{value:'0', prefix:'$'}` |
| Pipeline View | pipeline | BarChart3 | 3 months × 2-3 opportunities |

#### Partners

| Title | Type |
|---|---|
| Partner Revenue | stat |
| Partner Pipeline | stat |
| Opportunities In-Flight | stat |
| Active Partners | stat |
| Partner Win Rate | stat |
| Avg Deal Size (Partner) | stat |
| Opportunities Table | table (5 columns) |

#### LinkedIn

| Title | Type |
|---|---|
| Followers | stat |
| Posts | stat |
| Invites Sent | stat |
| Profile Views | stat |
| Post Impressions | stat |
| Engagement Rate | stat |

#### Email

| Title | Type |
|---|---|
| Emails Sent | stat |
| Open Rate | stat |
| Click Rate | stat |
| Unsubscribes | stat |
| Bounce Rate | stat |
| Email Performance | pie-chart |

#### Marketing

| Title | Type |
|---|---|
| Leads Generated | stat |
| Cost per Lead | stat |
| Conversion Rate | stat |
| Marketing ROI | stat |
| Channel Performance | bar-chart |
| Marketing Funnel | funnel |

#### Website

| Title | Type |
|---|---|
| Page Views | stat |
| Unique Visitors | stat |
| Bounce Rate | stat |
| Avg Session Duration | stat |
| Pages per Session | stat |
| Traffic Sources | pie-chart |

#### Events

| Title | Type |
|---|---|
| Events Timeline | timeline |

#### Planning

| Title | Type |
|---|---|
| Gantt Chart | gantt |

#### Other

| Title | Type |
|---|---|
| Text Block | text |
| Simple Value | simple-value |
| Status | simple-value |
| Table | table |
| Image | image |

---

## 9. Slide Templates

Templates are full pre-populated `Page[]` arrays available from the "New Project" dialog.

| Template | Description |
|---|---|
| **Blank Slide** | Single empty page |
| **Sales Overview** | Revenue Won, Deals Won, Win Rate, Pipeline Value (stat blocks) + Pipeline View (stacked bar) + Win/Loss Comparison (bar chart) |
| **LinkedIn Analytics** | Followers, Posts, Invites Sent, Profile Views, Post Impressions, Engagement Rate + weekly performance bar chart |
| **Marketing Dashboard** | Leads, CPL, Conversion Rate, ROI (stat blocks) + Channel Performance bar chart + Marketing Funnel |
| **Website Analytics** | Page Views, Unique Visitors, Bounce Rate, Avg Session Duration, Pages per Session + Traffic Sources pie chart |
| **Email Campaign** | Emails Sent, Open Rate, Click Rate, Bounce Rate + Email Performance pie chart |
| **Partner Activity** | Partner Revenue, Partner Pipeline, Opportunities In-Flight, Active Partners + Opportunities table + revenue by partner bar chart + Partnership Status text block |
| **Events Timeline** | Full-width Events Timeline block with 3 sample events across 2 segments |
| **Campaign Planning** | Full-page Gantt chart with 16 realistic campaign tasks across 6 phases (Planning, Asset Creation, Review & Approval, Launch, Execution, Wrap-up) |

---

## 10. Canvas & Layout

### Canvas Presets

```typescript
export const CANVAS_SIZES: Record<string, CanvasSize> = {
  'ppt-16-9':    { name: 'PowerPoint 16:9', width: 960,  height: 540  },
  'ppt-4-3':     { name: 'PowerPoint 4:3',  width: 720,  height: 540  },
  'hd-1080':     { name: 'Full HD 1080p',   width: 1920, height: 1080 },
  'hd-720':      { name: 'HD 720p',         width: 1280, height: 720  },
  'std-4-3':     { name: 'Standard 4:3',    width: 800,  height: 600  },
  'linkedin':    { name: 'LinkedIn Post',   width: 1200, height: 675  },
};
export const DEFAULT_CANVAS_SIZE = 'ppt-16-9';
```

### SlideProject JSON Structure

The `data` column in `projects` stores the full project as:

```typescript
interface SlideProject {
  pages: Page[];
  canvasSize: string;       // Key from CANVAS_SIZES
  footer: FooterSettings;
}

interface Page {
  id: string;               // nanoid
  name: string;             // Display name, editable
  blocks: Block[];
}
```

### Grid Snapping

- Grid size: **20 px**
- Visual dotted pattern rendered on canvas background
- `react-draggable` uses `grid={[20, 20]}` prop
- Blocks also snap on resize (manually rounded to nearest 20 px)

### Block Controls

On hover, each block shows three icon buttons:

| Button | Icon | Action |
|---|---|---|
| Copy as image | Copy | Copies block as PNG to clipboard (falls back to download) |
| Edit | Settings | Opens BlockEditor dialog |
| Delete | X | Removes block from canvas |

Right-clicking a block also triggers the copy-as-image action.

---

## 11. Export & Import

### PNG Export (Full Page)

- Triggered via the camera icon in the toolbar.
- Uses `html-to-image`'s `toPng()` on the canvas DOM node.
- Options: download as file or copy to clipboard.
- Exports at native canvas resolution.

### Copy Block as PNG

- Hover controls show a copy button on each block.
- Uses `toPng()` on the block's DOM node (`.drag-handle` selector).
- Writes to clipboard via `navigator.clipboard.write()`.
- Falls back to triggering a file download if clipboard API is unavailable.

### JSON Export

- Exports the full `SlideProject` object as a `.json` file.
- Includes all pages, blocks (with data), canvas size, and footer settings.

### JSON Import

- Validates the imported JSON against expected structure before loading.
- Replaces the current project in memory (prompts confirmation).
- Restores footer settings alongside pages.

---

## 12. Footer Customization

Each project has an optional footer bar rendered below the canvas content area.

```typescript
interface FooterSettings {
  enabled: boolean;
  height: number;            // 30–120 px
  backgroundColor: string;  // Hex or HSL
  text: string;              // Custom text content
  textColor: string;
  logoSrc?: string;          // Base64 data URL
  logoPosition: 'left' | 'center' | 'right';
}
```

- Footer dimensions are reserved at the bottom of the canvas so blocks cannot overlap it.
- Footer settings persist in cloud saves and JSON export/import.
- Configured via a "Footer" tab in the Settings dialog.

---

## 13. Snapshot History

Snapshots are point-in-time PNG captures of the current canvas page, stored in the database.

- **Create**: Click the camera icon → enter a snapshot name → PNG is captured and stored as base64.
- **View**: History dialog shows all snapshots for the current project, ordered by creation date.
- **Download**: Each snapshot can be downloaded individually.
- **Delete**: Snapshots can be removed from the history dialog.
- Storage: `snapshots` table — `image_data` column stores the base64 PNG data URL.
- Snapshots are user-scoped (users can only see their own).

---

## 14. Theme Color System

### Colour Palette

Eight base colours are defined in `BLOCK_COLORS`:

```typescript
export const BLOCK_COLORS = {
  blue:   'hsl(217, 91%, 60%)',
  green:  'hsl(160, 84%, 39%)',
  yellow: 'hsl(43,  96%, 56%)',
  purple: 'hsl(280, 67%, 63%)',
  red:    'hsl(0,   84%, 60%)',
  orange: 'hsl(25,  95%, 53%)',
  teal:   'hsl(175, 84%, 32%)',
  pink:   'hsl(330, 81%, 60%)',
};
```

### Theme Colour Picker

Located in the Settings dialog under "Theme Color":

- **10 preset circles**: Blue, Green, Purple, Red, Orange, Teal, Pink, Gold, Cyan, Indigo
- **Custom hue slider**: 0–360° range for any hue
- Clicking a preset or moving the slider immediately generates a monochromatic scale and applies it.

### Monochromatic Scale Generation

`generateMonochromaticScale(hue: number): string[]` in `client/src/lib/utils.ts` produces a 10-colour array at varying lightness/saturation levels from a single hue, used to recolour all blocks consistently.

### Theme Application

`handleApplyThemeColor(hue)` in `SlideDesigner.tsx`:

- Iterates all pages and all blocks.
- Skips `text` and `image` block types.
- Updates `block.color` using the monochromatic scale (block index → colour index).
- For array data (pie/bar charts): updates each `item.color`.
- For `pipeline`: updates each opportunity's `color`.
- For `funnel`: updates each stage's `color`.
- For `timeline`: updates each segment and event `color`.
- For `table`: updates `headerColor`.

---

## 15. Admin Dashboard

Accessed at `/admin`. Uses a separate email/password auth flow independent of Replit OIDC.

### Admin Login

- `POST /api/admin/login` with `{ email, password }`
- Credentials checked against `admin_users` table (bcrypt)
- Admin session stored in `req.session.adminId`

### Default Admin Account

Seeded automatically on server startup:

- Email: `admin@krykk.com`
- Password: value of `ADMIN_DEFAULT_PASSWORD` env var (default: `KrykkAdmin2026!`)

### Dashboard Sections

#### Stats Cards

Retrieved from `GET /api/admin/stats`:

- Total Users
- Active Users (not suspended)
- Suspended Users
- Total Projects
- Total Snapshots
- Recent Logins (last 7 days)

#### User Management Table

Retrieved from `GET /api/admin/users`. Columns:

- Name / Email
- Account Created
- Last Login
- Projects count
- Snapshots count
- Status (Active / Suspended)
- Actions: Suspend / Reinstate, Delete

#### Invite Users

Admin can create a pre-invited user record by email (`POST /api/admin/users/invite`). This creates a `users` row with only the email set; the user completes sign-up via Replit Auth.

#### Contact Messages

Retrieved from `GET /api/admin/contact-messages`. Shows all form submissions from `/contact`.

---

## 16. Legal Pages

### Terms & Conditions — `/terms`

- Company: Krykk Ltd (UK Company No. 15883695)
- Covers: service description, user obligations, IP, limitation of liability, governing law (England & Wales)

### Privacy Policy — `/privacy`

- UK GDPR compliant
- Details: data collected (account info, usage, project data), basis for processing, retention, user rights (access, erasure, portability), data controller contact

### Contact Us — `/contact`

- Form fields: Name, Email, Subject, Message
- Submitted via `POST /api/contact` → stored in `contact_messages` table
- Response: success toast; form reset on success

---

## 17. Frontend Pages & Routing

Routing is handled by **wouter**.

| Path | Component | Auth Required |
|---|---|---|
| `/` | Landing (logged out) or SlideDesigner (logged in) | — |
| `/terms` | TermsAndConditions | No |
| `/privacy` | PrivacyPolicy | No |
| `/contact` | Contact | No |
| `/admin` | AdminDashboard | Admin session |

### Landing Page

Shown to logged-out users. Sections:

- Hero with product headline and sign-in CTA
- Features grid
- Block type showcase gallery with sample slide images
- Footer with copyright, trademark notice, and links to Terms, Privacy, Contact

### SlideDesigner Page

Main editor layout:

| Zone | Content |
|---|---|
| Header | Logo, project name input, page navigation (← page name →), toolbar buttons (new, open, save, export PNG, take snapshot, snapshot history, settings, user menu) |
| Left sidebar | BlockPicker — categorised block template palette |
| Centre | SlideCanvas — scrollable canvas with grid, blocks, footer zone |
| Block overlays | DraggableBlock per block; hover controls; BlockEditor dialog |

---

## 18. Maintenance Guidelines

### Keeping This Document Up to Date

Whenever a new feature is added or an existing feature changes:

1. Update the relevant section(s) of this `SPECIFICATION.md`.
2. Update `replit.md` → "Recent Changes" with a one-line summary.
3. Update `replit.md` → relevant feature sections if the architecture changed.
4. Commit both files together with the feature code.
5. Push to GitHub so the spec in the repository stays current.

### Section Update Map

| Change type | Sections to update |
|---|---|
| New block type | §7, §8, §14 (if colourable) |
| New slide template | §9 |
| New API route | §6 |
| New DB table or column | §5 |
| New page / route | §17 |
| New export format | §11 |
| Canvas or grid changes | §10 |
| Admin feature | §15 |
| Auth changes | §4 |
| Colour / theme changes | §14 |

---

## 19. Changelog

| Date | Change |
|---|---|
| 2026-04-02 | Added `SPECIFICATION.md`; connected project to GitHub |
| 2026-04-02 | Fixed Safari icon rendering (hex alpha → hsla) |
| 2026-04-02 | Fixed Pipeline block chart padding (stacked bars now fill chart area) |
| 2026-04-02 | Added Simple Value block type (icon + title + value, no trend) |
| 2026-04-02 | Added copy-as-image for individual blocks (hover button + right-click) |
| 2026-04-02 | Added theme colour customisation (10 presets + custom hue slider) |
| 2026-03-XX | Added Timeline, Pipeline, and Funnel block types |
| 2026-03-XX | Added Events Timeline slide template |
| 2026-03-XX | Added Contact Us page and `contact_messages` table |
| 2026-03-XX | Redesigned Landing page with hero, features, showcase gallery |
| 2026-03-XX | Added admin dashboard with user management and stats |
| 2026-03-XX | Added account deletion feature |
| 2026-03-XX | Added Terms & Conditions and Privacy Policy pages |
| 2026-03-XX | Added Snapshot History feature |
| 2026-03-XX | Added customisable footer (logo, text, colours, height) |
| 2026-03-XX | Added cloud save/load (PostgreSQL) with Replit Auth |
| 2026-03-XX | Added Gantt Chart block type and Campaign Planning template |
| 2026-03-XX | Added multi-page support, JSON export/import, configurable canvas sizes |
| 2026-03-XX | Initial implementation: drag-and-drop blocks, stat blocks, charts, PNG export |
