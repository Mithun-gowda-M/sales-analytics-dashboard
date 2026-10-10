# 📊 Sales Analytics Dashboard (Power BI Mini Project 1)

[![Test Suite](https://img.shields.io/badge/tests-6%2F6%20passed-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/platform-Power%20BI%20%7C%20Web-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

An enterprise-grade **Sales Analytics Dashboard** built to solve operational opacity, optimize channel mix, evaluate warehouse fulfillment SLAs, and maximize gross profit margins across 7,900+ global sales orders.

---

## 🚀 Key Business Insights & Highlights
- **Total Revenue**: **$154.57M** across 7,991 customer orders.
- **Gross Profit**: **$57.79M** yielding a healthy **37.39% gross margin**.
- **Average Order Value (AOV)**: **$19,343.40** with 67,579 units shipped.
- **Logistics Fulfillment SLA**: **10.4 days average lead time** from placement to dispatch.
- **Top Channels**: Wholesale and Distributor account for >70% of enterprise cash flow.

---

## 🛠️ Repository Architecture
```
sales-analytics-dashboard/
├── data/
│   ├── sales_data.csv            # Clean raw transactions dataset (7,991 rows)
│   └── DATA_DICTIONARY.md        # Comprehensive column & domain metadata
├── src/
│   └── analytics.js              # High-performance ETL & statistical engine
├── dashboard/
│   ├── index.html                # Responsive executive dashboard
│   ├── styles.css                # Dark-mode glassmorphism visual design
│   ├── app.js                    # Chart.js dynamic slicers & reactive KPIs
│   └── sales_summary.json        # Precomputed BI aggregations
├── power_bi/
│   ├── measures.dax              # Production-grade DAX measures suite
│   ├── power_query.m             # Power Query (M) transformation script
│   └── REPORT_GUIDE.md           # Visual-by-visual layout & Star Schema guide
└── tests/
    └── sales_analytics.test.js   # Automated unit & integration test suite
```

---

## 📈 Power BI DAX Measures Reference
The repository includes production DAX measures in [`power_bi/measures.dax`](power_bi/measures.dax):
- `Total Revenue = SUMX(Sales_Fact, Sales_Fact[Order Quantity] * Sales_Fact[Unit Price])`
- `Gross Profit Margin % = DIVIDE([Total Profit], [Total Revenue], 0) * 100`
- `Fulfillment Lead Time (Days) = AVERAGEX(Sales_Fact, DATEDIFF(Sales_Fact[OrderDate], Sales_Fact[Ship Date], DAY))`
- `Revenue YoY Growth % = DIVIDE([Total Revenue] - [Revenue LY], [Revenue LY], 0) * 100`
- `Customer Pareto %` and `Product Revenue Rank`

---

## 🧪 Testing & Validation
Run the automated test suite verifying mathematical consistency, data types, and KPI integrity:
```bash
node tests/sales_analytics.test.js
```

---

## 💻 Running the Interactive Dashboard
Open `dashboard/index.html` in any modern web browser or serve via:
```bash
npx serve dashboard
```

---

## 📄 License
MIT License. Built for enterprise data analytics and executive decision-making.
