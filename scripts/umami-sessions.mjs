#!/usr/bin/env node

/**
 * Umami Session Journey Report
 * 
 * Pulls individual session data to show the sequence of events
 * for each user visit (view, scroll, upload, convert, etc.)
 * 
 * Usage:
 *   node scripts/umami-sessions.mjs
 */

import fs from 'fs';
import path from 'path';

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

const API_HOST = process.env.UMAMI_API_HOST || 'https://api.umami.is';
const API_KEY = process.env.UMAMI_API_KEY;
const WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;
const REPORT_DAYS = parseInt(process.env.REPORT_DAYS || '30', 10);

// Exclude test locations (testers)
const EXCLUDED_LOCATIONS = [
  { city: 'Plano', country: 'US' },
];

// Known data center cities (likely crawlers/bots)
const DATA_CENTER_CITIES = [
  'Falkenstein',      // Hetzner (Germany)
  'Ashburn',          // AWS US-East (Virginia)
  'Council Bluffs',   // Google (Iowa)
  'The Dalles',       // Google (Oregon)
  'Dublin',           // AWS EU (often)
  'Frankfurt',        // AWS EU
  'Singapore',        // Various cloud providers
  'Mumbai',           // AWS Asia
  'São Paulo',        // AWS South America
  'North Richland Hills', // Possibly VPN/proxy
];

// Bot browser patterns
const BOT_BROWSERS = [
  'headless',
  'phantomjs', 
  'selenium',
  'puppeteer',
];

// Check for --include-testers flag
const INCLUDE_TESTERS = process.argv.includes('--include-testers');
const INCLUDE_CRAWLERS = process.argv.includes('--include-crawlers');

if (!API_KEY || !WEBSITE_ID) {
  console.error('❌ Missing UMAMI_API_KEY or UMAMI_WEBSITE_ID in .env');
  process.exit(1);
}

// Check if session should be excluded (tester)
function isExcludedLocation(session) {
  if (INCLUDE_TESTERS) return false;
  return EXCLUDED_LOCATIONS.some(loc => 
    session.city === loc.city && session.country === loc.country
  );
}

// Check if session looks like a crawler/bot
function isCrawler(session, events = []) {
  if (INCLUDE_CRAWLERS) return false;
  
  const reasons = [];
  const browser = (session.browser || '').toLowerCase();
  const os = (session.os || '').toLowerCase();
  const isDataCenter = DATA_CENTER_CITIES.includes(session.city);
  
  // Check for engagement (real user signals)
  const hasEngagement = events.some(e => 
    ['scroll_depth', 'time_on_page', 'upload_hover', 'paste_toggle_click', 
     'upload_start', 'convert_success', 'feedback_submit'].includes(e.eventName)
  );
  
  // If user has engagement events, they're likely real - don't flag as crawler
  if (hasEngagement) {
    return false;
  }
  
  // 1. Known data center city + no engagement = definitely a crawler
  if (isDataCenter) {
    reasons.push(`data-center:${session.city}`);
  }
  
  // 2. Bot browser patterns (always flag)
  if (BOT_BROWSERS.some(bot => browser.includes(bot))) {
    reasons.push(`bot-browser:${session.browser}`);
  }
  
  // 3. Linux + Chrome + laptop/desktop + single pageview + no engagement
  //    (Only flag this combo in data center cities - could be real Linux users elsewhere)
  const isLinux = os.includes('linux') && !os.includes('android');
  const isChrome = browser === 'chrome';
  const isDesktopDevice = ['laptop', 'desktop'].includes(session.device);
  const hasOnlyPageview = events.length <= 1 || 
    events.every(e => e.eventType === 1 || !e.eventName);
  
  if (isDataCenter && isLinux && isChrome && isDesktopDevice && hasOnlyPageview) {
    if (!reasons.includes(`data-center:${session.city}`)) {
      reasons.push('linux-chrome-datacenter');
    }
  }
  
  return reasons.length > 0 ? reasons : false;
}

const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - REPORT_DAYS);
const startAt = startDate.getTime();
const endAt = endDate.getTime();

console.log('🔍 Umami Session Journey Report');
console.log('================================');
console.log(`📅 Date range: ${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()}`);

const exclusions = [];
if (!INCLUDE_TESTERS) {
  exclusions.push(`testers (${EXCLUDED_LOCATIONS.map(l => l.city).join(', ')})`);
}
if (!INCLUDE_CRAWLERS) {
  exclusions.push(`crawlers/bots`);
}
if (exclusions.length > 0) {
  console.log(`🚫 Excluding: ${exclusions.join(', ')}`);
  console.log(`   Flags: --include-testers, --include-crawlers`);
}
console.log('');

async function fetchUmami(endpoint, params = {}) {
  const url = new URL(`${API_HOST}/v1/websites/${WEBSITE_ID}${endpoint}`);
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

// Country code to name mapping
const COUNTRY_NAMES = {
  'US': 'United States', 'CA': 'Canada', 'MX': 'Mexico', 'GB': 'United Kingdom',
  'DE': 'Germany', 'FR': 'France', 'ES': 'Spain', 'IT': 'Italy', 'NL': 'Netherlands',
  'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'PL': 'Poland', 'SE': 'Sweden',
  'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland', 'PT': 'Portugal', 'IE': 'Ireland',
  'AU': 'Australia', 'NZ': 'New Zealand', 'JP': 'Japan', 'KR': 'South Korea',
  'CN': 'China', 'IN': 'India', 'SG': 'Singapore', 'HK': 'Hong Kong', 'TW': 'Taiwan',
  'BR': 'Brazil', 'AR': 'Argentina', 'CL': 'Chile', 'CO': 'Colombia',
  'SA': 'Saudi Arabia', 'AE': 'UAE', 'IL': 'Israel', 'TR': 'Turkey',
  'RU': 'Russia', 'UA': 'Ukraine', 'ZA': 'South Africa', 'NG': 'Nigeria',
  'EG': 'Egypt', 'ID': 'Indonesia', 'TH': 'Thailand', 'VN': 'Vietnam', 'PH': 'Philippines',
  'MY': 'Malaysia', 'PK': 'Pakistan', 'BD': 'Bangladesh',
};

function getCountryName(code) {
  return COUNTRY_NAMES[code] || code;
}

// Get sessions list
async function getSessions() {
  console.log('📋 Fetching sessions...');
  try {
    const sessions = await fetchUmami('/sessions', {
      startAt,
      endAt,
    });
    console.log(`   ✅ Found ${sessions.data?.length || 0} sessions`);
    
    // Debug: show available fields from first session
    const data = sessions.data || sessions;
    if (data.length > 0) {
      console.log(`   📍 Session fields: ${Object.keys(data[0]).join(', ')}`);
    }
    
    return data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return [];
  }
}

// Get activity/events for a specific session
async function getSessionActivity(sessionId) {
  try {
    const activity = await fetchUmami(`/sessions/${sessionId}/activity`, {
      startAt,
      endAt,
    });
    return activity;
  } catch (error) {
    // Try alternative endpoint
    try {
      const events = await fetchUmami(`/sessions/${sessionId}`, {
        startAt,
        endAt,
      });
      return events;
    } catch {
      return null;
    }
  }
}

// Event type icons
const EVENT_ICONS = {
  'section_visible': '👁️ ',
  'scroll_depth': '📜',
  'time_on_page': '⏱️ ',
  'upload_hover': '🎯',
  'upload_start': '📤',
  'upload_error': '❌',
  'paste_toggle_click': '📋',
  'convert_success': '✅',
  'nav_click': '🔗',
  'feedback_click': '💬',
  'feedback_submit': '📩',
  'sample_click': '📝',
  'locale_pageview': '🌐',
  'locale_conversion': '🌍',
  'language_suggestion_shown': '🗣️ ',
  'language_switched': '🔄',
  'language_suggestion_dismissed': '❎',
};

// Format event for display
function formatEvent(event) {
  const time = new Date(event.createdAt || event.timestamp || Date.now()).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  const eventType = event.eventType;
  const eventName = event.eventName || '';
  const urlPath = event.urlPath || '';
  
  // Pageview (eventType 1)
  if (eventType === 1) {
    return `${time} │ 📄 Viewed page: ${urlPath}`;
  }
  
  // Custom event (eventType 2)
  const icon = EVENT_ICONS[eventName] || '⚡';
  return `${time} │ ${icon} ${eventName}`;
}

// Get all pageviews and events in time order
async function getActivityStream() {
  console.log('📊 Fetching activity stream...');
  
  try {
    // Get pageviews
    const pageviews = await fetchUmami('/pageviews', {
      startAt,
      endAt,
      unit: 'hour',
    });
    
    // Get events with data
    const eventsData = await fetchUmami('/events/series', {
      startAt,
      endAt,
      unit: 'hour',
    });
    
    return { pageviews, events: eventsData };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Get raw event data with session info
async function getRawEvents() {
  console.log('🔬 Fetching raw event data...');
  
  try {
    // Try to get detailed event data
    const response = await fetch(`${API_HOST}/v1/websites/${WEBSITE_ID}/events?startAt=${startAt}&endAt=${endAt}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Build user journeys from available data
async function buildUserJourneys() {
  console.log('🛤️  Building user journeys...\n');
  
  const allSessions = await getSessions();
  
  if (!allSessions || allSessions.length === 0) {
    console.log('   No sessions found. Trying alternative approach...\n');
    
    // Try to get raw events
    const rawEvents = await getRawEvents();
    if (rawEvents) {
      console.log(`   Found raw event data`);
      return rawEvents;
    }
    return null;
  }
  
  // Filter out excluded locations (testers) - first pass
  const sessionsAfterTesters = allSessions.filter(s => !isExcludedLocation(s));
  const testerCount = allSessions.length - sessionsAfterTesters.length;
  
  if (testerCount > 0) {
    console.log(`   🧑‍💻 Excluded ${testerCount} tester session(s)`);
  }
  
  const journeys = [];
  const crawlerSessions = [];
  let displayedCount = 0;
  
  // Process each session and check for crawlers
  for (let i = 0; i < sessionsAfterTesters.length; i++) {
    const session = sessionsAfterTesters[i];
    const sessionId = session.id || session.sessionId;
    
    // Get session details FIRST to check for crawler
    const activity = await getSessionActivity(sessionId);
    
    // Check if this is a crawler
    const crawlerReasons = isCrawler(session, activity || []);
    if (crawlerReasons) {
      crawlerSessions.push({ 
        session, 
        reasons: crawlerReasons,
        city: session.city,
        country: session.country,
      });
      continue; // Skip this session
    }
    
    // Now display the session (only if not a crawler)
    displayedCount++;
    const countryCode = session.country || 'Unknown';
    const countryName = getCountryName(countryCode);
    const city = session.city || session.subdivision1 || '';
    const region = session.subdivision1 || session.region || '';
    const locationStr = city && city !== region 
      ? `${city}, ${countryName}` 
      : `${countryName}`;
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`👤 Session ${displayedCount}: ${sessionId?.substring(0, 8)}...`);
    console.log(`   📍 ${locationStr} (${countryCode})`);
    console.log(`   💻 ${session.device || 'Unknown'} | ${session.browser || 'Unknown'} | ${session.os || ''}`);
    console.log(`   🕐 ${new Date(session.createdAt || session.firstAt).toLocaleString()}`);
    
    if (activity && Array.isArray(activity)) {
      // Sort by time (oldest first)
      const sorted = [...activity].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // Deduplicate consecutive section_visible events
      const deduped = sorted.filter((event, idx) => {
        if (idx === 0) return true;
        const prev = sorted[idx - 1];
        // Skip if same event type within 1 second
        if (event.eventName === prev.eventName && 
            event.eventName === 'section_visible' &&
            Math.abs(new Date(event.createdAt) - new Date(prev.createdAt)) < 1000) {
          return false;
        }
        return true;
      });
      
      console.log(`   📝 Journey (${deduped.length} events):`);
      deduped.slice(0, 20).forEach(event => {
        console.log(`      ${formatEvent(event)}`);
      });
      if (deduped.length > 20) {
        console.log(`      ... and ${deduped.length - 20} more events`);
      }
      
      journeys.push({
        sessionId,
        location: {
          country: session.country,
          countryName: getCountryName(session.country),
          city: session.city || null,
          region: session.subdivision1 || session.region || null,
        },
        device: session.device,
        browser: session.browser,
        os: session.os || null,
        language: session.language || null,
        startTime: session.createdAt || session.firstAt,
        events: activity,
      });
    } else if (activity) {
      console.log(`   📝 Activity:`, JSON.stringify(activity, null, 2).substring(0, 200) + '...');
      journeys.push({
        sessionId,
        location: {
          country: session.country,
          countryName: getCountryName(session.country),
          city: session.city || null,
          region: session.subdivision1 || session.region || null,
        },
        device: session.device,
        browser: session.browser,
        os: session.os || null,
        language: session.language || null,
        startTime: session.createdAt || session.firstAt,
        activity,
      });
    } else {
      console.log(`   ⚠️  No detailed activity available`);
      journeys.push({
        sessionId,
        location: {
          country: session.country,
          countryName: getCountryName(session.country),
          city: session.city || null,
          region: session.subdivision1 || session.region || null,
        },
        device: session.device,
        browser: session.browser,
        os: session.os || null,
        language: session.language || null,
        startTime: session.createdAt || session.firstAt,
        events: [],
      });
    }
  }
  
  // Show crawler summary
  if (crawlerSessions.length > 0) {
    console.log(`\n🤖 EXCLUDED CRAWLERS/BOTS: ${crawlerSessions.length} session(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Group by city
    const byCity = {};
    crawlerSessions.forEach(c => {
      const key = `${c.city || 'Unknown'}, ${getCountryName(c.country)}`;
      if (!byCity[key]) byCity[key] = [];
      byCity[key].push(c.reasons);
    });
    
    Object.entries(byCity).forEach(([city, reasons]) => {
      const uniqueReasons = [...new Set(reasons.flat())];
      console.log(`   📍 ${city}: ${reasons.length} session(s)`);
      console.log(`      Reasons: ${uniqueReasons.join(', ')}`);
    });
  }
  
  console.log(`\n📊 Real user sessions: ${journeys.length}`);
  
  return journeys;
}

// Save journey report
function saveJourneys(journeys) {
  const outputDir = path.join(process.cwd(), 'tmp', 'reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const jsonPath = path.join(outputDir, `journeys_${timestamp}.json`);
  
  fs.writeFileSync(jsonPath, JSON.stringify(journeys, null, 2));
  console.log(`\n📁 Saved to: ${jsonPath}`);
}

// Alternative: Build funnel from aggregate data
async function buildFunnel() {
  console.log('\n📈 Building conversion funnel from aggregate data...\n');
  
  try {
    const eventNames = await fetchUmami('/metrics', { 
      type: 'event',
      startAt,
      endAt,
    });
    
    // Define funnel stages
    const funnelStages = [
      { name: 'Page View', events: ['section_visible'] },
      { name: 'Showed Interest', events: ['upload_hover', 'scroll_depth', 'time_on_page'] },
      { name: 'Tried Input', events: ['paste_toggle_click', 'upload_start'] },
      { name: 'Upload Started', events: ['upload_start'] },
      { name: 'Conversion', events: ['convert_success'] },
    ];
    
    console.log('┌────────────────────────────────────────────────────┐');
    console.log('│              CONVERSION FUNNEL                     │');
    console.log('├────────────────────────────────────────────────────┤');
    
    let prevCount = null;
    funnelStages.forEach(stage => {
      const count = stage.events.reduce((sum, eventName) => {
        const found = eventNames.find(e => e.x === eventName);
        return sum + (found?.y || 0);
      }, 0);
      
      const dropoff = prevCount ? Math.round((1 - count / prevCount) * 100) : 0;
      const bar = '█'.repeat(Math.min(30, Math.round(count / 3)));
      
      console.log(`│ ${stage.name.padEnd(18)} │ ${String(count).padStart(4)} │ ${bar.padEnd(30)} │`);
      if (prevCount && dropoff > 0) {
        console.log(`│ ${''.padEnd(18)} │ ${('↓' + dropoff + '%').padStart(4)} │ ${''.padEnd(30)} │`);
      }
      
      prevCount = count || prevCount;
    });
    
    console.log('└────────────────────────────────────────────────────┘');
    
    // Calculate key metrics
    const uploadStarts = eventNames.find(e => e.x === 'upload_start')?.y || 0;
    const conversions = eventNames.find(e => e.x === 'convert_success')?.y || 0;
    const sectionViews = eventNames.find(e => e.x === 'section_visible')?.y || 0;
    
    console.log('\n📊 Key Metrics:');
    console.log(`   • Upload Start Rate: ${sectionViews > 0 ? Math.round(uploadStarts / sectionViews * 100) : 0}% (${uploadStarts}/${sectionViews})`);
    console.log(`   • Conversion Rate (from uploads): ${uploadStarts > 0 ? Math.round(conversions / uploadStarts * 100) : 0}% (${conversions}/${uploadStarts})`);
    
    return eventNames;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Categorize sessions
function categorizeSession(events) {
  if (!events || events.length === 0) return 'unknown';
  
  const eventNames = events.map(e => e.eventName).filter(Boolean);
  
  if (eventNames.includes('convert_success')) return 'converted';
  if (eventNames.includes('upload_start') || eventNames.includes('sample_click')) return 'tried_upload';
  if (eventNames.includes('upload_hover') || eventNames.includes('paste_toggle_click')) return 'showed_interest';
  if (eventNames.includes('scroll_depth') || eventNames.includes('time_on_page')) return 'engaged';
  if (eventNames.includes('section_visible')) return 'viewed';
  return 'bounced';
}

// Summarize all sessions
function summarizeSessions(journeys) {
  console.log('\n📊 SESSION SUMMARY BY BEHAVIOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const categories = {
    converted: { label: '✅ Converted (completed export)', sessions: [] },
    tried_upload: { label: '📤 Tried upload (but didnt convert)', sessions: [] },
    showed_interest: { label: '🎯 Showed interest (hover/paste toggle)', sessions: [] },
    engaged: { label: '📜 Engaged (scrolled/stayed)', sessions: [] },
    viewed: { label: '👁️  Viewed sections', sessions: [] },
    bounced: { label: '🚪 Bounced (pageview only)', sessions: [] },
  };
  
  journeys.forEach(j => {
    const category = categorizeSession(j.events || j.activity);
    if (categories[category]) {
      categories[category].sessions.push(j);
    }
  });
  
  Object.entries(categories).forEach(([key, cat]) => {
    const count = cat.sessions.length;
    const pct = Math.round(count / journeys.length * 100);
    const bar = '█'.repeat(Math.round(pct / 3));
    console.log(`${cat.label}`);
    console.log(`   ${count} sessions (${pct}%) ${bar}`);
    
    // Show countries for this category
    const countries = cat.sessions.map(s => s.location?.country || s.country).filter(Boolean);
    if (countries.length > 0) {
      const countryCount = {};
      countries.forEach(c => countryCount[c] = (countryCount[c] || 0) + 1);
      const top = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
      console.log(`   📍 ${top.map(([c, n]) => `${getCountryName(c)} (${n})`).join(', ')}`);
    }
    console.log('');
  });
}

// Calculate locale-specific KPIs
async function calculateLocaleKPIs() {
  console.log('\n🌐 LOCALE-SPECIFIC KPIs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const eventNames = await fetchUmami('/metrics', { 
      type: 'event',
      startAt,
      endAt,
    });
    
    // Get locale-specific events
    const localePageviews = eventNames.find(e => e.x === 'locale_pageview')?.y || 0;
    const localeConversions = eventNames.find(e => e.x === 'locale_conversion')?.y || 0;
    const langSuggestionShown = eventNames.find(e => e.x === 'language_suggestion_shown')?.y || 0;
    const langSwitched = eventNames.find(e => e.x === 'language_switched')?.y || 0;
    const langDismissed = eventNames.find(e => e.x === 'language_suggestion_dismissed')?.y || 0;
    
    // Activation events
    const sampleClicks = eventNames.find(e => e.x === 'sample_click')?.y || 0;
    const uploadStarts = eventNames.find(e => e.x === 'upload_start')?.y || 0;
    const pasteToggles = eventNames.find(e => e.x === 'paste_toggle_click')?.y || 0;
    const totalActivations = sampleClicks + uploadStarts + pasteToggles;
    
    // Conversion events
    const pdfExports = eventNames.find(e => e.x === 'convert_success')?.y || 0;
    
    console.log('\n📊 Language Banner Performance:');
    console.log(`   • Suggestions Shown: ${langSuggestionShown}`);
    console.log(`   • Language Switched: ${langSwitched}`);
    console.log(`   • Dismissed: ${langDismissed}`);
    if (langSuggestionShown > 0) {
      const switchRate = Math.round(langSwitched / langSuggestionShown * 100);
      const dismissRate = Math.round(langDismissed / langSuggestionShown * 100);
      console.log(`   • Switch Rate: ${switchRate}% (${langSwitched}/${langSuggestionShown})`);
      console.log(`   • Dismiss Rate: ${dismissRate}% (${langDismissed}/${langSuggestionShown})`);
    }
    
    console.log('\n📊 Activation Rate:');
    console.log(`   • Sample Clicks: ${sampleClicks}`);
    console.log(`   • Upload Starts: ${uploadStarts}`);
    console.log(`   • Paste Toggles: ${pasteToggles}`);
    console.log(`   • Total Activations: ${totalActivations}`);
    if (localePageviews > 0) {
      const activationRate = Math.round(totalActivations / localePageviews * 100);
      console.log(`   • Activation Rate: ${activationRate}% (${totalActivations}/${localePageviews} pageviews)`);
    }
    
    console.log('\n📊 Conversion Rate:');
    console.log(`   • PDF Exports: ${pdfExports}`);
    if (totalActivations > 0) {
      const conversionRate = Math.round(pdfExports / totalActivations * 100);
      console.log(`   • Conversion Rate (from activated): ${conversionRate}% (${pdfExports}/${totalActivations})`);
    }
    
    console.log('\n📊 Locale Pageviews:');
    console.log(`   • Tracked: ${localePageviews}`);
    console.log(`   • With Conversions: ${localeConversions}`);
    
    console.log('\n💡 Tip: Filter by event data properties in Umami dashboard');
    console.log('   to see locale-specific metrics (e.g., locale=it, locale=es)');
    
    return {
      langSuggestionShown,
      langSwitched,
      langDismissed,
      totalActivations,
      pdfExports,
      localePageviews,
      localeConversions,
    };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Main
async function main() {
  try {
    // Try to get session journeys
    const journeys = await buildUserJourneys();
    
    if (journeys && journeys.length > 0) {
      saveJourneys(journeys);
      summarizeSessions(journeys);
    }
    
    // Build funnel from aggregate data
    await buildFunnel();
    
    // Calculate locale-specific KPIs
    await calculateLocaleKPIs();
    
    console.log('\n================================');
    console.log('✅ Session analysis complete');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
