#!/usr/bin/env node

/**
 * Umami Analytics Report Generator
 * 
 * Pulls events, stats, and pageviews from Umami Cloud API
 * and saves to JSON/CSV files.
 * 
 * Usage:
 *   node scripts/umami-report.mjs
 * 
 * Environment variables required (in .env file or shell):
 *   UMAMI_API_KEY     - Your Umami API key
 *   UMAMI_WEBSITE_ID  - Your website ID from Umami
 * 
 * Optional:
 *   UMAMI_API_HOST    - API host (default: https://api.umami.is)
 *   REPORT_DAYS       - Number of days to pull (default: 30)
 */

import fs from 'fs';
import path from 'path';

// Load .env file manually (no external dependency needed)
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) return;
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Don't override existing env vars
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
    console.log('📁 Loaded .env file');
  }
}

loadEnv();

// Configuration
const API_HOST = process.env.UMAMI_API_HOST || 'https://api.umami.is';
const API_KEY = process.env.UMAMI_API_KEY;
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;
const REPORT_DAYS = parseInt(process.env.REPORT_DAYS || '30', 10);

// Validate required env vars
if (!API_KEY) {
  console.error('❌ Error: UMAMI_API_KEY environment variable is required');
  console.error('   Get your API key from Umami Cloud → Settings → API Keys');
  process.exit(1);
}

if (!WEBSITE_ID) {
  console.error('❌ Error: UMAMI_WEBSITE_ID environment variable is required');
  console.error('   Find your website ID in Umami Cloud → Settings → Websites');
  process.exit(1);
}

// Calculate date range
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - REPORT_DAYS);

const startAt = startDate.getTime();
const endAt = endDate.getTime();

console.log('📊 Umami Report Generator');
console.log('========================');
console.log(`📅 Date range: ${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()} (${REPORT_DAYS} days)`);
console.log(`🌐 API Host: ${API_HOST}`);
console.log(`🆔 Website ID: ${WEBSITE_ID}`);
console.log('');

// Helper to make API requests
async function fetchUmami(endpoint, params = {}) {
  const url = new URL(`${API_HOST}/v1/websites/${WEBSITE_ID}${endpoint}`);
  
  // Add default params
  params.startAt = params.startAt || startAt;
  params.endAt = params.endAt || endAt;
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }

  return response.json();
}

// Convert array of objects to CSV
function toCSV(data, columns) {
  if (!data || data.length === 0) return '';
  
  const cols = columns || Object.keys(data[0]);
  const header = cols.join(',');
  const rows = data.map(row => 
    cols.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
}

// Save data to files
function saveReport(name, data) {
  const outputDir = path.join(process.cwd(), 'tmp', 'reports');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const jsonPath = path.join(outputDir, `${name}_${timestamp}.json`);
  const csvPath = path.join(outputDir, `${name}_${timestamp}.csv`);
  
  // Save JSON
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  console.log(`   📄 JSON: ${jsonPath}`);
  
  // Save CSV if data is an array
  if (Array.isArray(data) && data.length > 0) {
    fs.writeFileSync(csvPath, toCSV(data));
    console.log(`   📄 CSV:  ${csvPath}`);
  }
  
  return { jsonPath, csvPath };
}

// Main report functions
// Read a stat value, supporting both flat numbers and {value, prev} shape.
function readStat(field) {
  if (field === undefined || field === null) return null;
  if (typeof field === 'number') return field;
  if (typeof field === 'object' && 'value' in field) return field.value;
  return null;
}

// Format pageviews/visitors with comparison vs previous period when available.
function formatWithDelta(current, prev) {
  if (current === null || current === undefined) return 'N/A';
  if (prev === null || prev === undefined || prev === 0) return String(current);
  const delta = current - prev;
  const pct = Math.round((delta / prev) * 100);
  const sign = delta >= 0 ? '+' : '';
  return `${current} (${sign}${pct}% vs prev ${prev})`;
}

async function getStats() {
  console.log('📈 Fetching stats...');
  try {
    const stats = await fetchUmami('/stats');
    saveReport('stats', stats);
    const prev = stats.comparison || {};
    const pageviews = readStat(stats.pageviews);
    const visitors = readStat(stats.visitors);
    const bounces = readStat(stats.bounces);
    const totaltime = readStat(stats.totaltime);
    console.log(`   ✅ Pageviews: ${formatWithDelta(pageviews, readStat(prev.pageviews))}`);
    console.log(`   ✅ Visitors: ${formatWithDelta(visitors, readStat(prev.visitors))}`);
    console.log(`   ✅ Bounces: ${formatWithDelta(bounces, readStat(prev.bounces))}`);
    console.log(`   ✅ Total time: ${totaltime !== null ? totaltime + 's' : 'N/A'}`);
    return stats;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getPageviews() {
  console.log('📄 Fetching pageviews...');
  try {
    const pageviews = await fetchUmami('/pageviews', { unit: 'day' });
    saveReport('pageviews', pageviews.pageviews || pageviews);
    console.log(`   ✅ Retrieved ${(pageviews.pageviews || pageviews).length} days of data`);
    return pageviews;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getEvents() {
  console.log('⚡ Fetching events...');
  try {
    const events = await fetchUmami('/events', { unit: 'day' });
    saveReport('events', events.events || events);
    console.log(`   ✅ Retrieved ${(events.events || events).length} event records`);
    return events;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getEventNames() {
  console.log('🏷️  Fetching event names breakdown...');
  try {
    const metrics = await fetchUmami('/metrics', { type: 'event' });
    saveReport('event_names', metrics);
    console.log(`   ✅ Found ${metrics.length} unique event types:`);
    metrics.slice(0, 10).forEach(e => {
      console.log(`      - ${e.x}: ${e.y} occurrences`);
    });
    if (metrics.length > 10) {
      console.log(`      ... and ${metrics.length - 10} more`);
    }
    return metrics;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getPages() {
  console.log('📑 Fetching top pages...');
  try {
    const pages = await fetchUmami('/metrics', { type: 'url' });
    saveReport('pages', pages);
    console.log(`   ✅ Top pages:`);
    pages.slice(0, 5).forEach(p => {
      console.log(`      - ${p.x}: ${p.y} views`);
    });
    return pages;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getReferrers() {
  console.log('🔗 Fetching referrers...');
  try {
    const referrers = await fetchUmami('/metrics', { type: 'referrer' });
    saveReport('referrers', referrers);
    console.log(`   ✅ Found ${referrers.length} referrer sources`);
    referrers.slice(0, 5).forEach(r => {
      console.log(`      - ${r.x || '(direct)'}: ${r.y} visits`);
    });
    return referrers;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getBrowsers() {
  console.log('🌐 Fetching browsers...');
  try {
    const browsers = await fetchUmami('/metrics', { type: 'browser' });
    saveReport('browsers', browsers);
    console.log(`   ✅ Browser breakdown:`);
    browsers.slice(0, 5).forEach(b => {
      console.log(`      - ${b.x}: ${b.y} sessions`);
    });
    return browsers;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getDevices() {
  console.log('📱 Fetching devices...');
  try {
    const devices = await fetchUmami('/metrics', { type: 'device' });
    saveReport('devices', devices);
    console.log(`   ✅ Device breakdown:`);
    devices.forEach(d => {
      console.log(`      - ${d.x}: ${d.y} sessions`);
    });
    return devices;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function getCountries() {
  console.log('🌍 Fetching countries...');
  try {
    const countries = await fetchUmami('/metrics', { type: 'country' });
    saveReport('countries', countries);
    console.log(`   ✅ Top countries:`);
    countries.slice(0, 10).forEach(c => {
      console.log(`      - ${c.x}: ${c.y} visitors`);
    });
    return countries;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Run all reports
async function main() {
  const startTime = Date.now();
  
  try {
    await getStats();
    console.log('');
    
    await getPageviews();
    console.log('');
    
    await getEvents();
    console.log('');
    
    await getEventNames();
    console.log('');
    
    await getPages();
    console.log('');
    
    await getReferrers();
    console.log('');
    
    await getBrowsers();
    console.log('');
    
    await getDevices();
    console.log('');
    
    await getCountries();
    console.log('');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('========================');
    console.log(`✅ Report complete in ${duration}s`);
    console.log(`📁 Reports saved to: tmp/reports/`);
    
  } catch (error) {
    console.error('');
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
