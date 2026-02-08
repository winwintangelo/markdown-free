#!/usr/bin/env node

/**
 * Production Validation Script
 * 
 * Validates that key features are working correctly on the production site.
 * Simulates real user traffic and verifies Umami is tracking correctly.
 * 
 * Usage:
 *   node scripts/validate-production.mjs
 *   node scripts/validate-production.mjs --verbose
 *   node scripts/validate-production.mjs --simulate-traffic
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      if (!line || line.startsWith('#')) return;
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnv();

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.markdown.free';
const UMAMI_API_HOST = process.env.UMAMI_API_HOST || 'https://api.umami.is';
// Umami tracking is proxied through the site's own /ingest path
const UMAMI_INGEST_URL = `${process.env.PRODUCTION_URL || 'https://www.markdown.free'}/ingest`;
const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;
const VERBOSE = process.argv.includes('--verbose');
const SIMULATE_TRAFFIC = process.argv.includes('--simulate-traffic');

// Generate a unique session marker for this test run
const TEST_SESSION_ID = `test-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(message) {
  console.log(message);
}

function pass(test) {
  results.passed++;
  log(`  ✅ ${test}`);
}

function fail(test, reason) {
  results.failed++;
  log(`  ❌ ${test}`);
  if (reason) log(`     └─ ${reason}`);
}

function warn(test, reason) {
  results.warnings++;
  log(`  ⚠️  ${test}`);
  if (reason) log(`     └─ ${reason}`);
}

function verbose(message) {
  if (VERBOSE) log(`     ${message}`);
}

// ============================================================================
// Tests
// ============================================================================

async function testSiteAccessible() {
  log('\n🌐 Site Accessibility');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    if (response.ok) {
      pass(`Homepage loads (${response.status})`);
      verbose(`URL: ${PRODUCTION_URL}`);
    } else {
      fail(`Homepage loads`, `Status: ${response.status}`);
    }
  } catch (error) {
    fail(`Homepage loads`, error.message);
  }
}

async function testUmamiScript() {
  log('\n📊 Umami Analytics');
  
  try {
    const response = await fetch(PRODUCTION_URL);
    const html = await response.text();
    
    // Check if Umami script tag exists (proxied via /ingest)
    const hasUmamiScript = html.includes('/ingest/script.js');
    const hasDirectUmami = html.includes('cloud.umami.is');

    if (hasUmamiScript) {
      pass('Umami script tag present (proxied via /ingest)');
    } else {
      fail('Umami script tag present in HTML', 'Script tag not found - check NEXT_PUBLIC_UMAMI_WEBSITE_ID env var in Vercel');
    }

    if (hasDirectUmami) {
      warn('Direct cloud.umami.is reference found in HTML', 'Should be proxied via /ingest to bypass adblockers');
    } else {
      pass('No direct cloud.umami.is reference (adblocker-safe)');
    }
    
    // Check for website ID (try multiple patterns)
    const websiteIdMatch = html.match(/data-website-id="([^"]+)"/) || 
                           html.match(/data-website-id=\\?"([^"\\]+)/) ||
                           html.match(/websiteId['":\s]+['"]?([a-f0-9-]{36})/i);
    if (websiteIdMatch) {
      pass(`Website ID configured: ${websiteIdMatch[1].substring(0, 8)}...`);
    } else if (hasUmamiScript) {
      // If script exists but we can't parse ID, it might be inline/encoded
      warn('Website ID detection', 'Could not parse from HTML, but script is present');
    } else {
      fail('Website ID configured', 'data-website-id attribute not found');
    }
    
    // Check domain restriction
    const domainMatch = html.match(/data-domains="([^"]+)"/);
    if (domainMatch) {
      const configuredDomain = domainMatch[1];
      const productionDomain = new URL(PRODUCTION_URL).hostname;
      if (configuredDomain === productionDomain) {
        pass(`Domain restriction matches: ${configuredDomain}`);
      } else {
        warn(`Domain restriction mismatch`, `Script: ${configuredDomain}, Site: ${productionDomain}`);
      }
    }
    
  } catch (error) {
    fail('Umami script check', error.message);
  }
}

async function testUmamiAPI() {
  log('\n📈 Umami API (Recent Data)');
  
  if (!UMAMI_API_KEY || !UMAMI_WEBSITE_ID) {
    warn('Umami API check', 'UMAMI_API_KEY or UMAMI_WEBSITE_ID not set in .env');
    return;
  }
  
  try {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const url = `${UMAMI_API_HOST}/v1/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${oneDayAgo}&endAt=${now}`;
    
    const response = await fetch(url, {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      fail('Umami API accessible', `Status: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    
    pass('Umami API accessible');
    verbose(`Response: ${JSON.stringify(data)}`);
    
    // Check for recent pageviews
    const pageviews = data.pageviews?.value || data.pageviews || 0;
    const visitors = data.visitors?.value || data.visitors || 0;
    
    if (pageviews > 0) {
      pass(`Recent pageviews (24h): ${pageviews}`);
    } else {
      warn(`No pageviews in last 24 hours`, 'This could indicate a tracking issue');
    }
    
    if (visitors > 0) {
      pass(`Recent visitors (24h): ${visitors}`);
    } else {
      warn(`No visitors in last 24 hours`, 'This could indicate a tracking issue');
    }
    
    // Check for recent events
    const eventsUrl = `${UMAMI_API_HOST}/v1/websites/${UMAMI_WEBSITE_ID}/metrics?startAt=${oneDayAgo}&endAt=${now}&type=event`;
    const eventsResponse = await fetch(eventsUrl, {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      const eventCount = events.length || 0;
      if (eventCount > 0) {
        pass(`Recent events (24h): ${eventCount} event types`);
        verbose(`Events: ${events.slice(0, 5).map(e => e.x).join(', ')}`);
      } else {
        warn(`No custom events in last 24 hours`);
      }
    }
    
  } catch (error) {
    fail('Umami API check', error.message);
  }
}

async function testLocalizedPages() {
  log('\n🌍 Localized Pages');
  
  const pages = [
    { path: '/it', name: 'Italian homepage' },
    { path: '/es', name: 'Spanish homepage' },
    { path: '/it/convertire-markdown-pdf', name: 'Italian intent page' },
    { path: '/es/convertir-markdown-pdf', name: 'Spanish intent page' },
  ];
  
  for (const page of pages) {
    try {
      const response = await fetch(`${PRODUCTION_URL}${page.path}`);
      if (response.ok) {
        pass(`${page.name} (${page.path})`);
      } else {
        fail(`${page.name}`, `Status: ${response.status}`);
      }
    } catch (error) {
      fail(`${page.name}`, error.message);
    }
  }
}

async function testSitemap() {
  log('\n🗺️  Sitemap');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/sitemap.xml`);
    
    if (!response.ok) {
      fail('Sitemap accessible', `Status: ${response.status}`);
      return;
    }
    
    pass('Sitemap accessible');
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('xml')) {
      pass(`Content-Type: ${contentType}`);
    } else {
      warn(`Content-Type`, `Expected XML, got: ${contentType}`);
    }
    
    const xml = await response.text();
    
    // Count URLs
    const urlCount = (xml.match(/<loc>/g) || []).length;
    pass(`Contains ${urlCount} URLs`);
    
    // Check for intent pages
    const hasIntentPages = xml.includes('convertire-markdown-pdf') && 
                           xml.includes('convertir-markdown-pdf');
    if (hasIntentPages) {
      pass('Intent pages included in sitemap');
    } else {
      fail('Intent pages included in sitemap');
    }
    
  } catch (error) {
    fail('Sitemap check', error.message);
  }
}

async function testRobotsTxt() {
  log('\n🤖 Robots.txt');
  
  try {
    const response = await fetch(`${PRODUCTION_URL}/robots.txt`);
    
    if (response.ok) {
      pass('robots.txt accessible');
      const text = await response.text();
      
      if (text.includes('Sitemap:')) {
        pass('Sitemap reference present');
      } else {
        warn('No sitemap reference in robots.txt');
      }
    } else {
      warn('robots.txt not found', `Status: ${response.status}`);
    }
  } catch (error) {
    warn('robots.txt check', error.message);
  }
}

// ============================================================================
// Traffic Simulation
// ============================================================================

/**
 * Simulate a real user browsing session by making requests with proper headers
 * and triggering the Umami tracking endpoint directly
 */
async function simulateTraffic() {
  log('\n🚗 Simulating User Traffic');
  log(`   Session marker: ${TEST_SESSION_ID}`);
  
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];
  
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  const screenWidth = 1920;
  const screenHeight = 1080;
  
  // Pages to visit (simulating a real user journey)
  const pages = [
    { path: '/', title: 'Homepage' },
    { path: '/it', title: 'Italian Homepage' },
    { path: '/it/convertire-markdown-pdf', title: 'Italian Intent Page' },
    { path: '/es', title: 'Spanish Homepage' },
  ];
  
  let visitedPages = 0;
  
  for (const page of pages) {
    try {
      // Step 1: Fetch the page (like a real browser)
      const pageResponse = await fetch(`${PRODUCTION_URL}${page.path}`, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': page.path === '/' ? '' : `${PRODUCTION_URL}/`,
          'DNT': '1',
        },
      });
      
      if (!pageResponse.ok) {
        warn(`Visit ${page.title}`, `Status: ${pageResponse.status}`);
        continue;
      }
      
      // Step 2: Send tracking request to Umami (simulating the script.js behavior)
      const trackingPayload = {
        payload: {
          hostname: new URL(PRODUCTION_URL).hostname,
          language: 'en-US',
          referrer: page.path === '/' ? '' : `${PRODUCTION_URL}/`,
          screen: `${screenWidth}x${screenHeight}`,
          title: page.title,
          url: page.path,
          website: UMAMI_WEBSITE_ID,
          name: 'validation_test', // Custom event to identify test traffic
          data: { test_session: TEST_SESSION_ID },
        },
        type: 'event',
      };
      
      const trackingResponse = await fetch(`${UMAMI_INGEST_URL}/api/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Origin': PRODUCTION_URL,
          'Referer': `${PRODUCTION_URL}${page.path}`,
        },
        body: JSON.stringify(trackingPayload),
      });
      
      if (trackingResponse.ok) {
        pass(`Visited & tracked: ${page.title} (${page.path})`);
        visitedPages++;
        verbose(`Tracking response: ${trackingResponse.status}`);
      } else {
        warn(`Track ${page.title}`, `Tracking response: ${trackingResponse.status}`);
        visitedPages++;
      }
      
      // Small delay between requests (like a real user)
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      fail(`Visit ${page.title}`, error.message);
    }
  }
  
  log(`\n   📊 Visited ${visitedPages}/${pages.length} pages`);
  log(`   ⏳ Waiting 5 seconds for Umami to process...`);
  
  // Wait for Umami to process the events
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return visitedPages;
}

/**
 * Verify that the simulated traffic was recorded in Umami
 */
async function verifySimulatedTraffic() {
  log('\n🔍 Verifying Traffic in Umami');
  
  if (!UMAMI_API_KEY || !UMAMI_WEBSITE_ID) {
    warn('Traffic verification', 'UMAMI_API_KEY or UMAMI_WEBSITE_ID not set');
    return;
  }
  
  try {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Check recent stats
    const statsUrl = `${UMAMI_API_HOST}/v1/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${fiveMinutesAgo}&endAt=${now}`;
    
    const statsResponse = await fetch(statsUrl, {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (!statsResponse.ok) {
      fail('Fetch recent stats', `Status: ${statsResponse.status}`);
      return;
    }
    
    const stats = await statsResponse.json();
    const recentPageviews = stats.pageviews?.value || stats.pageviews || 0;
    const recentVisitors = stats.visitors?.value || stats.visitors || 0;
    
    log(`\n   📈 Stats (last 5 minutes):`);
    log(`      Pageviews: ${recentPageviews}`);
    log(`      Visitors: ${recentVisitors}`);
    
    if (recentPageviews > 0) {
      pass(`Recent pageviews detected: ${recentPageviews}`);
    } else {
      warn('No recent pageviews', 'Traffic may not be recording');
    }
    
    // Check for our test event
    const eventsUrl = `${UMAMI_API_HOST}/v1/websites/${UMAMI_WEBSITE_ID}/metrics?startAt=${fiveMinutesAgo}&endAt=${now}&type=event`;
    
    const eventsResponse = await fetch(eventsUrl, {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || []);
      
      const testEvents = events.filter(e => 
        e.x === 'validation_test' || e.eventName === 'validation_test'
      );
      
      if (testEvents.length > 0) {
        pass(`Test events recorded: ${testEvents.length}`);
        verbose(`Events: ${JSON.stringify(testEvents.slice(0, 3))}`);
      } else {
        // Check total event count
        const allEventCount = events.length;
        if (allEventCount > 0) {
          pass(`Events in last 5 min: ${events.map(e => e.x).join(', ')}`);
        } else {
          warn('No events in last 5 minutes');
        }
      }
    }
    
    // Check recent pageview URLs
    const pageviewsUrl = `${UMAMI_API_HOST}/v1/websites/${UMAMI_WEBSITE_ID}/metrics?startAt=${fiveMinutesAgo}&endAt=${now}&type=url`;
    
    const pageviewsResponse = await fetch(pageviewsUrl, {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (pageviewsResponse.ok) {
      const pageviews = await pageviewsResponse.json();
      if (pageviews.length > 0) {
        log(`\n   📄 Recent pages visited:`);
        pageviews.slice(0, 5).forEach(pv => {
          log(`      ${pv.x}: ${pv.y} views`);
        });
        
        // Check if our test pages were recorded
        const testPages = ['/', '/it', '/es', '/it/convertire-markdown-pdf'];
        const recordedTestPages = pageviews.filter(pv => testPages.includes(pv.x));
        
        if (recordedTestPages.length > 0) {
          pass(`Test pages recorded: ${recordedTestPages.map(p => p.x).join(', ')}`);
        }
      }
    }
    
  } catch (error) {
    fail('Traffic verification', error.message);
  }
}

/**
 * Get real-time session data
 */
async function checkRealtimeSessions() {
  log('\n⚡ Real-time Sessions');
  
  if (!UMAMI_API_KEY || !UMAMI_WEBSITE_ID) {
    warn('Real-time check', 'API credentials not set');
    return;
  }
  
  try {
    // Get active visitors (real-time)
    const realtimeUrl = `${UMAMI_API_HOST}/v1/websites/${UMAMI_WEBSITE_ID}/active`;
    
    const response = await fetch(realtimeUrl, {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const activeVisitors = data.x || data.visitors || data || 0;
      
      if (typeof activeVisitors === 'number') {
        pass(`Active visitors right now: ${activeVisitors}`);
      } else {
        log(`   Active visitors data: ${JSON.stringify(data)}`);
      }
    } else {
      verbose(`Real-time endpoint returned: ${response.status}`);
    }
    
    // Get recent sessions
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const sessionsUrl = `${UMAMI_API_HOST}/v1/websites/${UMAMI_WEBSITE_ID}/sessions?startAt=${oneHourAgo}&endAt=${now}`;
    
    const sessionsResponse = await fetch(sessionsUrl, {
      headers: {
        'x-umami-api-key': UMAMI_API_KEY,
        'Accept': 'application/json',
      },
    });
    
    if (sessionsResponse.ok) {
      const sessions = await sessionsResponse.json();
      const sessionCount = sessions.data?.length || sessions.length || 0;
      
      pass(`Sessions (last hour): ${sessionCount}`);
      
      if (sessionCount > 0 && VERBOSE) {
        const recentSessions = (sessions.data || sessions).slice(0, 3);
        recentSessions.forEach((s, i) => {
          log(`      Session ${i + 1}: ${s.browser || 'unknown'} from ${s.country || 'unknown'}`);
        });
      }
    }
    
  } catch (error) {
    warn('Real-time sessions', error.message);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🔍 Production Validation');
  console.log('========================');
  console.log(`Target: ${PRODUCTION_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  if (SIMULATE_TRAFFIC) {
    console.log(`Mode: Traffic Simulation Enabled`);
  }
  
  await testSiteAccessible();
  await testUmamiScript();
  await testUmamiAPI();
  await testLocalizedPages();
  await testSitemap();
  await testRobotsTxt();
  
  // Traffic simulation (if enabled)
  if (SIMULATE_TRAFFIC) {
    await simulateTraffic();
    await verifySimulatedTraffic();
  }
  
  // Always check real-time sessions
  await checkRealtimeSessions();
  
  // Summary
  console.log('\n════════════════════════════════════════');
  console.log('📋 SUMMARY');
  console.log('════════════════════════════════════════');
  console.log(`  ✅ Passed:   ${results.passed}`);
  console.log(`  ❌ Failed:   ${results.failed}`);
  console.log(`  ⚠️  Warnings: ${results.warnings}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Some checks failed. Please review the issues above.');
    process.exit(1);
  } else if (results.warnings > 0) {
    console.log('\n⚠️  All critical checks passed, but there are warnings.');
    process.exit(0);
  } else {
    console.log('\n✅ All checks passed!');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

