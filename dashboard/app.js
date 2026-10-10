/**
 * Sales Analytics Interactive Dashboard Controller
 */

let salesData = null;
let charts = {};

async function init() {
  try {
    const res = await fetch('sales_summary.json');
    salesData = await res.json();
    setupFilters();
    renderKPIs(salesData.kpis);
    renderCharts(salesData);
    renderTables(salesData);
    attachEventListeners();
  } catch (err) {
    console.error('Failed to load sales data:', err);
  }
}

function formatCurrency(val) {
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

function renderKPIs(kpis) {
  document.getElementById('kpiRevenue').textContent = formatCurrency(kpis.totalRevenue);
  document.getElementById('kpiProfit').textContent = formatCurrency(kpis.totalProfit);
  document.getElementById('kpiMarginBadge').textContent = `${kpis.profitMarginPct}% Gross Margin`;
  document.getElementById('kpiOrders').textContent = kpis.totalOrders.toLocaleString();
  document.getElementById('kpiAOV').textContent = `${formatCurrency(kpis.avgOrderValue)} AOV`;
  document.getElementById('kpiFulfillment').textContent = `${kpis.avgFulfillmentDays} Days`;
  document.getElementById('kpiQuantity').textContent = `${kpis.totalQuantity.toLocaleString()} Units`;
}

function setupFilters() {
  const channelSelect = document.getElementById('channelFilter');
  const currencySelect = document.getElementById('currencyFilter');

  Object.keys(salesData.channels).forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch;
    channelSelect.appendChild(opt);
  });

  Object.keys(salesData.currencies).forEach(cu => {
    const opt = document.createElement('option');
    opt.value = cu;
    opt.textContent = cu;
    currencySelect.appendChild(opt);
  });
}

function renderCharts(data) {
  // 1. Monthly Trends Chart (Revenue, Cost, Profit)
  const monthlyKeys = Object.keys(data.monthlyTrends).sort();
  const revSeries = monthlyKeys.map(k => data.monthlyTrends[k].revenue);
  const profitSeries = monthlyKeys.map(k => data.monthlyTrends[k].profit);

  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  charts.trend = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: monthlyKeys,
      datasets: [
        {
          label: 'Revenue',
          data: revSeries,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 2
        },
        {
          label: 'Gross Profit',
          data: profitSeries,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8' } }
      },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', callback: v => formatCurrency(v) } }
      }
    }
  });

  // 2. Channel Distribution Doughnut
  const channelLabels = Object.keys(data.channels);
  const channelRevs = channelLabels.map(c => data.channels[c].revenue);
  const ctxChannel = document.getElementById('channelChart').getContext('2d');
  charts.channel = new Chart(ctxChannel, {
    type: 'doughnut',
    data: {
      labels: channelLabels,
      datasets: [{
        data: channelRevs,
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } }
      }
    }
  });

  // 3. Warehouse Efficiency Bar Chart
  const whLabels = data.warehouses.map(w => w.warehouse);
  const whLeadTimes = data.warehouses.map(w => w.avgFulfillmentDays);
  const ctxWh = document.getElementById('warehouseChart').getContext('2d');
  charts.warehouse = new Chart(ctxWh, {
    type: 'bar',
    data: {
      labels: whLabels,
      datasets: [{
        label: 'Avg Fulfillment Days',
        data: whLeadTimes,
        backgroundColor: 'rgba(245, 158, 11, 0.85)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, title: { display: true, text: 'Lead Time (Days)', color: '#64748b' } }
      }
    }
  });

  // 4. Currency FX Breakdown
  const curLabels = Object.keys(data.currencies);
  const curRevs = curLabels.map(c => data.currencies[c].revenue);
  const ctxCur = document.getElementById('currencyChart').getContext('2d');
  charts.currency = new Chart(ctxCur, {
    type: 'pie',
    data: {
      labels: curLabels,
      datasets: [{
        data: curRevs,
        backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } } }
    }
  });

  // 5. Regional Distribution
  const regEntries = Object.entries(data.regionalDistribution).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);
  const regLabels = regEntries.map(r => `Region ${r[0]}`);
  const regRevs = regEntries.map(r => r[1].revenue);
  const ctxReg = document.getElementById('regionChart').getContext('2d');
  charts.region = new Chart(ctxReg, {
    type: 'bar',
    data: {
      labels: regLabels,
      datasets: [{
        label: 'Revenue',
        data: regRevs,
        backgroundColor: 'rgba(59, 130, 246, 0.85)',
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', callback: v => formatCurrency(v) } },
        y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

function renderTables(data) {
  // Product Table
  const prodTbody = document.querySelector('#productTable tbody');
  prodTbody.innerHTML = '';
  data.topProducts.slice(0, 8).forEach(p => {
    const tr = document.createElement('tr');
    const marginClass = p.margin >= 35 ? 'high' : 'medium';
    tr.innerHTML = `
      <td><strong>SKU #${p.productId}</strong></td>
      <td>${p.quantity.toLocaleString()}</td>
      <td>${formatCurrency(p.revenue)}</td>
      <td>${formatCurrency(p.profit)}</td>
      <td><span class="margin-pill ${marginClass}">${p.margin}%</span></td>
    `;
    prodTbody.appendChild(tr);
  });

  // Customer Table
  const custTbody = document.querySelector('#customerTable tbody');
  custTbody.innerHTML = '';
  data.topCustomers.slice(0, 8).forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>Account #${c.customerId}</strong></td>
      <td>${c.orders} Orders</td>
      <td>${formatCurrency(c.revenue)}</td>
      <td>${formatCurrency(c.profit)}</td>
      <td>${formatCurrency(c.avgOrderValue)}</td>
    `;
    custTbody.appendChild(tr);
  });
}

function attachEventListeners() {
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('channelFilter').value = 'ALL';
    document.getElementById('currencyFilter').value = 'ALL';
    renderKPIs(salesData.kpis);
  });

  document.getElementById('channelFilter').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'ALL') {
      renderKPIs(salesData.kpis);
    } else if (salesData.channels[val]) {
      const c = salesData.channels[val];
      const margin = c.revenue > 0 ? (c.profit / c.revenue) * 100 : 0;
      renderKPIs({
        totalRevenue: c.revenue,
        totalProfit: c.profit,
        profitMarginPct: Number(margin.toFixed(2)),
        totalOrders: c.orders,
        avgOrderValue: c.orders > 0 ? c.revenue / c.orders : 0,
        avgFulfillmentDays: salesData.kpis.avgFulfillmentDays,
        totalQuantity: c.quantity
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
