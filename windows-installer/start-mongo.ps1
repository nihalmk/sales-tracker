# Launched by start.bat, which sets these as environment variables before
# calling this script - keeps all the path logic in one place (start.bat)
# instead of duplicating it here.
$ErrorActionPreference = 'Stop'

$mongoExe = $env:MONGO_EXE
$dataDir  = $env:DATA_DIR
$logDir   = $env:LOG_DIR
$port     = $env:MONGO_PORT
$root     = $env:ROOT

$logPath = Join-Path $logDir 'mongod.log'
$pidPath = Join-Path $root 'mongod.pid'
# Separate from mongod's own --logpath file: catches anything mongod (or
# Windows itself) prints BEFORE mongod manages to open its own log file -
# e.g. a missing runtime DLL, an unsupported CPU, or a bad config flag.
# Without this, that kind of early failure was previously invisible, since
# -WindowStyle Hidden silently discards console output that isn't
# explicitly redirected somewhere.
$launchLogPath = Join-Path $logDir 'mongod-launch.log'
$launchErrPath = Join-Path $logDir 'mongod-launch.err.log'

# Built as one pre-quoted string, not an array. Start-Process's
# -ArgumentList joins array elements with spaces but does NOT wrap
# individual elements that themselves contain spaces in quotes - since
# install paths routinely contain spaces ("Program Files", "Sales
# Tracker"), that silently split a single path into several bogus
# arguments and made mongod fail immediately. Quoting each value
# ourselves avoids that entirely.
$mongoArgs = "--dbpath `"$dataDir`" --port $port --logpath `"$logPath`" --logappend --bind_ip 127.0.0.1"

# -PassThru gets us the actual process object (and its PID) back, so
# stop.bat can later target exactly this process rather than guessing.
$process = Start-Process -FilePath $mongoExe `
    -ArgumentList $mongoArgs `
    -WindowStyle Hidden `
    -RedirectStandardOutput $launchLogPath `
    -RedirectStandardError $launchErrPath `
    -PassThru

$process.Id | Out-File -FilePath $pidPath -Encoding ascii -NoNewline

# Give it a moment, then confirm it didn't immediately die - if it did,
# surface whatever it printed right here instead of making start.bat wait
# out the full 30-second "is the port open yet" timeout for something
# that's already failed.
Start-Sleep -Milliseconds 1000
$stillRunning = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
if (-not $stillRunning) {
    Write-Host ''
    Write-Host 'MongoDB exited immediately after starting. Output:' -ForegroundColor Red
    if (Test-Path $launchLogPath) { Get-Content $launchLogPath | Write-Host }
    if (Test-Path $launchErrPath) { Get-Content $launchErrPath | Write-Host }
    exit 1
}
