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

# -PassThru gets us the actual process object (and its PID) back, so
# stop.bat can later target exactly this process rather than guessing.
$process = Start-Process -FilePath $mongoExe `
    -ArgumentList @(
        '--dbpath', $dataDir,
        '--port', $port,
        '--logpath', $logPath,
        '--logappend',
        '--bind_ip', '127.0.0.1'
    ) `
    -WindowStyle Hidden `
    -PassThru

$process.Id | Out-File -FilePath $pidPath -Encoding ascii -NoNewline
