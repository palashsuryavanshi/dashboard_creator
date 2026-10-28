export interface PresetDataset {
  id: string;
  name: string;
  badge: string;
  description: string;
  labelColumn: string;
  valueColumns: string[];
  headers: string[];
  rows: Record<string, any>[];
}

export const PRESET_DATASETS: PresetDataset[] = [
  {
    id: 'monthly-sales',
    name: 'Company Sales & Financials 2024',
    badge: 'Finance & Sales',
    description: 'Monthly business revenue, gross profits, marketing expenses, and units sold.',
    labelColumn: 'Month',
    valueColumns: ['Revenue ($k)', 'Gross Profit ($k)', 'Marketing Spend ($k)', 'Operating Expenses ($k)'],
    headers: ['Month', 'Revenue ($k)', 'Gross Profit ($k)', 'Marketing Spend ($k)', 'Operating Expenses ($k)', 'Units Sold', 'Satisfaction Score'],
    rows: [
      { 'Month': 'Jan', 'Revenue ($k)': 128, 'Gross Profit ($k)': 74, 'Marketing Spend ($k)': 24, 'Operating Expenses ($k)': 32, 'Units Sold': 1420, 'Satisfaction Score': 86 },
      { 'Month': 'Feb', 'Revenue ($k)': 145, 'Gross Profit ($k)': 85, 'Marketing Spend ($k)': 28, 'Operating Expenses ($k)': 34, 'Units Sold': 1580, 'Satisfaction Score': 88 },
      { 'Month': 'Mar', 'Revenue ($k)': 182, 'Gross Profit ($k)': 112, 'Marketing Spend ($k)': 35, 'Operating Expenses ($k)': 38, 'Units Sold': 1950, 'Satisfaction Score': 91 },
      { 'Month': 'Apr', 'Revenue ($k)': 165, 'Gross Profit ($k)': 98, 'Marketing Spend ($k)': 31, 'Operating Expenses ($k)': 36, 'Units Sold': 1760, 'Satisfaction Score': 89 },
      { 'Month': 'May', 'Revenue ($k)': 215, 'Gross Profit ($k)': 135, 'Marketing Spend ($k)': 42, 'Operating Expenses ($k)': 41, 'Units Sold': 2340, 'Satisfaction Score': 93 },
      { 'Month': 'Jun', 'Revenue ($k)': 248, 'Gross Profit ($k)': 162, 'Marketing Spend ($k)': 48, 'Operating Expenses ($k)': 44, 'Units Sold': 2710, 'Satisfaction Score': 94 },
      { 'Month': 'Jul', 'Revenue ($k)': 272, 'Gross Profit ($k)': 178, 'Marketing Spend ($k)': 52, 'Operating Expenses ($k)': 47, 'Units Sold': 2980, 'Satisfaction Score': 95 },
      { 'Month': 'Aug', 'Revenue ($k)': 260, 'Gross Profit ($k)': 168, 'Marketing Spend ($k)': 50, 'Operating Expenses ($k)': 46, 'Units Sold': 2850, 'Satisfaction Score': 92 }
    ]
  },
  {
    id: 'saas-metrics',
    name: 'SaaS Quarterly Performance',
    badge: 'SaaS & Subscriptions',
    description: 'Quarterly Net New ARR, Churned ARR, Expansion Revenue, and Customer Acquisition Cost.',
    labelColumn: 'Quarter',
    valueColumns: ['New ARR ($k)', 'Expansion ARR ($k)', 'Churned ARR ($k)', 'CAC ($)'],
    headers: ['Quarter', 'New ARR ($k)', 'Expansion ARR ($k)', 'Churned ARR ($k)', 'CAC ($)', 'Active Customers'],
    rows: [
      { 'Quarter': 'Q1 2023', 'New ARR ($k)': 95, 'Expansion ARR ($k)': 42, 'Churned ARR ($k)': 18, 'CAC ($)': 1250, 'Active Customers': 410 },
      { 'Quarter': 'Q2 2023', 'New ARR ($k)': 120, 'Expansion ARR ($k)': 55, 'Churned ARR ($k)': 22, 'CAC ($)': 1180, 'Active Customers': 520 },
      { 'Quarter': 'Q3 2023', 'New ARR ($k)': 142, 'Expansion ARR ($k)': 68, 'Churned ARR ($k)': 20, 'CAC ($)': 1120, 'Active Customers': 640 },
      { 'Quarter': 'Q4 2023', 'New ARR ($k)': 188, 'Expansion ARR ($k)': 91, 'Churned ARR ($k)': 25, 'CAC ($)': 1080, 'Active Customers': 790 },
      { 'Quarter': 'Q1 2024', 'New ARR ($k)': 215, 'Expansion ARR ($k)': 110, 'Churned ARR ($k)': 28, 'CAC ($)': 1020, 'Active Customers': 960 },
      { 'Quarter': 'Q2 2024', 'New ARR ($k)': 260, 'Expansion ARR ($k)': 138, 'Churned ARR ($k)': 31, 'CAC ($)': 970, 'Active Customers': 1180 }
    ]
  },
  {
    id: 'marketing-funnel',
    name: 'Growth & Conversion Funnel',
    badge: 'Marketing',
    description: 'Customer acquisition stages from impression to retained customer.',
    labelColumn: 'Stage',
    valueColumns: ['Total Leads', 'Converted Users', 'Drop-off Volume'],
    headers: ['Stage', 'Total Leads', 'Converted Users', 'Drop-off Volume', 'Conversion Rate %'],
    rows: [
      { 'Stage': '1. Impressions', 'Total Leads': 12000, 'Converted Users': 4800, 'Drop-off Volume': 7200, 'Conversion Rate %': 40 },
      { 'Stage': '2. Page Visits', 'Total Leads': 4800, 'Converted Users': 2200, 'Drop-off Volume': 2600, 'Conversion Rate %': 45 },
      { 'Stage': '3. Product Signups', 'Total Leads': 2200, 'Converted Users': 1150, 'Drop-off Volume': 1050, 'Conversion Rate %': 52 },
      { 'Stage': '4. Activated Trial', 'Total Leads': 1150, 'Converted Users': 680, 'Drop-off Volume': 470, 'Conversion Rate %': 59 },
      { 'Stage': '5. Paid Subscription', 'Total Leads': 680, 'Converted Users': 450, 'Drop-off Volume': 230, 'Conversion Rate %': 66 },
      { 'Stage': '6. Annual Renewal', 'Total Leads': 450, 'Converted Users': 390, 'Drop-off Volume': 60, 'Conversion Rate %': 86 }
    ]
  },
  {
    id: 'tech-stack',
    name: 'Developer Tech Stack & Adoption',
    badge: 'Technology',
    description: 'Industry satisfaction ratings, usage adoption percentage, and community growth index.',
    labelColumn: 'Framework',
    valueColumns: ['Satisfaction %', 'Usage Share %', 'Speed Benchmark (pts)', 'Ecosystem Size'],
    headers: ['Framework', 'Satisfaction %', 'Usage Share %', 'Speed Benchmark (pts)', 'Ecosystem Size', 'Active Contributors'],
    rows: [
      { 'Framework': 'React / Next.js', 'Satisfaction %': 88, 'Usage Share %': 78, 'Speed Benchmark (pts)': 85, 'Ecosystem Size': 95, 'Active Contributors': 1650 },
      { 'Framework': 'Vue / Nuxt', 'Satisfaction %': 91, 'Usage Share %': 46, 'Speed Benchmark (pts)': 89, 'Ecosystem Size': 82, 'Active Contributors': 840 },
      { 'Framework': 'Svelte / Kit', 'Satisfaction %': 94, 'Usage Share %': 32, 'Speed Benchmark (pts)': 96, 'Ecosystem Size': 71, 'Active Contributors': 620 },
      { 'Framework': 'Angular', 'Satisfaction %': 72, 'Usage Share %': 38, 'Speed Benchmark (pts)': 78, 'Ecosystem Size': 89, 'Active Contributors': 980 },
      { 'Framework': 'Astro', 'Satisfaction %': 96, 'Usage Share %': 28, 'Speed Benchmark (pts)': 98, 'Ecosystem Size': 65, 'Active Contributors': 490 },
      { 'Framework': 'SolidJS', 'Satisfaction %': 93, 'Usage Share %': 18, 'Speed Benchmark (pts)': 99, 'Ecosystem Size': 58, 'Active Contributors': 310 }
    ]
  }
];
