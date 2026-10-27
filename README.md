# Dashboard Creator

A React-based dashboard creator application featuring **18 different chart types** and **Excel data import** functionality. Built with Vite, TypeScript, and Chart.js, deployable to GitHub Pages.

## 📊 Features

### Charts Implemented (18 Types)

| Category | Chart Types |
|----------|-------------|
| **Bar & Column** | Bar Chart, Stacked Column Chart, Clustered Bar Chart, Clustered Column Chart, Stacked Bar Chart, 100% Stacked Column Chart |
| **Line & Area** | Line Chart, Area Chart, Stacked Area Chart, 100% Stacked Area Chart |
| **Combo** | Combo Chart (Line and Column), Combo Chart (Line and Column Variant) |
| **Specialty** | Funnel Chart, Scatter (XY) Chart, Pie Chart, Doughnut Chart |

### Excel Data Import
- Upload `.xlsx` or `.xls` files
- Auto-detects headers from first row
- Displays sample data in a table
- Download processed data as CSV
- Headers dynamically bind to all chart types

### GitHub Pages Ready
- Deployment configured with `gh-pages` package
- `npm run build && npm run deploy` for deployment
- Custom domain support

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🛠️ Tech Stack

- **React** + **TypeScript** + **Vite**
- **Chart.js** + **react-chartjs-2** for chart rendering
- **exceljs** for Excel file parsing
- **gh-pages** for deployment

## 📦 Project Structure

```
dashboard_creator/
├── src/
│   ├── App.tsx          # Main dashboard component
│   ├── App.css          # Styling
│   └── components/
│       └── ExcelReader/ # Excel import component
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies and scripts
└── .gitignore
```

## 🔮 Future Enhancements

Planned features for upcoming releases:

- **[Data Filtering]** - Filter and search Excel data before charting
- **[Chart Selection UI]** - Checkbox interface to select which charts display
- **[Responsive Charts]** - Mobile-friendly chart sizes and layouts
- **[Custom Data Mapping]** - Drag-and-drop column mapping for Excel data
- **[Chart Export]** - Export charts as PNG or SVG images
- **[Multiple Datasets]** - Support for more than 2 columns from Excel
- **[Saved Dashboards]** - User accounts to save and load dashboard configurations
- **[API Integration]** - Backend API for chart data persistence
- **[Authentication]** - Sign in with Freebuff or OAuth
- **[Real-time Updates]** - Live data updates via WebSockets
- **[Additional Chart Types]** - Radar, Polar, and Gauge charts
- **[Theme Support]** - Light/dark mode and custom color schemes