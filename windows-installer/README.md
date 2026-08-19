# Sales Tracker - Windows installer

Builds a single `SalesTrackerSetup.exe` that a non-technical user can
double-click to install Sales Tracker on a Windows PC, with **no separate
Node.js or MongoDB installation** required — both are bundled as portable
runtimes inside the installer.

This has to be assembled and compiled **on a Windows machine** (Inno Setup,
and the native parts of `node_modules`, are Windows-specific). Everything
below assumes you're running these steps in a Windows `cmd`/PowerShell
prompt, from inside this `windows-installer` folder unless noted.

## What you end up with

```
Sales Tracker\                  <- wherever the installer puts it
├── app\                        <- the built Next.js + Koa server
├── node\                       <- portable Node.js runtime
├── mongodb\                    <- portable MongoDB server
├── data\db\                    <- MongoDB's data files (created on first run)
├── logs\                       <- mongod.log
├── start.bat                   <- what the Start Menu / Desktop icon runs
└── stop.bat                    <- cleanly stops the background MongoDB
```

Double-clicking the shortcut runs `start.bat`, which starts MongoDB (if it
isn't already running), waits for it to be ready, then starts the app.
The app itself already auto-opens your default browser once it's up
(`src/server/index.ts`) — no extra work needed there.

## One-time setup (per machine you build on)

1. **Install [Inno Setup](https://jrsoftware.org/isinfo.php)** (free). This
   gives you the Inno Setup Compiler (`ISCC.exe`), used at the very end.
2. **Download portable Node.js**:
   - Go to <https://nodejs.org/en/download> and pick the **Windows, x64,
     .zip** option (an LTS version — this project requires Node 20.19+).
   - Extract it, and rename/move the extracted folder so you have:
     `windows-installer\node-runtime\node.exe` (i.e. `node.exe` sits
     directly inside `node-runtime`, not a further subfolder).
3. **Download portable MongoDB**:
   - Go to <https://www.mongodb.com/try/download/community>, choose
     **Windows**, and pick the **.zip** package (not the `.msi` installer —
     we want the portable version). Version 7.x matches what this app's
     driver expects.
   - Extract it, and arrange it so you have:
     `windows-installer\mongodb-runtime\bin\mongod.exe`.
   - Note: MongoDB 5.0+ requires a CPU with AVX support. Virtually all
     PCs from the last ~10 years have this, but very old hardware may not.
4. **Download MongoDB Database Tools** (optional - only powers the
   dashboard's "DB Backup" feature; skip this if you don't need it):
   - Go to <https://www.mongodb.com/try/download/database-tools>, choose
     **Windows**, and pick the **.zip** package.
   - Extract it, and arrange it so you have:
     `windows-installer\mongodb-tools-runtime\bin\mongoexport.exe`.
   - If you skip this step entirely (don't create the
     `mongodb-tools-runtime` folder at all), the installer still compiles
     fine - `mongoexport` just won't be available, and "DB Backup" will
     show its "not installed" error. Everything else works regardless.

Your `windows-installer` folder should now look like:

```
windows-installer\
├── node-runtime\node.exe, ...
├── mongodb-runtime\bin\mongod.exe, ...
├── mongodb-tools-runtime\bin\mongoexport.exe, ...   (optional)
├── start.bat
├── stop.bat
├── SalesTracker.iss
└── README.md   (this file)
```

## Every time you build a new installer

Run these from the **repo root** (one level up from `windows-installer`):

```bash
npm ci
npm run build
npm prune --omit=dev
```

- `npm ci` — full install, including the dev tools needed to build.
- `npm run build` — builds both the Next.js frontend and the Koa server
  (produces `dist/` and `src/client/.next`).
- `npm prune --omit=dev` — strips devDependencies (TypeScript, ESLint,
  Jest, etc.) out of `node_modules` afterwards, since none of that is
  needed to _run_ the built app — this keeps the installer smaller.

**Important**: run this on the same OS/architecture you're shipping for
(Windows x64). A few npm packages compile native binaries specific to the
platform they're installed on — installing on macOS/Linux and copying
`node_modules` over would break anything like that on the target machine.

Then compile the installer itself:

```bash
cd windows-installer
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" SalesTracker.iss
```

(Or just open `SalesTracker.iss` in the Inno Setup IDE and click Compile.)

This produces `windows-installer\dist-installer\SalesTrackerSetup.exe` —
that's the single file you hand to someone. They double-click it, click
through the wizard, and Sales Tracker starts automatically at the end.

Expect the installer itself to land somewhere in the 150-300MB range
(mostly `node_modules` and the portable Node/MongoDB runtimes) and the
compile step to take a few minutes — that's normal, not a hang.

## Testing before you hand it out

Run the installer yourself on a clean-ish Windows machine (or VM) first:

1. Run `SalesTrackerSetup.exe`, accept the defaults.
2. It should launch automatically at the end — a console window shows
   MongoDB/app startup progress, then your browser opens to
   `http://localhost:3000`.
3. Create a shop/account, add a sale, close the app window, relaunch it
   from the Desktop icon — your data should still be there (confirms
   MongoDB's data directory persisted correctly).
4. Try "Stop Sales Tracker" from the Start Menu, confirm `mongod.exe` is
   no longer running (Task Manager), then relaunch and confirm it starts
   cleanly again.
5. Uninstall via "Add or Remove Programs" and confirm the `data`/`logs`
   folders are intentionally left behind (see note in `SalesTracker.iss`)
   — the shop's data isn't wiped just because the program was removed.

## Troubleshooting: "MongoDB did not start within 30 seconds"

`start.bat` waits up to 30 seconds for MongoDB to accept connections, then
gives up with this message. That means `mongod.exe` launched but exited
(or never bound its port) shortly after - check, in order:

1. **`logs\mongod-launch.log` and `logs\mongod-launch.err.log`** - these
   capture mongod's console output from the moment it launches, which is
   normally invisible since it runs hidden. If `mongod.log` itself (the
   file MongoDB writes once it's actually up) is empty or missing, mongod
   failed before reaching that point - these two files are where the real
   reason shows up instead.
2. **Missing Visual C++ Redistributable (x64)** - the most common cause
   of an early, silent failure like this. Install the [Microsoft Visual
   C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)
   if it's not already on the machine.
3. **CPU without AVX support** - MongoDB 5.0+ requires it. Mostly affects
   older hardware or VMs without AVX passthrough enabled; the launch log
   will say so explicitly if this is it.
4. **Wrong MongoDB build** - e.g. a 32-bit or ARM zip on an x64 machine.
   `start.bat` would normally catch a missing/misplaced `mongod.exe` with
   a different, earlier error ("MongoDB was not found at..."), so this is
   less likely if you got this far.

To see the raw, unfiltered result directly (bypassing `start.bat`
entirely), open a Command Prompt and run:

```
cd "<install folder>\mongodb\bin"
mongod.exe --dbpath "<install folder>\data\db"
```

Either a Windows dialog will complain it can't start the program (points
to #2 or #4 above), or mongod will print its own error directly in that
window.

## Known simplifications (fine for a fully local, single-PC install)

- **Auth secret**: the app falls back to a built-in default
  `ACCOUNTS_SECRET` when none is set (`src/accounts/setup.ts`). That's
  fine as long as this only ever runs on `localhost` and isn't exposed to
  a network. If you ever port-forward this or run it somewhere reachable
  by others, set a real `ACCOUNTS_SECRET` (edit `start.bat` and add
  `set "ACCOUNTS_SECRET=<something random>"` above the `node` line).
- **Password-reset emails**: `start.bat` sets `MAILGUN_API_KEY`/
  `MAILGUN_DOMAIN` to placeholder values (`not-configured`). These *must*
  be set to something non-empty or the app fails to start entirely — its
  `Emailer` class (`src/server/modules/email/email.service.ts`) throws in
  its constructor if either is missing, and it's constructed eagerly
  during server boot (`src/accounts/setup.ts`), not lazily when an email
  is actually sent. With the placeholders, the app starts fine, but an
  actual password-reset attempt will fail with a Mailgun auth error - not
  an issue for a single local user who won't be using that flow. To
  enable real email sending, replace the placeholders in `start.bat` with
  real Mailgun credentials.
- **Port 3000 / 27017 already in use**: if something else on the machine
  is already using either port, `start.bat` will either reuse an existing
  MongoDB on 27017 (intentional — see the script) or fail to bind port
  3000 for the app (shows an error in the console window). Change
  `MONGO_PORT` or `PORT` near the top of `start.bat` if that ever happens.
- **No Windows service / autostart**: this launches on demand from a
  shortcut, not as a background Windows service that starts at boot. If
  that's wanted later, `mongod.exe --install` can register MongoDB as a
  proper Windows service, and something like NSSM can do the same for the
  Node process — happy to build that out if you want it.
- **"DB Backup" says mongoexport isn't installed**: the app's dashboard
  has a `/dbbackup` route that shells out to `mongoexport` - a MongoDB
  *client tool*, shipped as a **separate download** from the server
  binaries (`mongodb.com/try/download/database-tools`). Step 4 of the
  one-time setup above bundles this in automatically if you downloaded it
  before compiling - if you're seeing this error, you likely skipped that
  step. Either go back and add `mongodb-tools-runtime\bin\mongoexport.exe`
  and recompile, or just skip "DB Backup" entirely and copy the whole
  `data\db` folder somewhere safe while the app is stopped instead (a
  complete backup on its own, no tooling needed).
