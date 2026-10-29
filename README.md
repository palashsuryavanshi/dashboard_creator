# 📊 Dashboard Creator

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Chart.js](https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?logo=githubpages&logoColor=white)](https://palashsuryavanshi.github.io/dashboard_creator/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](./LICENSE)

> Turn any Excel (`.xlsx`/`.xls`) or CSV file into **20 interactive charts** in seconds.  
> Upload data, bind your axes, pick a chart (or all of them), and explore your numbers instantly.

---

## ✨ Highlights

- **20 chart types** — Bar, Stacked/Clustered variants, Line, Area, Combo, Funnel, Scatter (XY), Pie & Doughnut, Radar, Polar Area
- **Smart Excel/CSV import** — auto-detects headers from the first row, supports multiple sheets
- **Reactive axis binding** — choose X-axis, primary & secondary Y-axes; charts update live
- **Chart picker** — display a single chart or all 20 at once (none shown by default)
- **KPI strip** — totals, averages, peaks and active axis configuration
- **5 color themes** + emerald accent palette, fully light-mode UI
- **Export anywhere** — download any chart as PNG, or your data as CSV
- **Reset in one click** — clear the loaded sheet and start over
- **Responsive** — works on desktop and tablet screens

---

## 🌿 Branches

| Branch | Description |
|--------|-------------|
| `main` | Stable, production-ready. Source + built assets at repo root for GitHub Pages. |
| `experimental` | Latest work (custom themes, data filtering). May change frequently. |

### Run the `experimental` branch locally

```bash
git clone https://github.com/palashsuryavanshi/dashboard_creator.git
cd dashboard_creator
git checkout experimental
npm install
npm run dev
```

Then open http://localhost:5173/

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 18 or newer
- npm (bundled with Node.js)

### Install & run (stable `main`)

```bash
git clone https://github.com/palashsuryavanshi/dashboard_creator.git
cd dashboard_creator
npm install
npm run dev
```

Open http://localhost:5173/ in your browser.

### Important: data format
Make sure the **first row of your spreadsheet contains column headers**. All subsequent rows are treated as data.

---

## 🛠️ Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server (http://localhost:5173) |
| `npm run build` | Type-check and build production assets into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove the `dist/` folder |

---

## 📦 Build for production

```bash
npm run build
```

The optimized bundle is written to `dist/`.  
For GitHub Pages served from the `main` branch root, copy the build output to the repo root:

```bash
npm run build
# copy dist/* to the repository root (index.html + assets/)
```

---

## 🗂️ Project structure

```
dashboard_creator/
├── src/
│   ├── App.tsx                 # Main dashboard component
│   ├── index.css               # Tailwind entry
│   ├── main.tsx                # React entry point
│   ├── components/
│   │   ├── ChartCard.tsx       # Chart rendering card
│   │   ├── ChartModal.tsx      # Full-screen chart view
│   │   ├── ExcelReader/        # Excel/CSV import & mapping
│   │   └── ...
│   ├── data/                   # Sample datasets
│   ├── types/                  # TypeScript types
│   └── utils/                  # Chart.js setup & config builder
├── index.html                  # Production entry (built, at repo root)
├── src/index.html              # Development entry (Vite root)
├── vite.config.ts
├── package.json
└── README.md
```

---

## 🧪 Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Chart.js 4** + **react-chartjs-2** for rendering all 20 chart types
- **ExcelJS** for parsing `.xlsx`, `.xls` and `.csv`
- **Tailwind CSS 4** for styling
- **Lucide React** for icons

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to your fork: `git push origin feature/my-feature`
5. Open a Pull Request

Please keep `main` and `experimental` READMEs in sync when adding features.

---

## 📄 License

Released under the [ISC License](https://opensource.org/licenses/ISC).  
Created by [Palash Suryavanshi](https://in.linkedin.com/in/palashsuryavanshi) · [GitHub](https://github.com/palashsuryavanshi/dashboard_creator)