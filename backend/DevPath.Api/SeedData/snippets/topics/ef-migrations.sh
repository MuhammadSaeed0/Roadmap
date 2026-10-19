# Install the tool once
dotnet tool install --global dotnet-ef

# After changing the model
dotnet ef migrations add AddProductBarcode
#   → Migrations/20261019_AddProductBarcode.cs  (review Up() and Down()!)

dotnet ef database update            # apply pending migrations
dotnet ef migrations list            # see applied / pending
dotnet ef migrations script --idempotent -o deploy.sql   # SQL for a DBA to review

# Undo the last (unapplied) migration
dotnet ef migrations remove
