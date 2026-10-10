# 📊 Sales Analytics & Predictive Demand Intelligence (Power BI & AIML Mini Project 1)

> **Academic Capstone Submission • Final Year Engineering in AIML**  
> **Student Name**: Mithun Gowda M  
> **Program**: B.E. / B.Tech in Artificial Intelligence & Machine Learning (AIML)  
> **Department**: Department of Computer Science & Engineering (AIML)  
> **Specialization**: Machine Learning, Predictive Time-Series Analytics & Business Intelligence  

[![Tests](https://img.shields.io/badge/tests-8%2F8%20passed-brightgreen.svg)]()
[![AIML Engine](https://img.shields.io/badge/AIML-K--Means%20%7C%20Time--Series-blueviolet.svg)]()
[![Power BI](https://img.shields.io/badge/Power%20BI-Desktop-F2C811?logo=powerbi&logoColor=black)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## 📌 Abstract & Problem Statement
In this final-year engineering mini-project, we address operational opacity and demand volatility in multi-channel enterprise distribution by building an integrated **Business Intelligence & Applied Machine Learning** pipeline. Traditional retrospective reporting fails to anticipate future cash flow and customer attrition. 

This project bridges descriptive reporting and predictive intelligence by introducing:
1. **Time-Series Sales Forecasting**: An Ordinary Least Squares (OLS) trend model with seasonal variance and 95% confidence intervals forecasting 6 months ahead.
2. **Unsupervised K-Means Customer Clustering**: An RFM (Recency, Frequency, Monetary) segmentation model ($k=4$) identifying customer tiers.
3. **Enterprise Power BI Star Schema**: Production-grade DAX measures and dimensional model for 7,991 transactions.
4. **Interactive AIML Web Dashboard**: Dark glassmorphism dashboard with real-time reactive slicers and zero-CORS browser portability.

---

## 🔬 Mathematical Formulations & Machine Learning Methodology

### 1. Time-Series Demand Forecasting (OLS Linear Trend)
Given monthly revenue observations $(t_i, y_i)$ for $i=1, \dots, n$, the linear growth trend slope $\beta_1$ and baseline $\beta_0$ are computed via:
$$\beta_1 = \frac{n \sum_{i=1}^{n} t_i y_i - \sum_{i=1}^{n} t_i \sum_{i=1}^{n} y_i}{n \sum_{i=1}^{n} t_i^2 - \left(\sum_{i=1}^{n} t_i\right)^2}, \quad \beta_0 = \bar{y} - \beta_1 \bar{t}$$

For projection step $h \in [1, 6]$, the $95\%$ confidence interval bounds are derived using standard error of residuals $s_e$:
$$\hat{y}_{n+h} \pm 1.96 \times s_e \sqrt{1 + \frac{1}{n} + \frac{(t_{n+h} - \bar{t})^2}{\sum (t_i - \bar{t})^2}}$$

### 2. K-Means Customer RFM Segmentation
Feature vectors $x_i = [R_i', F_i', M_i']^T$ are min-max normalized:
$$R_i' = \frac{R_i}{\max(R)}, \quad F_i' = \frac{F_i}{\max(F)}, \quad M_i' = \frac{M_i}{\max(M)}$$
Centroids $\mu_1, \dots, \mu_k$ are converged iteratively by minimizing the within-cluster sum of squares (WCSS):
$$J = \sum_{j=1}^{k} \sum_{i \in S_j} ||x_i - \mu_j||^2$$

---

## 📁 Repository Architecture
```
sales-analytics-dashboard/
├── data/
│   ├── sales_data.csv            # 7,991 order transaction records
│   └── DATA_DICTIONARY.md        # Comprehensive schema documentation
├── src/
│   ├── analytics.js              # ETL and statistical aggregation pipeline
│   └── sales_ml_engine.js        # Time-series forecast & K-Means RFM clustering
├── dashboard/
│   ├── index.html                # Responsive web analytics dashboard with AIML tab
│   ├── styles.css                # Modern dark-mode glassmorphism styling
│   ├── data.js                   # Client-side bundle (zero-CORS offline support)
│   ├── app.js                    # Chart.js dynamic slicers & reactive controller
│   └── sales_summary.json        # Precomputed analytical & ML metrics
├── power_bi/
│   ├── measures.dax              # Production DAX measures suite
│   ├── power_query.m             # Power Query (M) transformation script
│   └── REPORT_GUIDE.md           # Step-by-step visual configuration guide
└── tests/
    └── sales_analytics.test.js   # Automated unit & ML convergence test suite
```

---

## 📊 Key Results & Insights Summary
- **Total Revenue**: **$154.57 Million** across **7,991 orders**.
- **Gross Profit**: **$57.79 Million** yielding a **37.39% Gross Margin**.
- **Fulfillment SLA**: Average lead time is **10.4 days**.
- **AIML Customer Clusters ($k=4$)**:
  - *Tier 1 Champions (High Value)*: 9 key enterprise accounts contributing >45% volume.
  - *Tier 2 Loyal Regulars*: 13 accounts with consistent re-order velocity.
  - *Tier 3 Emerging Potential*: 17 mid-market growth accounts.
  - *Tier 4 At-Risk / Hibernating*: 11 accounts requiring re-engagement campaigns.

---

## 📐 Key DAX Measures (`power_bi/measures.dax`)
```dax
Total Revenue = SUMX(Sales_Fact, Sales_Fact[Order Quantity] * Sales_Fact[Unit Price])

Total Profit = [Total Revenue] - [Total Cost]

Gross Profit Margin % = DIVIDE([Total Profit], [Total Revenue], 0) * 100

Fulfillment Lead Time (Days) = AVERAGEX(Sales_Fact, DATEDIFF(Sales_Fact[OrderDate], Sales_Fact[Ship Date], DAY))

Revenue YoY Growth % = DIVIDE([Total Revenue] - [Revenue LY], [Revenue LY], 0) * 100
```

---

## 🧪 Automated Testing & Validation
Run automated tests verifying mathematical identities and ML convergence:
```bash
node tests/sales_analytics.test.js
```
**Test Results (8/8 Passed)**:
- `✓ Test 1 Passed`: Order count integrity verified (7,991 records).
- `✓ Test 2 Passed`: Mathematical identity `Profit = Revenue - Cost` verified.
- `✓ Test 3 Passed`: Profit margin percentage validated (37.39%).
- `✓ Test 4 Passed`: Logistics lead time verified (10.4 days).
- `✓ Test 5 Passed`: Distribution channels validated (Wholesale, Distributor, Export).
- `✓ Test 6 Passed`: Date parser correctly handles timestamps and leap years.
- `✓ Test 7 Passed`: AIML time-series demand forecast bounds & 95% CI verified.
- `✓ Test 8 Passed`: AIML K-Means RFM clustering mathematical convergence verified.

---

## 💻 How to Run the Interactive Dashboard
1. **Direct Browser Open (Offline Compatible)**:
   - Double-click `dashboard/index.html` in Windows Explorer. It opens instantly with zero CORS issues!
2. **Local HTTP Server (Optional)**:
   ```bash
   npx serve dashboard
   ```

---

## 🎓 Final Year Engineering Capstone Learning Outcomes
- Developed production-grade unsupervised clustering (K-Means) for behavioral segmentation.
- Formulated closed-form Ordinary Least Squares regression for time-series demand projections.
- Harmonized modern front-end data visualization with enterprise Power BI star schemas.

---

## 👤 Author
**Mithun Gowda M**  
Final Year Engineering Student (B.E. / B.Tech AIML)  
Department of Computer Science & Engineering (AIML)  
GitHub: [@Mithun-gowda-M](https://github.com/Mithun-gowda-M)
