param(
  [string]$Template = '30.docx',
  # 0 = print quality (keeps images sharp), 1 = on-screen (smaller, blurrier)
  [int]$OptimizeFor = 0
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root "src\assets\certificates\$Template"
$outPdf = Join-Path $root 'src\assets\certificates\certificate-base.pdf'
$tmpDir = Join-Path $env:TEMP 'hcg-cert'
$tmpDoc = Join-Path $tmpDir 'template.docx'
$tmpPdf = Join-Path $tmpDir 'template.pdf'

if (-not (Test-Path $src)) { throw "Missing $src" }
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
Copy-Item $src $tmpDoc -Force
if (Test-Path $tmpPdf) { Remove-Item $tmpPdf -Force }

# A hidden Word instance can hang for minutes on this template, while a Word
# window that already has it open exports in about a second. Prefer that.
$openDoc = $null
try {
  $running = [Runtime.InteropServices.Marshal]::GetActiveObject('Word.Application')
  $openDoc = $running.Documents | Where-Object { $_.Name -eq $Template } | Select-Object -First 1
} catch { }

if ($openDoc) {
  Write-Host "Exporting $Template from the open Word window..."
  $openDoc.ExportAsFixedFormat($tmpPdf, 17, $false, $OptimizeFor)
}
else {
  Write-Host "Exporting $Template (if this hangs, open the template in Word and run again)..."
  $word = New-Object -ComObject Word.Application
  $word.DisplayAlerts = 0
  try {
    $doc = $word.Documents.Open($tmpDoc, $false, $true)
    $doc.ExportAsFixedFormat($tmpPdf, 17, $false, $OptimizeFor)
    $doc.Close($false) | Out-Null
  }
  finally {
    # COM can attach to a Word window the user already has open; never close their documents.
    if ($word.Documents.Count -eq 0) { $word.Quit() | Out-Null }
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
  }
}

# The wording in the template is pictures/outlines; DonationCertificateService
# draws it as real text, so drop it from the background (needs: pip install pymupdf).
python (Join-Path $PSScriptRoot 'strip-certificate-text.py') $tmpPdf $outPdf
if ($LASTEXITCODE -ne 0) { throw 'strip-certificate-text.py failed' }
Write-Host "Wrote $outPdf ($((Get-Item $outPdf).Length) bytes)"
