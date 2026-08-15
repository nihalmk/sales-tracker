; Sales Tracker - Windows installer
;
; Builds a single SalesTrackerSetup.exe that installs:
;   - the built app (Next.js + Koa server)
;   - a portable Node.js runtime (so the target machine needs nothing installed)
;   - a portable MongoDB server (same reason)
;   - start.bat / stop.bat launchers, plus Start Menu / Desktop shortcuts
;
; See README.md in this folder for how to assemble the "node-runtime" and
; "mongodb-runtime" folders and run the build (npm ci / npm run build /
; npm prune) before compiling this script with Inno Setup.

#define MyAppName "Sales Tracker"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Sales Tracker"
#define MyAppURL "http://localhost:3000"

[Setup]
; Generated once for this app - do not change between versions, it's how
; Windows recognizes "this is an upgrade of the same app" vs. a new install.
AppId={{7F3E5C1A-9B2D-4E6F-8A10-2C5D7E9F1B3C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
; Installs per-user by default (no admin prompt) - fine since everything
; (data, logs, the app itself) lives inside the install folder anyway.
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=dist-installer
OutputBaseFilename=SalesTrackerSetup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
SetupIconFile=..\src\client\public\static\favicon.ico
UninstallDisplayIcon={app}\app\src\client\public\static\favicon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; The built app - see README.md for the exact build steps that produce
; these folders before you compile this script.
Source: "..\dist\*"; DestDir: "{app}\app\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
; Excludes cache\* - that's just Next.js's local build cache (can be huge),
; not needed to serve the already-built app.
Source: "..\src\client\.next\*"; DestDir: "{app}\app\src\client\.next"; Excludes: "cache\*"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\src\client\public\*"; DestDir: "{app}\app\src\client\public"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\node_modules\*"; DestDir: "{app}\app\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\package.json"; DestDir: "{app}\app"; Flags: ignoreversion

; Portable runtimes - extract the downloaded Node.js and MongoDB zips into
; these two folders (next to this .iss file) before compiling. See
; README.md for exact download links and expected folder layout.
Source: "node-runtime\*"; DestDir: "{app}\node"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "mongodb-runtime\*"; DestDir: "{app}\mongodb"; Flags: ignoreversion recursesubdirs createallsubdirs

; Launchers
Source: "start.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "start-mongo.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "stop.bat"; DestDir: "{app}"; Flags: ignoreversion

[Dirs]
; Created up front so MongoDB and the app have somewhere to write on first
; run even before start.bat's own "if not exist, mkdir" runs.
Name: "{app}\data\db"
Name: "{app}\logs"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; IconFilename: "{app}\app\src\client\public\static\favicon.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\start.bat"; WorkingDir: "{app}"; IconFilename: "{app}\app\src\client\public\static\favicon.ico"
Name: "{group}\Stop {#MyAppName}"; Filename: "{app}\stop.bat"; WorkingDir: "{app}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\start.bat"; Description: "Launch {#MyAppName} now"; Flags: postinstall nowait skipifsilent shellexec

; Deliberately NOT deleting {app}\data or {app}\logs on uninstall - that's
; the shop's real sales/purchase data. Leave it on disk; only the program
; files themselves get removed by the standard uninstaller.
