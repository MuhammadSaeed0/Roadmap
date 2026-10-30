-- Run this in a New Query window in SSMS to get a table to practise on.
CREATE DATABASE Shop;
GO
USE Shop;
GO

CREATE TABLE Products (
    Id    INT IDENTITY PRIMARY KEY,   -- a number that identifies each row
    Name  NVARCHAR(100) NOT NULL,     -- text
    Price DECIMAL(10, 2) NOT NULL,    -- money: exact decimals
    Stock INT NOT NULL                -- whole numbers
);

INSERT INTO Products (Name, Price, Stock)
VALUES ('Keyboard', 49.99, 120),
       ('Mouse',    19.99, 300),
       ('Monitor', 179.00,  15);

SELECT * FROM Products;   -- every column of every row
