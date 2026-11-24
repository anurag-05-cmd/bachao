# Bachao

A free local study desk for working from your own syllabus, notes and previous exam papers. The app runs on loopback on Windows.

## Run the workspace

Install Node.js 22.14 or newer. From this checkout in PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5173. Use `npm.cmd run build` to check the production bundle. Dependencies and build output stay outside Git. Keep personal study material in the browser or in the ignored private directories.
