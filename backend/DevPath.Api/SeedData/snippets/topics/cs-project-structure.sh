# Create a solution with an app and a library, then wire them together
dotnet new sln -n Inventory
dotnet new console -n Inventory.App
dotnet new classlib -n Inventory.Core
dotnet sln add Inventory.App Inventory.Core
dotnet add Inventory.App reference Inventory.Core

dotnet build              # compiles everything into bin/
dotnet run --project Inventory.App
