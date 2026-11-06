-- A parameterised procedure that changes two rows in one transaction.
CREATE OR ALTER PROCEDURE dbo.TransferStock
    @ProductId int,
    @FromWarehouseId int,
    @ToWarehouseId int,
    @Quantity int
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;              -- any error rolls the whole transaction back

    IF @Quantity <= 0
        THROW 50001, 'Quantity must be positive.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE dbo.Stock
        SET Quantity = Quantity - @Quantity
        WHERE ProductId = @ProductId AND WarehouseId = @FromWarehouseId AND Quantity >= @Quantity;

        IF @@ROWCOUNT = 0
            THROW 50002, 'Not enough stock in the source warehouse.', 1;

        UPDATE dbo.Stock
        SET Quantity = Quantity + @Quantity
        WHERE ProductId = @ProductId AND WarehouseId = @ToWarehouseId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;                      -- let the caller see the original error
    END CATCH
END;
GO

-- A view: a saved query the API can read like a table.
CREATE OR ALTER VIEW dbo.LowStockProducts AS
SELECT p.Id, p.Name, s.WarehouseId, s.Quantity
FROM dbo.Products p
JOIN dbo.Stock s ON s.ProductId = p.Id
WHERE s.Quantity < p.ReorderLevel;
GO

-- From EF Core (interpolated values become SQL parameters, so this is injection-safe):
--   await db.Database.ExecuteSqlAsync($"EXEC dbo.TransferStock {productId}, {from}, {to}, {quantity}", ct);
--   var low = await db.Set<LowStockRow>().FromSql($"SELECT * FROM dbo.LowStockProducts").ToListAsync(ct);
