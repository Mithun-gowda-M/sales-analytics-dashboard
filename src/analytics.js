/**
 * Sales Analytics Core Engine & Data Pipeline
 * Processes, validates, and computes business intelligence metrics
 */

const fs = require('fs');
const path = require('path');

function parseDate(str) {
  if (!str) return null;
  // formats: "1-Jan-17", "15-Dec-20"
  const parts = str.trim().split('-');
  if (parts.length !== 3) return new Date(str);
  const day = parseInt(parts[0], 10);
  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const month = months[parts[1].toLowerCase()] ?? 0;
  let year = parseInt(parts[2], 10);
  if (year < 100) year += 2000;
  return new Date(Date.UTC(year, month, day));
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    // Parse CSV line handling potential quotes
    const row = [];
    let insideQuote = false;
    let entry = '';
    for (const char of lines[i]) {
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());

    if (row.length >= headers.length) {
      const rec = {};
      headers.forEach((h, idx) => {
        rec[h] = row[idx];
      });
      records.push(rec);
    }
  }
  return records;
}

function processSalesData(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rawRecords = parseCSV(content);

  const cleanRecords = [];
  let totalRevenue = 0;
  let totalCost = 0;
  let totalQuantity = 0;
  let totalFulfillmentDays = 0;

  const channelMap = {};
  const warehouseMap = {};
  const currencyMap = {};
  const monthlyMap = {};
  const customerMap = {};
  const productMap = {};
  const regionMap = {};

  for (const r of rawRecords) {
    const orderQty = parseFloat(r['Order Quantity'] || r['Product Quantity'] || 0);
    const unitPrice = parseFloat(r['Unit Price'] || 0);
    const unitCost = parseFloat(r['Total Unit Cost'] || 0);
    const revenue = orderQty * unitPrice;
    const cost = orderQty * unitCost;
    const profit = revenue - cost;

    const orderDate = parseDate(r['OrderDate'] || r['Order Date']);
    const shipDate = parseDate(r['Ship Date'] || r['Shipping Date']);
    let fulfillmentDays = 0;
    if (orderDate && shipDate) {
      fulfillmentDays = Math.max(0, Math.round((shipDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const channel = r['Channel'] || 'Unknown';
    const warehouse = r['Warehouse Code'] || 'Unknown';
    const currency = r['Currency Code'] || 'USD';
    const customer = r['Customer Name Index'] || 'Unknown';
    const product = r['Product Description Index'] || 'Unknown';
    const region = r['Delivery Region Index'] || 'Unknown';

    totalRevenue += revenue;
    totalCost += cost;
    totalQuantity += orderQty;
    totalFulfillmentDays += fulfillmentDays;

    // Monthly bucket
    const yearMonth = orderDate ? `${orderDate.getUTCFullYear()}-${String(orderDate.getUTCMonth() + 1).padStart(2, '0')}` : 'Unknown';
    if (!monthlyMap[yearMonth]) monthlyMap[yearMonth] = { revenue: 0, cost: 0, profit: 0, orders: 0, quantity: 0 };
    monthlyMap[yearMonth].revenue += revenue;
    monthlyMap[yearMonth].cost += cost;
    monthlyMap[yearMonth].profit += profit;
    monthlyMap[yearMonth].orders += 1;
    monthlyMap[yearMonth].quantity += orderQty;

    // Channel
    if (!channelMap[channel]) channelMap[channel] = { revenue: 0, cost: 0, profit: 0, orders: 0, quantity: 0 };
    channelMap[channel].revenue += revenue;
    channelMap[channel].cost += cost;
    channelMap[channel].profit += profit;
    channelMap[channel].orders += 1;
    channelMap[channel].quantity += orderQty;

    // Warehouse
    if (!warehouseMap[warehouse]) warehouseMap[warehouse] = { revenue: 0, orders: 0, totalDays: 0 };
    warehouseMap[warehouse].revenue += revenue;
    warehouseMap[warehouse].orders += 1;
    warehouseMap[warehouse].totalDays += fulfillmentDays;

    // Currency
    if (!currencyMap[currency]) currencyMap[currency] = { revenue: 0, orders: 0, profit: 0 };
    currencyMap[currency].revenue += revenue;
    currencyMap[currency].orders += 1;
    currencyMap[currency].profit += profit;

    // Customer
    if (!customerMap[customer]) customerMap[customer] = { revenue: 0, orders: 0, profit: 0 };
    customerMap[customer].revenue += revenue;
    customerMap[customer].orders += 1;
    customerMap[customer].profit += profit;

    // Product
    if (!productMap[product]) productMap[product] = { revenue: 0, orders: 0, quantity: 0, profit: 0, unitPriceSum: 0, unitCostSum: 0, count: 0 };
    productMap[product].revenue += revenue;
    productMap[product].orders += 1;
    productMap[product].quantity += orderQty;
    productMap[product].profit += profit;
    productMap[product].unitPriceSum += unitPrice;
    productMap[product].unitCostSum += unitCost;
    productMap[product].count += 1;

    // Region
    if (!regionMap[region]) regionMap[region] = { revenue: 0, orders: 0, profit: 0 };
    regionMap[region].revenue += revenue;
    regionMap[region].orders += 1;
    regionMap[region].profit += profit;

    cleanRecords.push({
      orderNumber: r['OrderNumber'] || r['Order Number'],
      orderDate: orderDate ? orderDate.toISOString().slice(0, 10) : null,
      shipDate: shipDate ? shipDate.toISOString().slice(0, 10) : null,
      fulfillmentDays,
      customer,
      channel,
      currency,
      warehouse,
      region,
      product,
      quantity: orderQty,
      unitPrice,
      unitCost,
      revenue,
      cost,
      profit,
      margin: revenue > 0 ? (profit / revenue) : 0
    });
  }

  const orderCount = cleanRecords.length;
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgFulfillment = orderCount > 0 ? (totalFulfillmentDays / orderCount) : 0;
  const avgOrderValue = orderCount > 0 ? (totalRevenue / orderCount) : 0;

  // Warehouse stats
  const warehouseStats = Object.entries(warehouseMap).map(([code, d]) => ({
    warehouse: code,
    orders: d.orders,
    revenue: d.revenue,
    avgFulfillmentDays: d.orders > 0 ? Number((d.totalDays / d.orders).toFixed(1)) : 0
  })).sort((a, b) => b.revenue - a.revenue);

  // Top products
  const topProducts = Object.entries(productMap).map(([id, d]) => ({
    productId: id,
    orders: d.orders,
    quantity: d.quantity,
    revenue: Number(d.revenue.toFixed(2)),
    profit: Number(d.profit.toFixed(2)),
    margin: d.revenue > 0 ? Number(((d.profit / d.revenue) * 100).toFixed(2)) : 0,
    avgPrice: Number((d.unitPriceSum / d.count).toFixed(2)),
    avgCost: Number((d.unitCostSum / d.count).toFixed(2))
  })).sort((a, b) => b.revenue - a.revenue);

  // Top customers
  const topCustomers = Object.entries(customerMap).map(([id, d]) => ({
    customerId: id,
    orders: d.orders,
    revenue: Number(d.revenue.toFixed(2)),
    profit: Number(d.profit.toFixed(2)),
    avgOrderValue: Number((d.revenue / d.orders).toFixed(2))
  })).sort((a, b) => b.revenue - a.revenue);

  return {
    kpis: {
      totalOrders: orderCount,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      profitMarginPct: Number(avgMargin.toFixed(2)),
      totalQuantity,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      avgFulfillmentDays: Number(avgFulfillment.toFixed(1))
    },
    channels: channelMap,
    warehouses: warehouseStats,
    currencies: currencyMap,
    monthlyTrends: monthlyMap,
    topProducts: topProducts.slice(0, 15),
    topCustomers: topCustomers.slice(0, 15),
    regionalDistribution: regionMap,
    recordsSample: cleanRecords.slice(0, 100)
  };
}

module.exports = { processSalesData, parseCSV, parseDate };

if (require.main === module) {
  const csvFile = path.join(__dirname, '..', 'data', 'sales_data.csv');
  const results = processSalesData(csvFile);
  console.log('--- Sales Analytics Summary ---');
  console.log(JSON.stringify(results.kpis, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', 'dashboard', 'sales_summary.json'), JSON.stringify(results, null, 2));
  console.log('Saved summary to dashboard/sales_summary.json');
}
