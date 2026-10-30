-- Add rows
INSERT INTO Products (Name, Price, Stock)
VALUES ('Webcam', 59.00, 40);

-- See which rows will change, then change them
SELECT * FROM Products WHERE Id = 2;

UPDATE Products
SET Price = Price * 1.10,
    Stock = Stock - 1
WHERE Id = 2;

-- Remove rows (always with a WHERE)
DELETE FROM Products WHERE Stock = 0;

-- Try a change safely and undo it
BEGIN TRANSACTION;
UPDATE Products SET Price = 0;      -- oops: no WHERE
SELECT Name, Price FROM Products;   -- every price is now 0
ROLLBACK;                           -- nothing was saved
