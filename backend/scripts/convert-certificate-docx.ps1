$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root 'src\assets\certificates\Donation Certficate.docx'
$outPdf = Join-Path $root 'src\assets\certificates\certificate-base.pdf'
$tmpDoc = 'C:\Temp\hcg-cert.docx'
$tmpPdf = 'C:\Temp\hcg-cert.pdf'

if (-not (Test-Path $src)) { throw "Missing $src" }
New-Item -ItemType Directory -Force -Path C:\Temp | Out-Null
Copy-Item $src $tmpDoc -Force
if (Test-Path $tmpPdf) { Remove-Item $tmpPdf -Force }
if (Test-Path $outPdf) { Remove-Item $outPdf -Force }

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  Write-Host "Opening template..."
  $doc = $word.Documents.Open($tmpDoc, $false, $true)
  # 17 = PDF, OptimizeFor = 1 (on-screen) — full-quality hangs on this file
  $doc.ExportAsFixedFormat($tmpPdf, 17, $false, 1)
  $doc.Close($false) | Out-Null
  Copy-Item $tmpPdf $outPdf -Force
  Write-Host "Wrote $outPdf ($((Get-Item $outPdf).Length) bytes)"
}
finally {
  $word.Quit() | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
