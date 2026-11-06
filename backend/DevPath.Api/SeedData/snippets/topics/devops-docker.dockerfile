# Stage 1: build and publish with the full SDK image.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Copy the project file first: restore is cached until the dependencies change.
COPY Inventory.Api/Inventory.Api.csproj Inventory.Api/
RUN dotnet restore Inventory.Api/Inventory.Api.csproj
COPY . .
RUN dotnet publish Inventory.Api/Inventory.Api.csproj -c Release -o /app --no-restore

# Stage 2: run on the much smaller ASP.NET runtime image.
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app .
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "Inventory.Api.dll"]

# compose.yaml (next to the Dockerfile):
#
# services:
#   api:
#     build: .
#     ports: ["8080:8080"]
#     environment:
#       ConnectionStrings__Inventory: "Server=db;Database=Inventory;User Id=sa;Password=${DB_PASSWORD};TrustServerCertificate=True"
#     depends_on:
#       db: { condition: service_healthy }
#   db:
#     image: mcr.microsoft.com/mssql/server:2022-latest
#     environment: { ACCEPT_EULA: "Y", MSSQL_SA_PASSWORD: "${DB_PASSWORD}" }
#     volumes: ["sqldata:/var/opt/mssql"]
#     healthcheck:
#       test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P \"$$MSSQL_SA_PASSWORD\" -Q 'SELECT 1'"]
#       interval: 10s
# volumes:
#   sqldata:
