export type BlockType = 'stat' | 'simple-value' | 'pie-chart' | 'bar-chart' | 'text' | 'gantt' | 'image' | 'table' | 'timeline' | 'pipeline' | 'funnel';

export interface SimpleValueData {
  value: string;
  prefix?: string;
  suffix?: string;
}

export interface StatData {
  current: number;
  previous?: number;
  prefix?: string;
  suffix?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TextData {
  content: string;
  fontSize?: number;
}

export interface GanttTask {
  id: string;
  name: string;
  startDay: number;
  duration: number;
  color?: string;
  section?: string;
}

export interface GanttData {
  tasks: GanttTask[];
  totalDays: number;
  startLabel?: string;
}

export interface ImageData {
  src: string;
  alt?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
}

export interface TableData {
  columns: string[];
  rows: string[][];
  headerColor?: string;
  stripedRows?: boolean;
}

export interface TimelineEvent {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  cost?: number;
  attendees?: number;
  color?: string;
  segment?: string;
}

export interface TimelineSegment {
  id: string;
  name: string;
  color?: string;
}

export interface TimelineData {
  events: TimelineEvent[];
  segments: TimelineSegment[];
  durationMonths: number;
  startMonth: string;
}

export interface PipelineOpportunity {
  id: string;
  name: string;
  amount: number;
  color?: string;
}

export interface PipelineMonth {
  month: string;
  opportunities: PipelineOpportunity[];
}

export interface PipelineData {
  months: PipelineMonth[];
  prefix?: string;
}

export interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

export interface FunnelData {
  stages: FunnelStage[];
}

export interface FooterSettings {
  enabled: boolean;
  height: number;
  backgroundColor: string;
  text: string;
  textColor: string;
  logoSrc?: string;
  logoPosition: 'left' | 'center' | 'right';
}

export interface BlockPosition {
  x: number;
  y: number;
}

export interface BlockSize {
  width: number;
  height: number;
}

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  icon: string;
  position: BlockPosition;
  size: BlockSize;
  data: StatData | SimpleValueData | ChartDataPoint[] | TextData | GanttData | ImageData | TableData | TimelineData | PipelineData | FunnelData;
  color: string;
}

export interface BlockTemplate {
  type: BlockType;
  title: string;
  icon: string;
  category: string;
  defaultData: StatData | SimpleValueData | ChartDataPoint[] | TextData | GanttData | ImageData | TableData | TimelineData | PipelineData | FunnelData;
  defaultSize: BlockSize;
  color: string;
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  enabled: false,
  height: 60,
  backgroundColor: '#f8f9fa',
  text: '',
  textColor: '#374151',
  logoPosition: 'left',
};

export const BLOCK_COLORS = {
  blue: 'hsl(217, 91%, 60%)',
  green: 'hsl(160, 84%, 39%)',
  yellow: 'hsl(43, 96%, 56%)',
  purple: 'hsl(280, 67%, 63%)',
  red: 'hsl(0, 84%, 60%)',
  orange: 'hsl(25, 95%, 53%)',
  teal: 'hsl(175, 84%, 32%)',
  pink: 'hsl(330, 81%, 60%)',
} as const;

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  // Sales KPIs
  {
    type: 'stat',
    title: 'Revenue Won',
    icon: 'DollarSign',
    category: 'Sales',
    defaultData: { current: 0, previous: 0, prefix: '$' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'stat',
    title: 'Deals Won',
    icon: 'Trophy',
    category: 'Sales',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'stat',
    title: 'Deals Lost',
    icon: 'XCircle',
    category: 'Sales',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.red,
  },
  {
    type: 'stat',
    title: 'New Deals',
    icon: 'Plus',
    category: 'Sales',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'stat',
    title: 'Pipeline Value',
    icon: 'TrendingUp',
    category: 'Sales',
    defaultData: { current: 0, previous: 0, prefix: '$' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'stat',
    title: 'Win Rate',
    icon: 'Percent',
    category: 'Sales',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.yellow,
  },
  {
    type: 'stat',
    title: 'Average Deal Size',
    icon: 'Calculator',
    category: 'Sales',
    defaultData: { current: 0, previous: 0, prefix: '$' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.purple,
  },
  {
    type: 'pie-chart',
    title: 'Pipeline by Stage',
    icon: 'PieChart',
    category: 'Sales',
    defaultData: [
      { label: 'Prospecting', value: 30, color: BLOCK_COLORS.blue },
      { label: 'Qualification', value: 25, color: BLOCK_COLORS.green },
      { label: 'Proposal', value: 20, color: BLOCK_COLORS.yellow },
      { label: 'Negotiation', value: 15, color: BLOCK_COLORS.purple },
      { label: 'Closed', value: 10, color: BLOCK_COLORS.teal },
    ],
    defaultSize: { width: 320, height: 280 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'bar-chart',
    title: 'Win/Loss Comparison',
    icon: 'BarChart3',
    category: 'Sales',
    defaultData: [
      { label: 'Won', value: 0, color: BLOCK_COLORS.green },
      { label: 'Lost', value: 0, color: BLOCK_COLORS.red },
    ],
    defaultSize: { width: 320, height: 280 },
    color: BLOCK_COLORS.green,
  },
  // LinkedIn KPIs
  {
    type: 'stat',
    title: 'Followers',
    icon: 'Users',
    category: 'LinkedIn',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'stat',
    title: 'Posts',
    icon: 'FileText',
    category: 'LinkedIn',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'stat',
    title: 'Invites Sent',
    icon: 'Send',
    category: 'LinkedIn',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.teal,
  },
  {
    type: 'stat',
    title: 'Profile Views',
    icon: 'Eye',
    category: 'LinkedIn',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.purple,
  },
  {
    type: 'stat',
    title: 'Post Impressions',
    icon: 'Activity',
    category: 'LinkedIn',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'stat',
    title: 'Engagement Rate',
    icon: 'Heart',
    category: 'LinkedIn',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.pink,
  },
  // Email Campaign KPIs
  {
    type: 'stat',
    title: 'Emails Sent',
    icon: 'Mail',
    category: 'Email',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'stat',
    title: 'Open Rate',
    icon: 'MailOpen',
    category: 'Email',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'stat',
    title: 'Click Rate',
    icon: 'MousePointer',
    category: 'Email',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.purple,
  },
  {
    type: 'stat',
    title: 'Unsubscribes',
    icon: 'UserMinus',
    category: 'Email',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.red,
  },
  {
    type: 'stat',
    title: 'Bounce Rate',
    icon: 'AlertCircle',
    category: 'Email',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.orange,
  },
  {
    type: 'pie-chart',
    title: 'Email Performance',
    icon: 'PieChart',
    category: 'Email',
    defaultData: [
      { label: 'Opened', value: 40, color: BLOCK_COLORS.green },
      { label: 'Clicked', value: 15, color: BLOCK_COLORS.blue },
      { label: 'Bounced', value: 5, color: BLOCK_COLORS.red },
      { label: 'Unopened', value: 40, color: BLOCK_COLORS.purple },
    ],
    defaultSize: { width: 320, height: 280 },
    color: BLOCK_COLORS.blue,
  },
  // Marketing KPIs
  {
    type: 'stat',
    title: 'Leads Generated',
    icon: 'UserPlus',
    category: 'Marketing',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'stat',
    title: 'Cost per Lead',
    icon: 'DollarSign',
    category: 'Marketing',
    defaultData: { current: 0, previous: 0, prefix: '$' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.yellow,
  },
  {
    type: 'stat',
    title: 'Conversion Rate',
    icon: 'Target',
    category: 'Marketing',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.purple,
  },
  {
    type: 'stat',
    title: 'Marketing ROI',
    icon: 'TrendingUp',
    category: 'Marketing',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'bar-chart',
    title: 'Channel Performance',
    icon: 'BarChart3',
    category: 'Marketing',
    defaultData: [
      { label: 'Organic', value: 0, color: BLOCK_COLORS.green },
      { label: 'Paid', value: 0, color: BLOCK_COLORS.blue },
      { label: 'Social', value: 0, color: BLOCK_COLORS.purple },
      { label: 'Email', value: 0, color: BLOCK_COLORS.yellow },
    ],
    defaultSize: { width: 320, height: 280 },
    color: BLOCK_COLORS.blue,
  },
  // Website KPIs
  {
    type: 'stat',
    title: 'Page Views',
    icon: 'Eye',
    category: 'Website',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'stat',
    title: 'Unique Visitors',
    icon: 'Users',
    category: 'Website',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'stat',
    title: 'Bounce Rate',
    icon: 'LogOut',
    category: 'Website',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.red,
  },
  {
    type: 'stat',
    title: 'Avg Session Duration',
    icon: 'Clock',
    category: 'Website',
    defaultData: { current: 0, previous: 0, suffix: 's' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.purple,
  },
  {
    type: 'stat',
    title: 'Pages per Session',
    icon: 'Layers',
    category: 'Website',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.teal,
  },
  {
    type: 'pie-chart',
    title: 'Traffic Sources',
    icon: 'PieChart',
    category: 'Website',
    defaultData: [
      { label: 'Direct', value: 30, color: BLOCK_COLORS.blue },
      { label: 'Organic', value: 35, color: BLOCK_COLORS.green },
      { label: 'Referral', value: 15, color: BLOCK_COLORS.yellow },
      { label: 'Social', value: 20, color: BLOCK_COLORS.purple },
    ],
    defaultSize: { width: 320, height: 280 },
    color: BLOCK_COLORS.blue,
  },
  // Text block
  {
    type: 'text',
    title: 'Text Block',
    icon: 'Type',
    category: 'Other',
    defaultData: { content: 'Monthly Report', fontSize: 24 },
    defaultSize: { width: 300, height: 60 },
    color: BLOCK_COLORS.blue,
  },
  // Simple Value blocks
  {
    type: 'simple-value',
    title: 'Simple Value',
    icon: 'Hash',
    category: 'Other',
    defaultData: { value: '0' } as SimpleValueData,
    defaultSize: { width: 200, height: 100 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'simple-value',
    title: 'Revenue',
    icon: 'DollarSign',
    category: 'Sales',
    defaultData: { value: '0', prefix: '$' } as SimpleValueData,
    defaultSize: { width: 200, height: 100 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'simple-value',
    title: 'Status',
    icon: 'Info',
    category: 'Other',
    defaultData: { value: 'On Track' } as SimpleValueData,
    defaultSize: { width: 200, height: 100 },
    color: BLOCK_COLORS.teal,
  },
  // Partner KPIs
  {
    type: 'stat',
    title: 'Partner Revenue',
    icon: 'DollarSign',
    category: 'Partners',
    defaultData: { current: 0, previous: 0, prefix: '$' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.teal,
  },
  {
    type: 'stat',
    title: 'Partner Pipeline',
    icon: 'TrendingUp',
    category: 'Partners',
    defaultData: { current: 0, previous: 0, prefix: '$' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.blue,
  },
  {
    type: 'stat',
    title: 'Opportunities In-Flight',
    icon: 'Rocket',
    category: 'Partners',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.purple,
  },
  {
    type: 'stat',
    title: 'Active Partners',
    icon: 'Users',
    category: 'Partners',
    defaultData: { current: 0, previous: 0 },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.green,
  },
  {
    type: 'stat',
    title: 'Partner Win Rate',
    icon: 'Percent',
    category: 'Partners',
    defaultData: { current: 0, previous: 0, suffix: '%' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.yellow,
  },
  {
    type: 'stat',
    title: 'Avg Deal Size (Partner)',
    icon: 'Calculator',
    category: 'Partners',
    defaultData: { current: 0, previous: 0, prefix: '$' },
    defaultSize: { width: 200, height: 120 },
    color: BLOCK_COLORS.orange,
  },
  {
    type: 'table',
    title: 'Opportunities Table',
    icon: 'Table',
    category: 'Partners',
    defaultData: {
      columns: ['Opportunity', 'Partner', 'Value', 'Stage', 'Close Date'],
      rows: [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
      ],
      headerColor: BLOCK_COLORS.teal,
      stripedRows: true,
    } as TableData,
    defaultSize: { width: 700, height: 200 },
    color: BLOCK_COLORS.teal,
  },
  // Table block (general)
  {
    type: 'table',
    title: 'Table',
    icon: 'Table',
    category: 'Other',
    defaultData: {
      columns: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
      headerColor: BLOCK_COLORS.blue,
      stripedRows: true,
    } as TableData,
    defaultSize: { width: 500, height: 180 },
    color: BLOCK_COLORS.blue,
  },
  // Pipeline View
  {
    type: 'pipeline',
    title: 'Pipeline View',
    icon: 'BarChart3',
    category: 'Sales',
    defaultData: {
      months: [
        { month: 'Jan', opportunities: [
          { id: '1', name: 'Acme Corp', amount: 50000, color: BLOCK_COLORS.blue },
          { id: '2', name: 'Beta Inc', amount: 30000, color: BLOCK_COLORS.green },
        ]},
        { month: 'Feb', opportunities: [
          { id: '3', name: 'Gamma Ltd', amount: 45000, color: BLOCK_COLORS.purple },
        ]},
        { month: 'Mar', opportunities: [
          { id: '4', name: 'Delta Co', amount: 60000, color: BLOCK_COLORS.yellow },
          { id: '5', name: 'Epsilon', amount: 25000, color: BLOCK_COLORS.teal },
        ]},
      ],
      prefix: '$',
    } as PipelineData,
    defaultSize: { width: 500, height: 300 },
    color: BLOCK_COLORS.blue,
  },
  // Funnel
  {
    type: 'funnel',
    title: 'Marketing Funnel',
    icon: 'Filter',
    category: 'Marketing',
    defaultData: {
      stages: [
        { label: 'Leads', value: 1000, color: BLOCK_COLORS.blue },
        { label: 'MQL', value: 450, color: BLOCK_COLORS.teal },
        { label: 'SQL', value: 200, color: BLOCK_COLORS.green },
        { label: 'Opportunities', value: 80, color: BLOCK_COLORS.yellow },
        { label: 'Won', value: 32, color: BLOCK_COLORS.orange },
      ],
    } as FunnelData,
    defaultSize: { width: 460, height: 320 },
    color: BLOCK_COLORS.blue,
  },
  // Events Timeline
  {
    type: 'timeline',
    title: 'Events Timeline',
    icon: 'Calendar',
    category: 'Events',
    defaultData: {
      events: [
        { id: '1', name: 'Tech Summit', location: 'London, UK', startDate: '2026-01-15', endDate: '2026-01-17', cost: 5000, attendees: 200, color: BLOCK_COLORS.blue, segment: 'Technology' },
        { id: '2', name: 'Industry Expo', location: 'Paris, FR', startDate: '2026-02-10', endDate: '2026-02-12', cost: 8000, attendees: 500, color: BLOCK_COLORS.green, segment: 'Industry' },
        { id: '3', name: 'Sales Kickoff', location: 'New York, US', startDate: '2026-03-05', endDate: '2026-03-06', cost: 3000, attendees: 50, color: BLOCK_COLORS.purple, segment: 'Internal' },
      ],
      segments: [
        { id: '1', name: 'Technology', color: BLOCK_COLORS.blue },
        { id: '2', name: 'Industry', color: BLOCK_COLORS.green },
        { id: '3', name: 'Internal', color: BLOCK_COLORS.purple },
      ],
      durationMonths: 3,
      startMonth: '2026-01',
    } as TimelineData,
    defaultSize: { width: 920, height: 400 },
    color: BLOCK_COLORS.blue,
  },
  // Gantt chart
  {
    type: 'gantt',
    title: 'Gantt Chart',
    icon: 'GanttChart',
    category: 'Planning',
    defaultData: {
      tasks: [
        { id: '1', name: 'Planning', startDay: 1, duration: 5, color: BLOCK_COLORS.blue, section: 'Phase 1' },
        { id: '2', name: 'Design', startDay: 6, duration: 7, color: BLOCK_COLORS.purple, section: 'Phase 1' },
        { id: '3', name: 'Development', startDay: 13, duration: 10, color: BLOCK_COLORS.green, section: 'Phase 2' },
        { id: '4', name: 'Testing', startDay: 20, duration: 5, color: BLOCK_COLORS.yellow, section: 'Phase 2' },
        { id: '5', name: 'Launch', startDay: 25, duration: 3, color: BLOCK_COLORS.orange, section: 'Phase 3' },
      ],
      totalDays: 30,
      startLabel: 'Day 1',
    } as GanttData,
    defaultSize: { width: 920, height: 500 },
    color: BLOCK_COLORS.blue,
  },
];

export const CATEGORIES = ['Sales', 'Partners', 'LinkedIn', 'Email', 'Marketing', 'Website', 'Events', 'Planning', 'Other'] as const;

export const GRID_SIZE = 20; // Snap grid size in pixels

export interface Page {
  id: string;
  name: string;
  blocks: Block[];
  footer?: FooterSettings;
}

export interface SlideProject {
  version: string;
  name: string;
  pages: Page[];
  canvasSize: CanvasSize;
  createdAt: string;
  updatedAt: string;
  globalFooter?: FooterSettings;
}

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
}

export const CANVAS_SIZES: CanvasSize[] = [
  { width: 960, height: 540, name: 'PowerPoint 16:9 (Default)' },
  { width: 720, height: 540, name: 'PowerPoint 4:3' },
  { width: 1920, height: 1080, name: 'Full HD 1080p' },
  { width: 1280, height: 720, name: 'HD 720p' },
  { width: 800, height: 600, name: 'Standard 4:3' },
  { width: 1200, height: 675, name: 'LinkedIn Post' },
];

export const DEFAULT_CANVAS_SIZE = CANVAS_SIZES[0];

export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  blocks: Omit<Block, 'id'>[];
}

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Slide',
    description: 'Start with an empty canvas',
    category: 'General',
    icon: 'File',
    blocks: [],
  },
  {
    id: 'sales-overview',
    name: 'Sales Overview',
    description: 'Key sales metrics with pipeline chart',
    category: 'Sales',
    icon: 'TrendingUp',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 50 },
        data: { content: 'Sales Performance', fontSize: 28 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Revenue Won',
        icon: 'DollarSign',
        position: { x: 20, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 125000, previous: 98000, prefix: '$' },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Deals Won',
        icon: 'Trophy',
        position: { x: 260, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 47, previous: 38 },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Win Rate',
        icon: 'Percent',
        position: { x: 500, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 32, previous: 28, suffix: '%' },
        color: BLOCK_COLORS.yellow,
      },
      {
        type: 'stat',
        title: 'Pipeline Value',
        icon: 'TrendingUp',
        position: { x: 740, y: 80 },
        size: { width: 200, height: 120 },
        data: { current: 450000, previous: 380000, prefix: '$' },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'pipeline',
        title: 'Pipeline by Month',
        icon: 'BarChart3',
        position: { x: 20, y: 220 },
        size: { width: 920, height: 300 },
        data: {
          months: [
            { month: 'Jan', opportunities: [
              { id: '1', name: 'Acme Corp', amount: 50000, color: BLOCK_COLORS.blue },
              { id: '2', name: 'Beta Inc', amount: 30000, color: BLOCK_COLORS.green },
            ]},
            { month: 'Feb', opportunities: [
              { id: '3', name: 'Gamma Ltd', amount: 45000, color: BLOCK_COLORS.purple },
              { id: '4', name: 'Omega Co', amount: 28000, color: BLOCK_COLORS.teal },
            ]},
            { month: 'Mar', opportunities: [
              { id: '5', name: 'Delta Co', amount: 60000, color: BLOCK_COLORS.yellow },
              { id: '6', name: 'Epsilon', amount: 25000, color: BLOCK_COLORS.orange },
              { id: '7', name: 'Zeta LLC', amount: 15000, color: BLOCK_COLORS.pink },
            ]},
          ],
          prefix: '$',
        } as PipelineData,
        color: BLOCK_COLORS.blue,
      },
    ],
  },
  {
    id: 'linkedin-analytics',
    name: 'LinkedIn Analytics',
    description: 'LinkedIn performance metrics',
    category: 'LinkedIn',
    icon: 'Linkedin',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 50 },
        data: { content: 'LinkedIn Performance', fontSize: 28 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Followers',
        icon: 'Users',
        position: { x: 20, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 12500, previous: 11200 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Posts',
        icon: 'FileText',
        position: { x: 260, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 24, previous: 18 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Engagement Rate',
        icon: 'Heart',
        position: { x: 500, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 4.8, previous: 3.9, suffix: '%' },
        color: BLOCK_COLORS.pink,
      },
      {
        type: 'stat',
        title: 'Profile Views',
        icon: 'Eye',
        position: { x: 740, y: 80 },
        size: { width: 200, height: 120 },
        data: { current: 3420, previous: 2850 },
        color: BLOCK_COLORS.purple,
      },
      {
        type: 'bar-chart',
        title: 'Weekly Post Performance',
        icon: 'BarChart3',
        position: { x: 20, y: 220 },
        size: { width: 560, height: 300 },
        data: [
          { label: 'Mon', value: 245, color: BLOCK_COLORS.blue },
          { label: 'Tue', value: 312, color: BLOCK_COLORS.blue },
          { label: 'Wed', value: 428, color: BLOCK_COLORS.blue },
          { label: 'Thu', value: 389, color: BLOCK_COLORS.blue },
          { label: 'Fri', value: 276, color: BLOCK_COLORS.blue },
        ],
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Post Impressions',
        icon: 'Activity',
        position: { x: 600, y: 220 },
        size: { width: 340, height: 140 },
        data: { current: 45600, previous: 38200 },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Invites Sent',
        icon: 'Send',
        position: { x: 600, y: 380 },
        size: { width: 340, height: 140 },
        data: { current: 150, previous: 120 },
        color: BLOCK_COLORS.teal,
      },
    ],
  },
  {
    id: 'marketing-dashboard',
    name: 'Marketing Dashboard',
    description: 'High-level marketing metrics with conversion funnel',
    category: 'Marketing',
    icon: 'Target',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 50 },
        data: { content: 'Marketing Performance', fontSize: 28 },
        color: BLOCK_COLORS.purple,
      },
      {
        type: 'stat',
        title: 'Marketing Spend',
        icon: 'DollarSign',
        position: { x: 20, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 45000, previous: 38000, prefix: '$' },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Cost per Lead',
        icon: 'Target',
        position: { x: 260, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 24, previous: 31, prefix: '$' },
        color: BLOCK_COLORS.yellow,
      },
      {
        type: 'stat',
        title: 'MQL to SQL Rate',
        icon: 'TrendingUp',
        position: { x: 500, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 44, previous: 38, suffix: '%' },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Marketing ROI',
        icon: 'Percent',
        position: { x: 740, y: 80 },
        size: { width: 200, height: 120 },
        data: { current: 285, previous: 220, suffix: '%' },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'funnel',
        title: 'Conversion Funnel',
        icon: 'Filter',
        position: { x: 20, y: 220 },
        size: { width: 460, height: 300 },
        data: {
          stages: [
            { label: 'Leads', value: 1875, color: BLOCK_COLORS.blue },
            { label: 'MQL', value: 825, color: BLOCK_COLORS.teal },
            { label: 'SQL', value: 363, color: BLOCK_COLORS.green },
            { label: 'Opportunities', value: 145, color: BLOCK_COLORS.yellow },
            { label: 'Won', value: 47, color: BLOCK_COLORS.orange },
          ],
        } as FunnelData,
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'bar-chart',
        title: 'Channel Performance',
        icon: 'BarChart3',
        position: { x: 500, y: 220 },
        size: { width: 440, height: 300 },
        data: [
          { label: 'Organic', value: 142, color: BLOCK_COLORS.green },
          { label: 'Paid', value: 98, color: BLOCK_COLORS.blue },
          { label: 'Social', value: 67, color: BLOCK_COLORS.purple },
          { label: 'Email', value: 35, color: BLOCK_COLORS.yellow },
        ],
        color: BLOCK_COLORS.blue,
      },
    ],
  },
  {
    id: 'website-analytics',
    name: 'Website Analytics',
    description: 'Website traffic and performance metrics',
    category: 'Website',
    icon: 'Globe',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 50 },
        data: { content: 'Website Analytics', fontSize: 28 },
        color: BLOCK_COLORS.teal,
      },
      {
        type: 'stat',
        title: 'Page Views',
        icon: 'Eye',
        position: { x: 20, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 128000, previous: 105000 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Unique Visitors',
        icon: 'Users',
        position: { x: 260, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 42500, previous: 38200 },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Bounce Rate',
        icon: 'LogOut',
        position: { x: 500, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 42, previous: 48, suffix: '%' },
        color: BLOCK_COLORS.red,
      },
      {
        type: 'stat',
        title: 'Session Duration',
        icon: 'Clock',
        position: { x: 740, y: 80 },
        size: { width: 200, height: 120 },
        data: { current: 185, previous: 162, suffix: 's' },
        color: BLOCK_COLORS.purple,
      },
      {
        type: 'pie-chart',
        title: 'Traffic Sources',
        icon: 'PieChart',
        position: { x: 20, y: 220 },
        size: { width: 440, height: 300 },
        data: [
          { label: 'Direct', value: 35, color: BLOCK_COLORS.blue },
          { label: 'Organic', value: 40, color: BLOCK_COLORS.green },
          { label: 'Referral', value: 12, color: BLOCK_COLORS.yellow },
          { label: 'Social', value: 13, color: BLOCK_COLORS.purple },
        ],
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Pages per Session',
        icon: 'Layers',
        position: { x: 480, y: 220 },
        size: { width: 240, height: 140 },
        data: { current: 3.4, previous: 2.9 },
        color: BLOCK_COLORS.teal,
      },
      {
        type: 'stat',
        title: 'New vs Returning',
        icon: 'UserCheck',
        position: { x: 740, y: 220 },
        size: { width: 200, height: 140 },
        data: { current: 68, previous: 62, suffix: '%' },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Conversion Rate',
        icon: 'Target',
        position: { x: 480, y: 380 },
        size: { width: 460, height: 140 },
        data: { current: 2.8, previous: 2.3, suffix: '%' },
        color: BLOCK_COLORS.purple,
      },
    ],
  },
  {
    id: 'email-campaign',
    name: 'Email Campaign',
    description: 'Email marketing performance metrics',
    category: 'Email',
    icon: 'Mail',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 50 },
        data: { content: 'Email Campaign Report', fontSize: 28 },
        color: BLOCK_COLORS.orange,
      },
      {
        type: 'stat',
        title: 'Emails Sent',
        icon: 'Mail',
        position: { x: 20, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 15000, previous: 12500 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Open Rate',
        icon: 'MailOpen',
        position: { x: 260, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 24.5, previous: 21.2, suffix: '%' },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Click Rate',
        icon: 'MousePointer',
        position: { x: 500, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 3.8, previous: 3.1, suffix: '%' },
        color: BLOCK_COLORS.purple,
      },
      {
        type: 'stat',
        title: 'Unsubscribes',
        icon: 'UserMinus',
        position: { x: 740, y: 80 },
        size: { width: 200, height: 120 },
        data: { current: 45, previous: 62 },
        color: BLOCK_COLORS.red,
      },
      {
        type: 'pie-chart',
        title: 'Email Performance',
        icon: 'PieChart',
        position: { x: 20, y: 220 },
        size: { width: 440, height: 300 },
        data: [
          { label: 'Opened', value: 3675, color: BLOCK_COLORS.green },
          { label: 'Clicked', value: 570, color: BLOCK_COLORS.blue },
          { label: 'Bounced', value: 225, color: BLOCK_COLORS.red },
          { label: 'Unopened', value: 10530, color: BLOCK_COLORS.purple },
        ],
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Bounce Rate',
        icon: 'AlertCircle',
        position: { x: 480, y: 220 },
        size: { width: 240, height: 140 },
        data: { current: 1.5, previous: 2.1, suffix: '%' },
        color: BLOCK_COLORS.orange,
      },
      {
        type: 'stat',
        title: 'Delivered',
        icon: 'CheckCircle',
        position: { x: 740, y: 220 },
        size: { width: 200, height: 140 },
        data: { current: 14775, previous: 12350 },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Revenue Generated',
        icon: 'DollarSign',
        position: { x: 480, y: 380 },
        size: { width: 460, height: 140 },
        data: { current: 8450, previous: 6200, prefix: '$' },
        color: BLOCK_COLORS.green,
      },
    ],
  },
  {
    id: 'partner-activity',
    name: 'Partner Activity',
    description: 'Partner KPIs, pipeline, and key opportunities',
    category: 'Partners',
    icon: 'Handshake',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 50 },
        data: { content: 'Partner Activity Report', fontSize: 28 },
        color: BLOCK_COLORS.teal,
      },
      {
        type: 'stat',
        title: 'Partner Revenue',
        icon: 'DollarSign',
        position: { x: 20, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 185000, previous: 142000, prefix: '$' },
        color: BLOCK_COLORS.teal,
      },
      {
        type: 'stat',
        title: 'Partner Pipeline',
        icon: 'TrendingUp',
        position: { x: 260, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 520000, previous: 380000, prefix: '$' },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'stat',
        title: 'Opportunities In-Flight',
        icon: 'Rocket',
        position: { x: 500, y: 80 },
        size: { width: 220, height: 120 },
        data: { current: 14, previous: 9 },
        color: BLOCK_COLORS.purple,
      },
      {
        type: 'stat',
        title: 'Partner Win Rate',
        icon: 'Percent',
        position: { x: 740, y: 80 },
        size: { width: 200, height: 120 },
        data: { current: 38, previous: 31, suffix: '%' },
        color: BLOCK_COLORS.yellow,
      },
      {
        type: 'table',
        title: 'Key Opportunities',
        icon: 'Table',
        position: { x: 20, y: 220 },
        size: { width: 580, height: 200 },
        data: {
          columns: ['Opportunity', 'Partner', 'Value', 'Stage', 'ETA'],
          rows: [
            ['Enterprise CRM Deal', 'Acme Corp', '$120K', 'Negotiation', 'Q1'],
            ['Cloud Migration', 'TechPartners', '$85K', 'Proposal', 'Q2'],
            ['Security Audit Suite', 'SecureNet', '$65K', 'Qualification', 'Q2'],
            ['Data Platform Rollout', 'DataBridge', '$95K', 'Discovery', 'Q3'],
          ],
          headerColor: BLOCK_COLORS.teal,
          stripedRows: true,
        } as TableData,
        color: BLOCK_COLORS.teal,
      },
      {
        type: 'text',
        title: 'Partnership Status',
        icon: 'Type',
        position: { x: 620, y: 220 },
        size: { width: 320, height: 200 },
        data: { content: 'Partnership Status\n\nStrong momentum with Acme Corp on enterprise deals. TechPartners expanding into cloud services. New onboarding with DataBridge scheduled for next quarter.', fontSize: 13 },
        color: BLOCK_COLORS.teal,
      },
      {
        type: 'bar-chart',
        title: 'Revenue by Partner',
        icon: 'BarChart3',
        position: { x: 20, y: 440 },
        size: { width: 460, height: 80 },
        data: [
          { label: 'Acme Corp', value: 75000, color: BLOCK_COLORS.teal },
          { label: 'TechPartners', value: 52000, color: BLOCK_COLORS.blue },
          { label: 'SecureNet', value: 38000, color: BLOCK_COLORS.purple },
          { label: 'DataBridge', value: 20000, color: BLOCK_COLORS.green },
        ],
        color: BLOCK_COLORS.teal,
      },
      {
        type: 'stat',
        title: 'Active Partners',
        icon: 'Users',
        position: { x: 500, y: 440 },
        size: { width: 220, height: 80 },
        data: { current: 8, previous: 5 },
        color: BLOCK_COLORS.green,
      },
      {
        type: 'stat',
        title: 'Avg Deal Size',
        icon: 'Calculator',
        position: { x: 740, y: 440 },
        size: { width: 200, height: 80 },
        data: { current: 91250, previous: 72000, prefix: '$' },
        color: BLOCK_COLORS.orange,
      },
    ],
  },
  {
    id: 'events-timeline',
    name: 'Events Timeline',
    description: 'Track upcoming events with timeline view',
    category: 'Events',
    icon: 'Calendar',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 40 },
        data: { content: 'Events Calendar Q1 2026', fontSize: 24 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'timeline',
        title: 'Events Timeline',
        icon: 'Calendar',
        position: { x: 20, y: 70 },
        size: { width: 920, height: 450 },
        data: {
          events: [
            { id: '1', name: 'CES 2026', location: 'Las Vegas, US', startDate: '2026-01-07', endDate: '2026-01-10', cost: 15000, attendees: 1000, color: BLOCK_COLORS.blue, segment: 'Technology' },
            { id: '2', name: 'Partner Summit', location: 'London, UK', startDate: '2026-01-20', endDate: '2026-01-21', cost: 5000, attendees: 120, color: BLOCK_COLORS.green, segment: 'Partners' },
            { id: '3', name: 'MWC Barcelona', location: 'Barcelona, ES', startDate: '2026-02-23', endDate: '2026-02-26', cost: 25000, attendees: 2000, color: BLOCK_COLORS.blue, segment: 'Technology' },
            { id: '4', name: 'Sales Kickoff', location: 'New York, US', startDate: '2026-02-05', endDate: '2026-02-06', cost: 8000, attendees: 80, color: BLOCK_COLORS.purple, segment: 'Internal' },
            { id: '5', name: 'Industry Roundtable', location: 'Paris, FR', startDate: '2026-03-10', endDate: '2026-03-11', cost: 3000, attendees: 40, color: BLOCK_COLORS.yellow, segment: 'Industry' },
            { id: '6', name: 'Customer Advisory Board', location: 'San Francisco, US', startDate: '2026-03-18', endDate: '2026-03-19', cost: 12000, attendees: 25, color: BLOCK_COLORS.orange, segment: 'Partners' },
          ],
          segments: [
            { id: '1', name: 'Technology', color: BLOCK_COLORS.blue },
            { id: '2', name: 'Partners', color: BLOCK_COLORS.green },
            { id: '3', name: 'Internal', color: BLOCK_COLORS.purple },
            { id: '4', name: 'Industry', color: BLOCK_COLORS.yellow },
          ],
          durationMonths: 3,
          startMonth: '2026-01',
        } as TimelineData,
        color: BLOCK_COLORS.blue,
      },
    ],
  },
  {
    id: 'campaign-planning',
    name: 'Campaign Planning',
    description: 'Full-page Gantt chart for campaign timeline',
    category: 'Planning',
    icon: 'GanttChart',
    blocks: [
      {
        type: 'text',
        title: 'Title',
        icon: 'Type',
        position: { x: 20, y: 20 },
        size: { width: 920, height: 40 },
        data: { content: 'Campaign Timeline', fontSize: 24 },
        color: BLOCK_COLORS.blue,
      },
      {
        type: 'gantt',
        title: 'Campaign Gantt Chart',
        icon: 'GanttChart',
        position: { x: 20, y: 70 },
        size: { width: 920, height: 450 },
        data: {
          tasks: [
            { id: '1', name: 'Strategy & Planning', startDay: 1, duration: 5, color: BLOCK_COLORS.blue, section: 'Planning' },
            { id: '2', name: 'Audience Research', startDay: 3, duration: 4, color: BLOCK_COLORS.blue, section: 'Planning' },
            { id: '3', name: 'Messaging Framework', startDay: 6, duration: 3, color: BLOCK_COLORS.purple, section: 'Planning' },
            { id: '4', name: 'Creative Brief', startDay: 9, duration: 2, color: BLOCK_COLORS.purple, section: 'Asset Creation' },
            { id: '5', name: 'Copywriting', startDay: 11, duration: 5, color: BLOCK_COLORS.green, section: 'Asset Creation' },
            { id: '6', name: 'Design & Graphics', startDay: 11, duration: 7, color: BLOCK_COLORS.green, section: 'Asset Creation' },
            { id: '7', name: 'Video Production', startDay: 14, duration: 8, color: BLOCK_COLORS.green, section: 'Asset Creation' },
            { id: '8', name: 'Landing Page Build', startDay: 18, duration: 5, color: BLOCK_COLORS.teal, section: 'Asset Creation' },
            { id: '9', name: 'Internal Review', startDay: 22, duration: 2, color: BLOCK_COLORS.yellow, section: 'Review & Approval' },
            { id: '10', name: 'Revisions', startDay: 24, duration: 3, color: BLOCK_COLORS.yellow, section: 'Review & Approval' },
            { id: '11', name: 'Final Approval', startDay: 27, duration: 1, color: BLOCK_COLORS.yellow, section: 'Review & Approval' },
            { id: '12', name: 'Campaign Setup', startDay: 28, duration: 2, color: BLOCK_COLORS.orange, section: 'Launch' },
            { id: '13', name: 'Go Live', startDay: 30, duration: 1, color: BLOCK_COLORS.orange, section: 'Launch' },
            { id: '14', name: 'Campaign Run', startDay: 31, duration: 21, color: BLOCK_COLORS.red, section: 'Execution' },
            { id: '15', name: 'Monitoring & Optimization', startDay: 31, duration: 21, color: BLOCK_COLORS.pink, section: 'Execution' },
            { id: '16', name: 'Reporting & Analysis', startDay: 52, duration: 5, color: BLOCK_COLORS.purple, section: 'Wrap-up' },
          ],
          totalDays: 60,
          startLabel: 'Day 1',
        } as GanttData,
        color: BLOCK_COLORS.blue,
      },
    ],
  },
];
