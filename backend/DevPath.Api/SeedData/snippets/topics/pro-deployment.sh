# Backend: build a self-contained release folder
dotnet publish backend/SalesOrders.Api -c Release -o ./publish/api

# Database: produce a reviewable, re-runnable script
dotnet ef migrations script --idempotent -p backend/SalesOrders.Api -o ./publish/migrate.sql

# Frontend: production build → dist/
cd frontend && npm ci && npx ng build && cd ..

# Run the published API with environment-specific settings
$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:ConnectionStrings__Default = "Server=.;Database=SalesOrders;Trusted_Connection=True;TrustServerCertificate=True"
dotnet ./publish/api/SalesOrders.Api.dll

# Smoke test
curl http://localhost:5000/api/health
