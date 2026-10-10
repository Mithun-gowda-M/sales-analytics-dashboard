// ====================================================================
// POWER QUERY (M) - SALES ANALYTICS ETL SPECIFICATION
// ====================================================================

let
    // 1. Ingest Raw Source
    Source = Csv.Document(File.Contents("data/sales_data.csv"), [Delimiter=",", Columns=13, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    
    // 2. Type Casting & Sanitization
    TypedTable = Table.TransformColumnTypes(PromotedHeaders, {
        {"OrderNumber", type text},
        {"OrderDate", type date},
        {"Ship Date", type date},
        {"Customer Name Index", Int64.Type},
        {"Channel", type text},
        {"Currency Code", type text},
        {"Warehouse Code", type text},
        {"Delivery Region Index", Int64.Type},
        {"Product Description Index", Int64.Type},
        {"Order Quantity", Int64.Type},
        {"Unit Price", type number},
        {"Total Unit Cost", type number},
        {"Total Revenue", type number}
    }),
    
    // 3. Calculated Columns
    AddedLeadTime = Table.AddColumn(TypedTable, "FulfillmentDays", each Duration.Days([Ship Date] - [OrderDate]), Int64.Type),
    AddedCalculatedCost = Table.AddColumn(AddedLeadTime, "TotalCost", each [Order Quantity] * [Total Unit Cost], type number),
    AddedGrossProfit = Table.AddColumn(AddedCalculatedCost, "GrossProfit", each [Total Revenue] - [TotalCost], type number),
    AddedProfitMargin = Table.AddColumn(AddedGrossProfit, "GrossMarginPct", each if [Total Revenue] > 0 then ([GrossProfit] / [Total Revenue]) * 100 else 0, type number)
in
    AddedProfitMargin
