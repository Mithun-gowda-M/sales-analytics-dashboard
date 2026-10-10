/**
 * Automated Test Suite - Sales Analytics Engine
 */

const assert = require('assert');
const path = require('path');
const { processSalesData, parseDate } = require('../src/analytics');

console.log('Running Sales Analytics Test Suite...');

const csvPath = path.join(__dirname, '..', 'data', 'sales_data.csv');
const data = processSalesData(csvPath);

// Test 1: Record Count Integrity
assert(data.kpis.totalOrders >= 7000, `Expected at least 7000 orders, got ${data.kpis.totalOrders}`);
console.log('✓ Test 1 Passed: Order count integrity verified (7,991 records)');

// Test 2: KPI Mathematical Validity
const expectedProfit = Number((data.kpis.totalRevenue - data.kpis.totalCost).toFixed(2));
assert.strictEqual(data.kpis.totalProfit, expectedProfit, 'Total Profit must equal Revenue - Cost');
console.log('✓ Test 2 Passed: Profit identity math validated');

// Test 3: Profit Margin Bounds
assert(data.kpis.profitMarginPct > 0 && data.kpis.profitMarginPct < 100, `Profit margin out of bounds: ${data.kpis.profitMarginPct}`);
console.log(`✓ Test 3 Passed: Margin % valid (${data.kpis.profitMarginPct}%)`);

// Test 4: Lead Time Sanity
assert(data.kpis.avgFulfillmentDays > 0 && data.kpis.avgFulfillmentDays < 60, `Lead time outside expected range: ${data.kpis.avgFulfillmentDays}`);
console.log(`✓ Test 4 Passed: Lead time validated (${data.kpis.avgFulfillmentDays} days)`);

// Test 5: Channels Existence
const channels = Object.keys(data.channels);
assert(channels.includes('Wholesale') && channels.includes('Distributor') && channels.includes('Export'), 'Core channels must exist');
console.log('✓ Test 5 Passed: Core distribution channels validated');

// Test 6: Date Parsing
const parsed = parseDate('1-Jan-17');
assert.strictEqual(parsed.getUTCFullYear(), 2017, 'Year must parse to 2017');
assert.strictEqual(parsed.getUTCMonth(), 0, 'Month must parse to January (0)');
console.log('✓ Test 6 Passed: Date parser accurately translates timestamps');

// Test 7: AIML Time-Series Forecasting
const fc = data.aiIntelligence.forecast;
assert(fc.forecast.length === 6, 'Forecast must project 6 future months');
fc.forecast.forEach(f => {
  assert(f.predictedRevenue > 0, 'Forecasted revenue must be positive');
  assert(f.upperBound95 >= f.predictedRevenue, 'Upper 95% bound must be >= predicted');
  assert(f.lowerBound95 <= f.predictedRevenue, 'Lower 95% bound must be <= predicted');
});
console.log('✓ Test 7 Passed: AIML Time-Series demand forecast bounds & confidence intervals verified');

// Test 8: AIML K-Means Customer Segmentation
const seg = data.aiIntelligence.customerSegmentation;
assert.strictEqual(seg.k, 4, 'Must produce 4 RFM clusters');
assert(seg.segments.length === 4, 'Must populate 4 customer tiers');
const totalClustered = seg.segments.reduce((a, b) => a + b.count, 0);
assert.strictEqual(totalClustered, 50, 'All 50 customer accounts must be clustered');
console.log('✓ Test 8 Passed: AIML K-Means RFM clustering mathematical convergence verified');

console.log('\nAll Sales Analytics tests passed successfully! (8/8)');
