#!/usr/bin/env pwsh
<#
  NerdCommand Site Manager (PowerShell)
  Deploy + uptime monitoring for NerdCommand.info. No Python required.

  Usage:
    pwsh ./site_manager.ps1 check        one health check (uptime, response time, title, contact, sections, ssl)
    pwsh ./site_manager.ps1 monitor      continuous monitor loop (interval from site_config.json)
    pwsh ./site_manager.ps1 log          print the last 10 monitor entries
    pwsh ./site_manager.ps1 push "msg"   git add + commit + push (deploy)
    pwsh ./site_manager.ps1 fetch        git pull latest
#>
param(
  [Parameter(Position = 0)][string]$Command = "help",
  [Parameter(Position = 1)][string]$Message
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Get-Config {
  $p = Join-Path $root "site_config.json"
  if (-not (Test-Path $p)) { throw "site_config.json not found in $root" }
  return Get-Content $p -Raw | ConvertFrom-Json
}

function Get-NowUtc { (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ") }

function Invoke-HealthCheck {
  param($cfg)
  $url = $cfg.site.live_url
  $report = [ordered]@{ timestamp = (Get-NowUtc); url = $url; checks = [ordered]@{} }
  try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 5
    $sw.Stop()
    $ms = [int]$sw.Elapsed.TotalMilliseconds
    $html = [string]$resp.Content

    $report.checks.uptime = @{ status = "ok"; http_code = [int]$resp.StatusCode }

    $threshold = [int]$cfg.monitoring.alert_threshold_ms
    $report.checks.response_time = @{ status = $(if ($ms -lt $threshold) { "ok" } else { "slow" }); ms = $ms }

    $report.checks.page_title = @{ status = $(if ($html -match "NerdCommand") { "ok" } else { "warn" }); note = $(if ($html -match "NerdCommand") { "title present" } else { "NerdCommand not found in page" }) }

    $email = [string]$cfg.site.contact_email
    $report.checks.contact_link = @{ status = $(if ($html.Contains($email)) { "ok" } else { "warn" }); note = $email }

    $missing = @()
    foreach ($prop in $cfg.sections.PSObject.Properties) {
      $needle = [string]$prop.Value -replace '"', ''
      if (-not ($html -match [regex]::Escape($needle))) { $missing += $prop.Name }
    }
    $report.checks.sections = @{ status = $(if ($missing.Count -eq 0) { "ok" } else { "warn" }); note = $(if ($missing.Count -eq 0) { "all sections found" } else { "missing: $($missing -join ', ')" }) }

    $report.checks.ssl = @{ status = $(if ($url.StartsWith("https")) { "ok" } else { "warn" }); note = $(if ($url.StartsWith("https")) { "https + valid cert" } else { "not https" }) }
  }
  catch {
    $report.checks.uptime = @{ status = "down"; error = $_.Exception.Message }
  }

  $statuses = @($report.checks.Values | ForEach-Object { $_.status })
  if ($statuses -contains "down" -or $statuses -contains "error") { $report.overall = "DOWN" }
  elseif ($statuses -contains "warn" -or $statuses -contains "slow") { $report.overall = "DEGRADED" }
  else { $report.overall = "HEALTHY" }
  return $report
}

function Write-Report {
  param($report)
  $bar = ("=" * 54)
  Write-Host $bar
  Write-Host (" NerdCommand Site Monitor  -  {0}" -f $report.timestamp)
  Write-Host (" {0}  |  {1}" -f $report.overall, $report.url)
  Write-Host $bar
  foreach ($k in $report.checks.Keys) {
    $d = $report.checks[$k]
    $detail = ""
    if ($d.ContainsKey("ms"))         { $detail = " ($($d.ms)ms)" }
    elseif ($d.ContainsKey("note"))   { $detail = " - $($d.note)" }
    elseif ($d.ContainsKey("error"))  { $detail = " - $($d.error)" }
    $name = (Get-Culture).TextInfo.ToTitleCase(($k -replace '_', ' '))
    Write-Host ("  [{0,-8}] {1}{2}" -f $d.status.ToUpper(), $name, $detail)
  }
  Write-Host ""
}

function Add-LogEntry {
  param($report, $logFile)
  $history = @()
  if (Test-Path $logFile) {
    try { $history = @(Get-Content $logFile -Raw | ConvertFrom-Json) } catch { $history = @() }
  }
  $history += [pscustomobject]$report
  if ($history.Count -gt 200) { $history = $history[($history.Count - 200)..($history.Count - 1)] }
  $history | ConvertTo-Json -Depth 6 | Set-Content $logFile -Encoding UTF8
}

switch ($Command.ToLower()) {
  "check" {
    $cfg = Get-Config
    $r = Invoke-HealthCheck $cfg
    Write-Report $r
    Add-LogEntry $r (Join-Path $root $cfg.monitoring.log_file)
  }
  "monitor" {
    $cfg = Get-Config
    $interval = [int]$cfg.monitoring.interval_minutes * 60
    Write-Host (" Monitor started - every {0} min - {1}" -f $cfg.monitoring.interval_minutes, $cfg.site.live_url)
    Write-Host " Press Ctrl+C to stop`n"
    while ($true) {
      $r = Invoke-HealthCheck $cfg
      Write-Report $r
      Add-LogEntry $r (Join-Path $root $cfg.monitoring.log_file)
      Start-Sleep -Seconds $interval
    }
  }
  "log" {
    $cfg = Get-Config
    $logFile = Join-Path $root $cfg.monitoring.log_file
    if (-not (Test-Path $logFile)) { Write-Host "No monitor log yet. Run: pwsh ./site_manager.ps1 check"; break }
    $history = @(Get-Content $logFile -Raw | ConvertFrom-Json)
    $recent = $history | Select-Object -Last 10
    Write-Host "`nLast $($recent.Count) monitor entries:`n"
    foreach ($e in $recent) {
      $ms = if ($e.checks.response_time) { $e.checks.response_time.ms } else { "--" }
      Write-Host ("  {0,-9} {1}  {2}ms" -f $e.overall, $e.timestamp, $ms)
    }
    Write-Host ""
  }
  "push" {
    $msg = if ($Message) { $Message } else { "Site update - $(Get-NowUtc)" }
    git add -A
    git commit -m $msg
    git push
  }
  "fetch" { git pull }
  default {
    Write-Host @"
NerdCommand Site Manager (PowerShell)
  pwsh ./site_manager.ps1 check        one health check
  pwsh ./site_manager.ps1 monitor      continuous monitor loop
  pwsh ./site_manager.ps1 log          last 10 monitor entries
  pwsh ./site_manager.ps1 push "msg"   git add + commit + push (deploy)
  pwsh ./site_manager.ps1 fetch        git pull latest
"@
  }
}
