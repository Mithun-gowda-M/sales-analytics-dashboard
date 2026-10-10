# Sales Analytics Data Dictionary

| Column Name | Data Type | Description | Example Values |
| :--- | :--- | :--- | :--- |
| `OrderNumber` | Text | Unique identifier for each sales order | `SO - 000225` |
| `OrderDate` | Date | The date the order was placed by the client | `1-Jan-17` |
| `Ship Date` | Date | The date the order was dispatched from warehouse | `13-Jan-17` |
| `Customer Name Index` | Integer | Anonymized unique identifier for customer account | `1` to `50` |
| `Channel` | Text | Sales distribution channel | `Wholesale`, `Distributor`, `Export` |
| `Currency Code` | Text | Billing currency used for transaction | `USD`, `NZD`, `AUD`, `EUR`, `GBP` |
| `Warehouse Code` | Text | Origin distribution warehouse facility | `AXW291`, `AXW292`, etc. |
| `Delivery Region Index` | Integer | Anonymized geographic delivery destination zone | `1` to `75` |
| `Product Description Index` | Integer | Anonymized unique product identifier (SKU) | `1` to `47` |
| `Order Quantity` | Integer | Number of units ordered in the transaction | `1` to `15` |
| `Unit Price` | Decimal | Sales price per unit in base currency | `2499.10` |
| `Total Unit Cost` | Decimal | Landed production & shipping cost per unit | `1824.34` |
| `Total Revenue` | Decimal | Calculated line total (`Order Quantity` × `Unit Price`) | `14994.60` |
