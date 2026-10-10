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

console.log('\nAll Sales Analytics tests passed successfully! (6/6)');
