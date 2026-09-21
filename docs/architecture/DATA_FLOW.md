# Data Flow (Frontend)

## Health check (implemented)

```
DashboardPage
  → useSystemStatus.refresh()
    → fetchHealth()
      → apiGet("/health")
        → GET {VITE_API_BASE_URL}/health
          → JSON { status }
            → SystemStatusCard (healthy | error | loading)
```

Errors are mapped to `ApiError` messages; the shell stays mounted.

## Configuration flow

```
.env / Docker build-arg
  → import.meta.env.VITE_API_BASE_URL
    → getApiBaseUrl()
      → all apiGet URLs
      → Settings page display
```

## Future monitoring data (planned)

```
Backend call / conversation / appointment APIs
  → src/services/* (new modules)
    → pages/components
```

No domain data is stored in `src/store/` today — only sidebar UI chrome.
