# M.S Premium ürün görsellerini HTML klasöründen public/products'a kopyalar
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$destDir = Join-Path $projectRoot "public\products"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

$sourceCandidates = @(
  (Join-Path $env:USERPROFILE "Desktop\MS-STORE\Yeni klasör"),
  (Join-Path $env:USERPROFILE "Desktop\MS-STORE"),
  (Join-Path $env:USERPROFILE "Desktop")
)

$sourceDir = $null
foreach ($candidate in $sourceCandidates) {
  if (Test-Path $candidate) {
    $match = Get-ChildItem -Path $candidate -Include "1.jpeg","1.jpg" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($match) {
      $sourceDir = $candidate
      break
    }
  }
}

if (-not $sourceDir) {
  foreach ($candidate in $sourceCandidates) {
    if (Test-Path $candidate) {
      $count = (Get-ChildItem -Path $candidate -Recurse -Include *.jpeg,*.jpg -File -ErrorAction SilentlyContinue | Measure-Object).Count
      if ($count -ge 10) {
        $sourceDir = $candidate
        break
      }
    }
  }
}

if (-not $sourceDir) {
  Write-Warning "Kaynak görsel klasörü bulunamadı. Görselleri manuel olarak public/products klasörüne kopyalayın."
  exit 1
}

Write-Host "Kaynak: $sourceDir"
Write-Host "Hedef:  $destDir"

$imageMap = @{
  "1" = "1.jpeg"
  "2" = "WhatsApp Image 2026-06-27 at 14.26.44.jpeg"
  "3" = "WhatsApp Image 2026-06-27 at 14.26.45 (1).jpeg"
  "4" = "WhatsApp Image 2026-06-27 at 14.26.45 (2).jpeg"
  "5" = "WhatsApp Image 2026-06-27 at 14.26.45 (3).jpeg"
  "6" = "WhatsApp Image 2026-06-27 at 14.26.45 (4).jpeg"
  "7" = "WhatsApp Image 2026-06-27 at 14.26.45 (5).jpeg"
  "8" = "WhatsApp Image 2026-06-27 at 14.26.45 (6).jpeg"
  "9" = "WhatsApp Image 2026-06-27 at 14.26.45 (7).jpeg"
  "10" = "WhatsApp Image 2026-06-27 at 14.26.45 (8).jpeg"
  "11" = "WhatsApp Image 2026-06-27 at 14.26.45 (9).jpeg"
  "12" = "WhatsApp Image 2026-06-27 at 14.26.45.jpeg"
  "13" = "WhatsApp Image 2026-06-27 at 14.26.46 (1).jpeg"
  "14" = "WhatsApp Image 2026-06-27 at 14.26.46 (2).jpeg"
  "15" = "WhatsApp Image 2026-06-27 at 14.26.46 (3).jpeg"
  "16" = "WhatsApp Image 2026-06-27 at 14.26.46 (4).jpeg"
  "17" = "WhatsApp Image 2026-06-27 at 14.26.46 (5).jpeg"
  "18" = "WhatsApp Image 2026-06-27 at 14.26.46 (6).jpeg"
  "19" = "WhatsApp Image 2026-06-27 at 14.26.46 (7).jpeg"
  "20" = "WhatsApp Image 2026-06-27 at 14.26.46.jpeg"
  "21" = "WhatsApp Image 2026-06-27 at 14.26.47 (1).jpeg"
  "22" = "WhatsApp Image 2026-06-27 at 14.26.47 (2).jpeg"
  "23" = "WhatsApp Image 2026-06-27 at 14.26.47 (3).jpeg"
  "24" = "WhatsApp Image 2026-06-27 at 14.26.47 (4).jpeg"
  "25" = "WhatsApp Image 2026-06-27 at 14.26.47 (5).jpeg"
  "26" = "WhatsApp Image 2026-06-27 at 14.26.47 (6).jpeg"
  "27" = "WhatsApp Image 2026-06-27 at 14.26.47 (7).jpeg"
  "28" = "WhatsApp Image 2026-06-27 at 14.26.47 (8).jpeg"
  "29" = "WhatsApp Image 2026-06-27 at 14.26.47 (9).jpeg"
  "30" = "WhatsApp Image 2026-06-27 at 14.26.47 (10).jpeg"
  "31" = "WhatsApp Image 2026-06-27 at 14.26.47 (11).jpeg"
  "32" = "WhatsApp Image 2026-06-27 at 14.26.47 (12).jpeg"
  "33" = "WhatsApp Image 2026-06-27 at 14.26.47 (13).jpeg"
  "34" = "WhatsApp Image 2026-06-27 at 14.26.47 (14).jpeg"
  "35" = "WhatsApp Image 2026-06-27 at 14.26.47 (15).jpeg"
  "36" = "WhatsApp Image 2026-06-27 at 14.26.47 (16).jpeg"
  "37" = "WhatsApp Image 2026-06-27 at 14.26.47 (17).jpeg"
  "38" = "WhatsApp Image 2026-06-27 at 14.26.47 (18).jpeg"
  "39" = "WhatsApp Image 2026-06-27 at 14.26.47 (19).jpeg"
  "40" = "WhatsApp Image 2026-06-27 at 14.26.47 (20).jpeg"
  "41" = "WhatsApp Image 2026-06-27 at 14.26.47 (21).jpeg"
  "42" = "WhatsApp Image 2026-06-27 at 14.26.47.jpeg"
}

function Find-ImageFile($baseName) {
  $names = @($baseName, $baseName -replace '\.jpeg$', '.jpg')
  foreach ($name in $names) {
    $direct = Join-Path $sourceDir $name
    if (Test-Path $direct) { return $direct }
    $found = Get-ChildItem -Path $sourceDir -Recurse -Filter $name -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { return $found.FullName }
  }
  return $null
}

$copied = 0
foreach ($entry in $imageMap.GetEnumerator() | Sort-Object { [int]$_.Key }) {
  $destName = "{0:D2}.jpeg" -f [int]$entry.Key
  $destPath = Join-Path $destDir $destName
  $src = Find-ImageFile $entry.Value
  if ($src) {
    Copy-Item -Path $src -Destination $destPath -Force
    $copied++
  } else {
    Write-Warning "Bulunamadı: $($entry.Value)"
  }
}

Write-Host "Kopyalanan görsel sayısı: $copied / 42"
