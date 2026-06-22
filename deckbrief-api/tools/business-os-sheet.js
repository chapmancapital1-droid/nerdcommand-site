/**
 * DeckBrief Business OS — Google Apps Script
 *
 * INSTALL INSTRUCTIONS:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this entire file, replacing the default code
 * 3. Set your DECKBRIEF_API_URL and DECKBRIEF_API_KEY constants below
 * 4. Run buildBusinessOS() once to generate all tabs
 * 5. Run refreshData() on a daily trigger to keep it live
 */

const DECKBRIEF_API_URL = 'https://deckbrief-api.up.railway.app';
const DECKBRIEF_API_KEY = 'YOUR_API_SECRET_KEY_HERE';

// ── Main entry: build the entire Business OS ─────────────────────────────────

function buildBusinessOS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setName('DeckBrief Business OS');

  buildCEODashboard(ss);
  buildPipelineTracker(ss);
  buildBottleneckAnalyzer(ss);
  buildScaleRoadmap(ss);
  buildTimeDelegationLog(ss);
  buildScaleSessionScheduler(ss);

  // Delete default Sheet1 if it still exists
  const sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) ss.deleteSheet(sheet1);

  refreshData();
  SpreadsheetApp.getUi().alert('Business OS built. Data is live.');
}

// ── Tab 1: CEO Dashboard ─────────────────────────────────────────────────────

function buildCEODashboard(ss) {
  let sheet = ss.getSheetByName('CEO Dashboard') || ss.insertSheet('CEO Dashboard', 0);
  sheet.clear();
  sheet.setTabColor('#F5A623');

  const AMBER = '#F5A623', DARK = '#0A0A0E', WHITE = '#F4F0E8', LIGHT = '#FFF8ED';

  // Header
  sheet.getRange('A1:H1').merge().setValue('DECKBRIEF — CEO COMMAND CENTER')
    .setBackground(DARK).setFontColor(AMBER).setFontSize(18).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 48);

  sheet.getRange('A2:H2').merge().setValue('=TEXT(NOW(),"dddd, mmmm d yyyy • h:mm AM/PM")')
    .setBackground(DARK).setFontColor('#888888').setFontSize(11).setHorizontalAlignment('center');

  // KPI row labels
  const kpiHeaders = [['TOTAL LEADS','NEW','CONTACTED','QUALIFIED','PROPOSAL','WON','LOST','WIN RATE']];
  sheet.getRange('A4:H4').setValues(kpiHeaders)
    .setBackground(AMBER).setFontColor(DARK).setFontWeight('bold').setFontSize(10)
    .setHorizontalAlignment('center');
  sheet.getRange('A5:H5').setBackground(LIGHT).setFontSize(20).setFontWeight('bold')
    .setHorizontalAlignment('center').setFontColor(DARK);

  // Live data note
  sheet.getRange('A7:H7').merge()
    .setValue('▼  PIPELINE HEALTH  ▼  Refresh: Extensions → Macros → refreshData')
    .setBackground('#F0F0F0').setFontColor('#888888').setFontSize(10).setHorizontalAlignment('center');

  // Pipeline table headers
  const pipelineHeaders = [['LEAD NAME','COMPANY','EMAIL','LEAD VOLUME','STATUS','DAYS IN STAGE','RISK','NEXT ACTION']];
  sheet.getRange('A8:H8').setValues(pipelineHeaders)
    .setBackground(DARK).setFontColor(WHITE).setFontWeight('bold').setFontSize(10);

  // Data area (rows 9–58, 50 leads max)
  sheet.getRange('A9:H58').setBackground('#FAFAFA').setFontSize(10);
  sheet.getRange('F9:F58').setHorizontalAlignment('center');
  sheet.getRange('G9:G58').setHorizontalAlignment('center');

  // Column widths
  [160,160,200,110,100,100,80,200].forEach((w, i) => sheet.setColumnWidth(i+1, w));

  // Freeze
  sheet.setFrozenRows(8);
  sheet.setFrozenColumns(2);
}

// ── Tab 2: Pipeline & Revenue Tracker ────────────────────────────────────────

function buildPipelineTracker(ss) {
  let sheet = ss.getSheetByName('Pipeline & Revenue') || ss.insertSheet('Pipeline & Revenue', 1);
  sheet.clear();
  sheet.setTabColor('#22C55E');

  sheet.getRange('A1:F1').merge().setValue('PIPELINE & REVENUE TRACKER')
    .setBackground('#0A0A0E').setFontColor('#22C55E').setFontSize(16).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  // Stage funnel summary
  const stageHeaders = [['STAGE','LEADS','AVG DAYS IN STAGE','CONVERSION RATE','EST. REVENUE','NOTES']];
  sheet.getRange('A3:F3').setValues(stageHeaders)
    .setBackground('#22C55E').setFontColor('#fff').setFontWeight('bold').setFontSize(10);

  const stages = ['New','Contacted','Qualified','Proposal','Closed Won','Closed Lost'];
  stages.forEach((s, i) => {
    sheet.getRange(i+4, 1).setValue(s);
    sheet.getRange(i+4, 5).setNumberFormat('$#,##0');
  });
  sheet.getRange('A4:F9').setBackground('#F9FFF9').setFontSize(10);

  // Weekly trend table
  sheet.getRange('A12:D12').merge().setValue('WEEKLY NEW LEADS TREND')
    .setBackground('#0A0A0E').setFontColor('#22C55E').setFontWeight('bold').setFontSize(11)
    .setHorizontalAlignment('center');
  const trendHeaders = [['WEEK','NEW LEADS','WON','CONVERSION']];
  sheet.getRange('A13:D13').setValues(trendHeaders)
    .setBackground('#22C55E').setFontColor('#fff').setFontWeight('bold');
  sheet.getRange('A14:D21').setBackground('#F9FFF9').setFontSize(10);
  sheet.getRange('D14:D21').setNumberFormat('0%');

  [150,120,100,110,140,200].forEach((w, i) => sheet.setColumnWidth(i+1, w));
  sheet.setFrozenRows(3);
}

// ── Tab 3: Bottleneck Analyzer ───────────────────────────────────────────────

function buildBottleneckAnalyzer(ss) {
  let sheet = ss.getSheetByName('Bottleneck Analyzer') || ss.insertSheet('Bottleneck Analyzer', 2);
  sheet.clear();
  sheet.setTabColor('#EF4444');

  sheet.getRange('A1:G1').merge().setValue('BOTTLENECK ANALYZER — WHERE DEALS GET STUCK')
    .setBackground('#0A0A0E').setFontColor('#EF4444').setFontSize(16).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  sheet.getRange('A2:G2').merge()
    .setValue('Leads stalled 3+ days with no update. These are costing you money right now.')
    .setBackground('#FFF0F0').setFontColor('#991B1B').setFontSize(10).setHorizontalAlignment('center');

  const headers = [['STAGE','STUCK LEADS','AVG DAYS STALE','SEVERITY','REVENUE AT RISK','BOTTLENECK CAUSE','FIX IT']];
  sheet.getRange('A4:G4').setValues(headers)
    .setBackground('#EF4444').setFontColor('#fff').setFontWeight('bold').setFontSize(10);

  const stageCauses = [
    ['New','','','','','No follow-up drafted','Trigger AI draft immediately'],
    ['Contacted','','','','','No response → needs 2nd touch','Send DeckBrief follow-up #2'],
    ['Qualified','','','','','Proposal not sent','Block 30min — write proposal today'],
    ['Proposal','','','','','Ghosted after proposal','Call (not email) — ask for decision'],
  ];
  sheet.getRange('A5:G8').setValues(stageCauses).setFontSize(10);
  sheet.getRange('A5:G8').setBackground('#FFF5F5');

  // Revenue at risk detail table
  sheet.getRange('A11:G11').merge().setValue('HIGH-VALUE LEADS AT RISK (Qualified + Proposal, stale 3+ days)')
    .setBackground('#0A0A0E').setFontColor('#EF4444').setFontWeight('bold').setFontSize(11)
    .setHorizontalAlignment('center');
  const riskHeaders = [['NAME','COMPANY','STATUS','LEAD VOLUME','DAYS STALE','LAST ACTIVITY','ACTION']];
  sheet.getRange('A12:G12').setValues(riskHeaders)
    .setBackground('#EF4444').setFontColor('#fff').setFontWeight('bold');
  sheet.getRange('A13:G22').setBackground('#FFF5F5').setFontSize(10);

  [130,150,110,110,100,150,180].forEach((w, i) => sheet.setColumnWidth(i+1, w));
  sheet.setFrozenRows(4);
}

// ── Tab 4: Scale Roadmap ─────────────────────────────────────────────────────

function buildScaleRoadmap(ss) {
  let sheet = ss.getSheetByName('Scale Roadmap') || ss.insertSheet('Scale Roadmap', 3);
  sheet.clear();
  sheet.setTabColor('#8B5CF6');

  sheet.getRange('A1:F1').merge().setValue('SCALE ROADMAP — 5 PILLARS TO A SYSTEMIZED BUSINESS')
    .setBackground('#0A0A0E').setFontColor('#8B5CF6').setFontSize(16).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  const pillars = [
    ['1. OPERATING SYSTEM','Build scalable systems so the business runs without you in the weeds.',
     'What systems exist?','What\'s manual today?','What\'s the automation gap?'],
    ['2. BOTTLENECK ELIMINATION','Remove the top 3 constraints slowing growth and trapping you in ops.',
     'Top bottleneck today','Root cause','30-day fix'],
    ['3. PROFITABILITY + SCALABILITY','Increase margin and capacity at the same time.',
     'Current close rate','Target close rate','Revenue lever to pull'],
    ['4. TIME FREEDOM','Free up your time for strategy, growth, or stepping away.',
     'Hours/week in ops','Target hours/week in ops','What to delegate first'],
    ['5. SCALE ROADMAP','Step-by-step plan to remove yourself from the daily grind.',
     'Month 1 milestone','Month 3 milestone','Month 6 milestone'],
  ];

  let row = 3;
  pillars.forEach(([title, desc, col1, col2, col3]) => {
    sheet.getRange(row, 1, 1, 6).merge().setValue(title)
      .setBackground('#8B5CF6').setFontColor('#fff').setFontWeight('bold').setFontSize(11);
    sheet.setRowHeight(row, 30);
    row++;

    sheet.getRange(row, 1, 1, 6).merge().setValue(desc)
      .setBackground('#F5F0FF').setFontColor('#4B3080').setFontSize(10).setFontStyle('italic');
    sheet.setRowHeight(row, 24);
    row++;

    sheet.getRange(row, 1).setValue('QUESTION').setFontWeight('bold').setBackground('#EDE9FF');
    sheet.getRange(row, 2).setValue(col1).setFontWeight('bold').setBackground('#EDE9FF');
    sheet.getRange(row, 3).setValue('→').setBackground('#EDE9FF').setHorizontalAlignment('center');
    sheet.getRange(row, 4).setValue(col2).setFontWeight('bold').setBackground('#EDE9FF');
    sheet.getRange(row, 5).setValue('→').setBackground('#EDE9FF').setHorizontalAlignment('center');
    sheet.getRange(row, 6).setValue(col3).setFontWeight('bold').setBackground('#EDE9FF');
    row++;

    sheet.getRange(row, 1).setValue('YOUR ANSWER').setBackground('#FAFAFA').setFontColor('#888');
    sheet.getRange(row, 2, 1, 1).setBackground('#fff');
    sheet.getRange(row, 4, 1, 1).setBackground('#fff');
    sheet.getRange(row, 6, 1, 1).setBackground('#fff');
    sheet.setRowHeight(row, 40);
    row += 2;
  });

  [120,160,30,160,30,160].forEach((w, i) => sheet.setColumnWidth(i+1, w));
}

// ── Tab 5: Time & Delegation Log ─────────────────────────────────────────────

function buildTimeDelegationLog(ss) {
  let sheet = ss.getSheetByName('Time & Delegation') || ss.insertSheet('Time & Delegation', 4);
  sheet.clear();
  sheet.setTabColor('#F59E0B');

  sheet.getRange('A1:G1').merge().setValue('TIME AUDIT + DELEGATION LOG')
    .setBackground('#0A0A0E').setFontColor('#F5A623').setFontSize(16).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  sheet.getRange('A2:G2').merge()
    .setValue('Track where your time goes. Anything below your hourly rate should be delegated or automated.')
    .setBackground('#FFFBEB').setFontColor('#92400E').setFontSize(10).setHorizontalAlignment('center');

  const headers = [['TASK / ACTIVITY','CATEGORY','HRS/WEEK','SHOULD BE YOU?','DELEGATE TO','AUTOMATE WITH','PRIORITY']];
  sheet.getRange('A4:G4').setValues(headers)
    .setBackground('#F5A623').setFontColor('#0A0A0E').setFontWeight('bold').setFontSize(10);

  const starterTasks = [
    ['Lead follow-up emails','Sales','3','No','DeckBrief AI Draft','DeckBrief','HIGH'],
    ['Morning pipeline review','Ops','1','Yes (with brief)','—','DeckBrief 7AM Brief','HIGH'],
    ['Updating deal status','Ops','1','No','Sales rep / VA','DeckBrief pipeline','HIGH'],
    ['Writing proposals','Sales','3','Sometimes','Templates + AI','DeckBrief draft','MEDIUM'],
    ['Social media posting','Marketing','2','No','VA / Tool','Social cron (auto)','MEDIUM'],
    ['Reporting / metrics','Leadership','1','Yes','—','DeckBrief CEO dashboard','LOW'],
    ['Client onboarding','Ops','2','No','Ops team','SOPs + checklist','HIGH'],
  ];
  sheet.getRange('A5:G11').setValues(starterTasks).setFontSize(10);
  sheet.getRange('A5:G11').setBackground('#FFFBEB');
  sheet.getRange('G5:G11').setFontWeight('bold');

  // Time summary
  sheet.getRange('A13:B13').setValues([['TOTAL HRS/WEEK IN OPS:','=SUMIF(D5:D50,"No",C5:C50)']])
    .setFontWeight('bold').setBackground('#FEF3C7');
  sheet.getRange('A14:B14').setValues([['HOURS YOU SHOULD OWN:','=SUMIF(D5:D50,"Yes",C5:C50)']])
    .setFontWeight('bold').setBackground('#FEF3C7');
  sheet.getRange('A15:B15').setValues([['HOURS TO RECLAIM:','=B13']])
    .setFontWeight('bold').setBackground('#FEF3C7').setFontColor('#EF4444');

  [200,120,90,120,150,160,90].forEach((w, i) => sheet.setColumnWidth(i+1, w));
  sheet.setFrozenRows(4);
}

// ── Tab 6: Scale Session Scheduler ───────────────────────────────────────────

function buildScaleSessionScheduler(ss) {
  let sheet = ss.getSheetByName('Scale Sessions') || ss.insertSheet('Scale Sessions', 5);
  sheet.clear();
  sheet.setTabColor('#0EA5E9');

  sheet.getRange('A1:F1').merge().setValue('SCALE SESSION TRACKER')
    .setBackground('#0A0A0E').setFontColor('#0EA5E9').setFontSize(16).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  sheet.getRange('A2:F2').merge()
    .setValue('Track every Scale Session booked through the DeckBrief funnel. Each one is a pipeline opportunity.')
    .setBackground('#F0F9FF').setFontColor('#0C4A6E').setFontSize(10).setHorizontalAlignment('center');

  const headers = [['DATE BOOKED','CLIENT NAME','COMPANY','EMAIL','SESSION DATE','OUTCOME / NEXT STEP']];
  sheet.getRange('A4:F4').setValues(headers)
    .setBackground('#0EA5E9').setFontColor('#fff').setFontWeight('bold').setFontSize(10);

  sheet.getRange('A5:F54').setBackground('#F0F9FF').setFontSize(10);
  sheet.getRange('A5:A54').setNumberFormat('mm/dd/yyyy');
  sheet.getRange('E5:E54').setNumberFormat('mm/dd/yyyy');

  // Summary
  sheet.getRange('A56:C56').setValues([['TOTAL SESSIONS BOOKED:','CONVERTED TO CLIENT:','CONVERSION RATE:']])
    .setFontWeight('bold').setBackground('#E0F2FE');
  sheet.getRange('A57').setFormula('=COUNTA(A5:A54)').setBackground('#E0F2FE').setFontWeight('bold');
  sheet.getRange('B57').setFormula('=COUNTIF(F5:F54,"*signed*")+COUNTIF(F5:F54,"*client*")+COUNTIF(F5:F54,"*won*")')
    .setBackground('#E0F2FE').setFontWeight('bold');
  sheet.getRange('C57').setFormula('=IFERROR(B57/A57,0)').setNumberFormat('0%')
    .setBackground('#E0F2FE').setFontWeight('bold');

  [110,150,160,200,110,250].forEach((w, i) => sheet.setColumnWidth(i+1, w));
  sheet.setFrozenRows(4);
}

// ── Data refresh: pulls live data from DeckBrief API ─────────────────────────

function refreshData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    const ceoData = fetchFromAPI('/api/ceo/dashboard');

    refreshCEODashboard(ss, ceoData);
    refreshPipelineTracker(ss, ceoData);
    refreshBottleneckAnalyzer(ss, ceoData);

    const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMM d, yyyy h:mm a');
    ss.getSheetByName('CEO Dashboard').getRange('H2').setValue('Last refreshed: ' + ts)
      .setFontSize(9).setFontColor('#888').setHorizontalAlignment('right');

  } catch (e) {
    SpreadsheetApp.getUi().alert('DeckBrief API error: ' + e.message + '\n\nCheck DECKBRIEF_API_URL and DECKBRIEF_API_KEY constants at the top of the script.');
  }
}

function refreshCEODashboard(ss, data) {
  const sheet = ss.getSheetByName('CEO Dashboard');
  if (!sheet) return;

  const p = data.pipeline;
  const statuses = ['new','contacted','qualified','proposal','closed_won','closed_lost'];
  const kpiValues = [
    [p.total, p.by_status.new || 0, p.by_status.contacted || 0,
     p.by_status.qualified || 0, p.by_status.proposal || 0,
     p.by_status.closed_won || 0, p.by_status.closed_lost || 0,
     (p.win_rate_pct || 0) + '%']
  ];
  sheet.getRange('A5:H5').setValues(kpiValues);

  if (data.top_actions?.length) {
    const leads = fetchFromAPI('/api/leads');
    let row = 9;
    leads.slice(0, 50).forEach(lead => {
      const daysSince = Math.round((Date.now() - new Date(lead.updated_at)) / 86400000);
      const risk = daysSince > 7 ? 'COLD' : daysSince > 3 ? 'WARM' : 'ACTIVE';
      const nextAction = data.top_actions.find(a => a.label.includes(lead.first_name))?.label || 'Review status';
      sheet.getRange(row, 1).setValue(`${lead.first_name} ${lead.last_name}`);
      sheet.getRange(row, 2).setValue(lead.business_name || '—');
      sheet.getRange(row, 3).setValue(lead.email);
      sheet.getRange(row, 4).setValue(lead.lead_volume || '—');
      sheet.getRange(row, 5).setValue(lead.status.toUpperCase());
      sheet.getRange(row, 6).setValue(daysSince);
      sheet.getRange(row, 7).setValue(risk).setFontColor(risk === 'COLD' ? '#EF4444' : risk === 'WARM' ? '#F5A623' : '#22C55E');
      sheet.getRange(row, 8).setValue(nextAction);
      row++;
    });
  }
}

function refreshPipelineTracker(ss, data) {
  const sheet = ss.getSheetByName('Pipeline & Revenue');
  if (!sheet) return;

  const p = data.pipeline.by_status;
  const stageMap = [['new', p.new||0], ['contacted', p.contacted||0], ['qualified', p.qualified||0],
                    ['proposal', p.proposal||0], ['closed_won', p.closed_won||0], ['closed_lost', p.closed_lost||0]];
  stageMap.forEach(([, count], i) => sheet.getRange(i + 4, 2).setValue(count));

  const trend = data.weekly_trend || [];
  trend.forEach((w, i) => {
    if (i < 8) {
      sheet.getRange(i + 14, 1).setValue(w.week_start);
      sheet.getRange(i + 14, 2).setValue(parseInt(w.new_leads) || 0);
      sheet.getRange(i + 14, 3).setValue(parseInt(w.won) || 0);
    }
  });
}

function refreshBottleneckAnalyzer(ss, data) {
  const sheet = ss.getSheetByName('Bottleneck Analyzer');
  if (!sheet) return;

  const bottlenecks = data.bottlenecks || [];
  bottlenecks.forEach((b, i) => {
    if (i < 4) {
      sheet.getRange(i + 5, 2).setValue(b.stuck_leads);
      sheet.getRange(i + 5, 3).setValue(b.avg_days_stale);
      sheet.getRange(i + 5, 4).setValue(b.severity.toUpperCase())
        .setFontColor(b.severity === 'critical' ? '#EF4444' : b.severity === 'warning' ? '#F5A623' : '#22C55E');
    }
  });

  const riskLeads = data.revenue_at_risk?.leads || [];
  riskLeads.forEach((l, i) => {
    if (i < 10) {
      sheet.getRange(i + 13, 1).setValue(`${l.first_name} ${l.last_name}`);
      sheet.getRange(i + 13, 2).setValue(l.business_name || '—');
      sheet.getRange(i + 13, 3).setValue(l.status);
      sheet.getRange(i + 13, 4).setValue(l.lead_volume || '—');
      sheet.getRange(i + 13, 5).setValue(parseFloat(l.days_stale) || 0);
    }
  });
}

// ── API helper ───────────────────────────────────────────────────────────────

function fetchFromAPI(path) {
  const url = DECKBRIEF_API_URL + path;
  const options = {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + DECKBRIEF_API_KEY },
    muteHttpExceptions: true,
  };
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    throw new Error(`API returned ${response.getResponseCode()} for ${path}`);
  }
  return JSON.parse(response.getContentText());
}

// ── Trigger setup: run refreshData every day at 7AM ──────────────────────────

function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('refreshData')
    .timeBased().atHour(7).everyDays(1)
    .create();
  SpreadsheetApp.getUi().alert('Daily 7AM refresh trigger created.');
}

// ── Menu setup ───────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi().createMenu('DeckBrief')
    .addItem('Refresh Live Data', 'refreshData')
    .addItem('Set Up Daily Auto-Refresh (7AM)', 'createDailyTrigger')
    .addSeparator()
    .addItem('Rebuild All Tabs', 'buildBusinessOS')
    .addToUi();
}
