# Warung Ibuk Iyos API - Quick Start

This README contains quick steps to set up and run the API locally. Follow the commands if you're running on Windows (PowerShell or CMD).

1. Copy .env:

```powershell
cd Api
Copy-Item .env.example -Destination .env
```

2. Install dependencies:

```powershell
npm install
```

3. Initialize DB and admin (optional, creates admin if not exists):

```powershell
npm run init
```

4. Run server (development):

```powershell
npm run dev
```

5. Get a token (after server is running):

```powershell
npm run get-token
```

6. Visit docs (served from API):
- YAML: http://localhost:5000/api/openapi.yaml
- JSON: http://localhost:5000/api/openapi.json
- Health: http://localhost:5000/health
