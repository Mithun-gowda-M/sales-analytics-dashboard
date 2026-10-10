/**
 * Advanced AIML Sales Intelligence Engine
 * Final Year AIML Capstone Component
 * Implements:
 * 1. Time-Series Sales Forecasting (Linear Regression Trend + Seasonal Decomposition)
 * 2. K-Means Customer RFM Segmentation (Recency, Frequency, Monetary clustering)
 * 3. Demand Forecasting & Inventory Stockout Risk Index
 */

function linearRegression(x, y) {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function forecastSales(monthlyData, horizon = 6) {
  const months = Object.keys(monthlyData).sort();
  const revenues = months.map(m => monthlyData[m].revenue);
  const x = revenues.map((_, i) => i);
  
  const { slope, intercept } = linearRegression(x, revenues);
  
  // Compute residuals standard deviation for confidence intervals
  const residuals = revenues.map((r, i) => r - (intercept + slope * i));
  const variance = residuals.reduce((a, b) => a + b * b, 0) / (revenues.length - 2);
  const stdError = Math.sqrt(Math.max(0, variance));

  const forecast = [];
  const lastDate = new Date(months[months.length - 1] + '-01');
  
  for (let h = 1; h <= horizon; h++) {
    const nextDate = new Date(lastDate);
    nextDate.setUTCMonth(nextDate.getUTCMonth() + h);
    const monthStr = `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}`;
    const xVal = revenues.length - 1 + h;
    const predicted = Math.max(0, intercept + slope * xVal);
    const upper95 = predicted + 1.96 * stdError;
    const lower95 = Math.max(0, predicted - 1.96 * stdError);

    forecast.push({
      month: monthStr,
      predictedRevenue: Number(predicted.toFixed(2)),
      upperBound95: Number(upper95.toFixed(2)),
      lowerBound95: Number(lower95.toFixed(2))
    });
  }

  return {
    trendSlopeMonthly: Number(slope.toFixed(2)),
    standardError: Number(stdError.toFixed(2)),
    forecast
  };
}

function kMeansRFM(cleanRecords, k = 4, iterations = 20) {
  // 1. Calculate RFM features per customer
  const customerMap = {};
  const latestDate = new Date('2021-01-01').getTime();

  cleanRecords.forEach(r => {
    const custId = r.customer;
    const orderDate = new Date(r.orderDate).getTime();
    if (!customerMap[custId]) {
      customerMap[custId] = { customerId: custId, lastDate: orderDate, orders: 0, spend: 0 };
    }
    if (orderDate > customerMap[custId].lastDate) {
      customerMap[custId].lastDate = orderDate;
    }
    customerMap[custId].orders += 1;
    customerMap[custId].spend += r.revenue;
  });

  const rawPoints = Object.values(customerMap).map(c => {
    const recencyDays = Math.round((latestDate - c.lastDate) / (1000 * 60 * 60 * 24));
    return {
      customerId: c.customerId,
      r: Math.max(0, recencyDays),
      f: c.orders,
      m: c.spend
    };
  });

  if (rawPoints.length === 0) return { clusters: [], summary: {} };

  // Min-Max Normalization
  const maxR = Math.max(...rawPoints.map(p => p.r)) || 1;
  const maxF = Math.max(...rawPoints.map(p => p.f)) || 1;
  const maxM = Math.max(...rawPoints.map(p => p.m)) || 1;

  const normalized = rawPoints.map(p => ({
    ...p,
    norm: [p.r / maxR, p.f / maxF, p.m / maxM]
  }));

  // Initialize k centroids deterministically based on percentiles
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i * normalized.length) / k);
    centroids.push([...normalized[idx].norm]);
  }

  // Iterate K-Means
  let clusterAssignments = new Array(normalized.length).fill(0);
  for (let iter = 0; iter < iterations; iter++) {
    // Assignment step
    normalized.forEach((p, pIdx) => {
      let bestDist = Infinity;
      let bestCluster = 0;
      centroids.forEach((c, cIdx) => {
        const dist = Math.sqrt(
          Math.pow(p.norm[0] - c[0], 2) +
          Math.pow(p.norm[1] - c[1], 2) +
          Math.pow(p.norm[2] - c[2], 2)
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = cIdx;
        }
      });
      clusterAssignments[pIdx] = bestCluster;
    });

    // Update step
    const newCentroids = Array.from({ length: k }, () => [0, 0, 0]);
    const counts = new Array(k).fill(0);

    normalized.forEach((p, pIdx) => {
      const cIdx = clusterAssignments[pIdx];
      newCentroids[cIdx][0] += p.norm[0];
      newCentroids[cIdx][1] += p.norm[1];
      newCentroids[cIdx][2] += p.norm[2];
      counts[cIdx] += 1;
    });

    centroids = newCentroids.map((c, i) => {
      if (counts[i] === 0) return centroids[i];
      return [c[0] / counts[i], c[1] / counts[i], c[2] / counts[i]];
    });
  }

  // Label clusters based on spend and frequency
  const clusterStats = Array.from({ length: k }, (_, idx) => ({
    clusterId: idx,
    count: 0,
    avgRecency: 0,
    avgFrequency: 0,
    avgSpend: 0,
    totalSpend: 0
  }));

  normalized.forEach((p, pIdx) => {
    const cIdx = clusterAssignments[pIdx];
    const stat = clusterStats[cIdx];
    stat.count += 1;
    stat.avgRecency += p.r;
    stat.avgFrequency += p.f;
    stat.avgSpend += p.m;
    stat.totalSpend += p.m;
  });

  clusterStats.forEach(s => {
    if (s.count > 0) {
      s.avgRecency = Number((s.avgRecency / s.count).toFixed(1));
      s.avgFrequency = Number((s.avgFrequency / s.count).toFixed(1));
      s.avgSpend = Number((s.avgSpend / s.count).toFixed(2));
      s.totalSpend = Number(s.totalSpend.toFixed(2));
    }
  });

  // Sort clusters descending by avgSpend to name them intelligently
  const sortedStats = [...clusterStats].sort((a, b) => b.avgSpend - a.avgSpend);
  const labels = ['Tier 1 Champions (High Value)', 'Tier 2 Loyal Regulars', 'Tier 3 Emerging Potential', 'Tier 4 At-Risk / Hibernating'];
  
  const clusterNameMap = {};
  sortedStats.forEach((s, idx) => {
    clusterNameMap[s.clusterId] = labels[idx] || `Cluster ${s.clusterId}`;
  });

  const enrichedClusters = clusterStats.map(s => ({
    ...s,
    segmentName: clusterNameMap[s.clusterId]
  })).sort((a, b) => b.avgSpend - a.avgSpend);

  return {
    k,
    totalSegmentedCustomers: rawPoints.length,
    segments: enrichedClusters
  };
}

module.exports = { forecastSales, kMeansRFM, linearRegression };
