param(
  [string]$Repo = "RenzIP/Graphic-Diagram-Online",
  [string]$Path = "docs/spec/08-issues.json",
  [switch]$DryRun
)

if (!(Test-Path $Path)) { throw "File not found: $Path" }

$json = Get-Content $Path -Raw | ConvertFrom-Json

# Labels (best effort)
foreach ($label in $json.meta.labels) {
  if ($DryRun) {
    Write-Host "[DRY] Ensure label: $label"
  } else {
    gh label create $label --repo $Repo --force 2>$null | Out-Null
  }
}

# Milestones via GitHub API
$milestoneMap = @{}
if (-not $DryRun) {
  $milestonesExisting = gh api "repos/$Repo/milestones" --paginate | ConvertFrom-Json
  foreach ($ms in $json.meta.milestones) {
    $found = $milestonesExisting | Where-Object { $_.title -eq $ms } | Select-Object -First 1
    if (-not $found) {
      $created = gh api -X POST "repos/$Repo/milestones" -f title="$ms" | ConvertFrom-Json
      $milestoneMap[$ms] = $created.number
    } else {
      $milestoneMap[$ms] = $found.number
    }
  }
} else {
  foreach ($ms in $json.meta.milestones) { $milestoneMap[$ms] = 0 }
}

# Create issues
foreach ($issue in $json.issues) {
  $title = $issue.title
  $body  = $issue.body
  $labels = ($issue.labels | ForEach-Object { $_ }) -join ","

  if ($DryRun) {
    Write-Host "`n[DRY] Create issue: $title"
    Write-Host " labels: $labels"
    Write-Host " milestone: $($issue.milestone)"
    continue
  }

  $createdUrl = gh issue create --repo $Repo --title "$title" --body "$body" --label "$labels" | Out-String
  $createdUrl = $createdUrl.Trim()
  Write-Host "Created: $createdUrl"

  $msTitle = $issue.milestone
  if ($msTitle -and $milestoneMap.ContainsKey($msTitle)) {
    if ($createdUrl -match "/issues/(\d+)") {
      $num = $Matches[1]
      $msNum = $milestoneMap[$msTitle]
      if ($msNum) {
        gh api -X PATCH "repos/$Repo/issues/$num" -f milestone=$msNum | Out-Null
      }
    }
  }
}

Write-Host "`nDone."
