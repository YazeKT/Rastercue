[CmdletBinding()]
param(
  [string]$Configuration = "Release",
  [switch]$SkipToolDownload
)
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $repoRoot "native\rastercue-cpu"
$vendorRoot = Join-Path $sourceRoot "vendor"
$buildRoot = Join-Path $sourceRoot "build"
$ncnnRevision = "6125c9f47cd14b589de0521350668cf9d3d37e3c"
$webpRevision = "8ea81561d2fdd382da60f57958741a7c23a18eb6"
$cmakeVersion = "4.4.3"
$cmakeArchiveHash = "4d52ebab7193a698651639ed80d8d04fd903358843572cf44c7fd234cb7c26ab"

function Get-PinnedRepository([string]$Url, [string]$Revision, [string]$Destination) {
  if (-not (Test-Path (Join-Path $Destination ".git"))) {
    New-Item -ItemType Directory -Force $Destination | Out-Null
    git -C $Destination init
    git -C $Destination remote add origin $Url
  }
  $current = ""
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = "SilentlyContinue"
  $current = git -C $Destination rev-parse --verify HEAD 2>$null
  $headResult = $LASTEXITCODE
  $ErrorActionPreference = $previousPreference
  if ($headResult -ne 0 -or $current.Trim() -ne $Revision) {
    git -C $Destination fetch --depth 1 origin $Revision
    if ($LASTEXITCODE -ne 0) { throw "Could not fetch $Url at $Revision" }
    git -C $Destination checkout --detach FETCH_HEAD
    if ($LASTEXITCODE -ne 0) { throw "Could not check out $Revision" }
  }
  $verified = (git -C $Destination rev-parse HEAD).Trim()
  if ($verified -ne $Revision) { throw "Pinned source mismatch: expected $Revision, got $verified" }
}

New-Item -ItemType Directory -Force $vendorRoot | Out-Null
Get-PinnedRepository "https://github.com/Tencent/ncnn.git" $ncnnRevision (Join-Path $vendorRoot "ncnn")
Get-PinnedRepository "https://github.com/webmproject/libwebp.git" $webpRevision (Join-Path $vendorRoot "libwebp")

$cmakeCommand = Get-Command cmake -ErrorAction SilentlyContinue
$cmake = if ($cmakeCommand) { $cmakeCommand.Source } else { $null }
if (-not $cmake) {
  $vsCmake = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
  if (Test-Path -LiteralPath $vsCmake) { $cmake = $vsCmake }
}
if (-not $cmake) {
  $visualStudioCMake = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
  if (Test-Path $visualStudioCMake) { $cmake = $visualStudioCMake }
}
if (-not $cmake) {
  if ($SkipToolDownload) { throw "CMake was not found and -SkipToolDownload was requested." }
  $toolsRoot = Join-Path $env:LOCALAPPDATA "RastercueBuildTools"
  $cmakeRoot = Join-Path $toolsRoot "cmake-$cmakeVersion-windows-x86_64"
  $cmake = Join-Path $cmakeRoot "bin\cmake.exe"
  $cmakeModules = Join-Path $cmakeRoot "share\cmake-$($cmakeVersion.Substring(0,3))\Modules\CMake.cmake"
  if (-not (Test-Path $cmake) -or -not (Test-Path $cmakeModules)) {
    New-Item -ItemType Directory -Force $toolsRoot | Out-Null
    $archive = Join-Path $toolsRoot "cmake-$cmakeVersion-windows-x86_64.zip"
    if (-not (Test-Path $archive)) {
      Invoke-WebRequest "https://github.com/Kitware/CMake/releases/download/v$cmakeVersion/cmake-$cmakeVersion-windows-x86_64.zip" -OutFile $archive
    }
    $actual = (Get-FileHash -Algorithm SHA256 $archive).Hash.ToLowerInvariant()
    if ($actual -ne $cmakeArchiveHash) { throw "CMake archive checksum mismatch." }
    Expand-Archive -LiteralPath $archive -DestinationPath $toolsRoot -Force
  }
}

& $cmake -S $sourceRoot -B $buildRoot -A x64
if ($LASTEXITCODE -ne 0) { throw "CMake configuration failed." }
& $cmake --build $buildRoot --config $Configuration --target rastercue-cpu -j 2
if ($LASTEXITCODE -ne 0) { throw "CPU sidecar build failed." }

$binary = Join-Path $buildRoot "$Configuration\rastercue-cpu.exe"
if (-not (Test-Path $binary)) { throw "Expected CPU sidecar was not produced: $binary" }
& $binary --probe-json
if ($LASTEXITCODE -ne 0) { throw "CPU sidecar probe failed." }
$stagedBinary = Join-Path $repoRoot "resources\win\bin\rastercue-cpu.exe"
Copy-Item -LiteralPath $binary -Destination $stagedBinary -Force
Get-FileHash -Algorithm SHA256 $binary
Write-Output "Built $binary"
Write-Output "Staged $stagedBinary"
