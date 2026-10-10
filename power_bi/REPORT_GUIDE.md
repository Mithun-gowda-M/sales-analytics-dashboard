# Sales Analytics & Predictive Demand Intelligence - Power BI Implementation Guide

> **Academic Capstone Submission • Final Year Engineering in AIML**  
> **Student Name**: Mithun Gowda M  
> **Program**: B.E. / B.Tech in Artificial Intelligence & Machine Learning (AIML)  
> **Department**: Department of Computer Science & Engineering (AIML)  
> **Repository**: [https://github.com/Mithun-gowda-M/sales-analytics-dashboard](https://github.com/Mithun-gowda-M/sales-analytics-dashboard)  

---
## 1. Overview
This guide provides complete instructions to assemble the Sales Analytics Dashboard in Power BI Desktop according to the mini project requirements.

## 2. Star Schema Architecture
```
        +-------------------+
        |   Date_Dim        |
        +-------------------+
                  | (1:*)
                  v
+-------------------+       +-----------------------+
|  Customer_Dim     | ----> |      Sales_Fact       | <---- +-----------------------+
+-------------------+ (1:*) |  (7,991 Sales Orders) | (1:*) |     Product_Dim       |
                            +-----------------------+       +-----------------------+
                                  ^           ^
                           (1:*)  |           | (1:*)
                    +-------------+     +-----+-------------+
                    | Warehouse_Dim|     | DeliveryRegion_Dim|
                    +-------------+     +-------------------+
```

## 3. Visual Layout Configuration
1. **Header & KPI Strip (Top)**:
   - Card 1: `Total Revenue` (Formatted Currency `$#,##0`)
   - Card 2: `Total Profit` & `Gross Profit Margin %`
   - Card 3: `Total Orders` & `Average Order Value (AOV)`
   - Card 4: `Fulfillment Lead Time (Days)`
   - Slicers: `Channel` (Dropdown/Buttons), `Currency Code` (Tile), `Date Range` (Between)

2. **Sales Trends (Main Left Visual)**:
   - Visual: Line and Clustered Column Chart
   - Shared Axis: `Date_Dim[YearMonth]`
   - Column Values: `Total Revenue`
   - Line Values: `Gross Profit Margin %`

3. **Channel Performance (Middle Top)**:
   - Visual: Donut Chart
   - Legend: `Sales_Fact[Channel]`
   - Values: `Total Revenue`

4. **Warehouse Logistics SLA (Middle Bottom)**:
   - Visual: Clustered Bar Chart
   - Y-Axis: `Sales_Fact[Warehouse Code]`
   - X-Axis: `[Fulfillment Lead Time (Days)]`

5. **Currency FX Breakdown (Right Top)**:
   - Visual: Treemap
   - Category: `Sales_Fact[Currency Code]`
   - Values: `Total Revenue`

6. **SKU & Customer Matrix (Bottom Row)**:
   - Table 1: `Product Description Index`, `Total Quantity`, `Total Revenue`, `Total Profit`, `Gross Profit Margin %` with Data Bars
   - Table 2: `Customer Name Index`, `Total Orders`, `Total Revenue`, `[AOV]`, Pareto Cumulative %

## 4. DAX Measures
All production-ready DAX formulas are located in [measures.dax](measures.dax).


### 5. AIML Integration in Power BI
- **OLS Demand Forecast Table**: Ingest 6-month projected orders and 95% confidence bounds into a separate fact table.
- **K-Means RFM Clusters**: Import customer cluster labels (`Champions`, `Loyal`, `At Risk`, `Hibernating`) into `Customer_Dim` for cross-dimensional filtering.
- **Python/R Visual in Power BI Desktop**: Render the OLS regression slope and cluster centroids directly in canvas using the Python script editor.
