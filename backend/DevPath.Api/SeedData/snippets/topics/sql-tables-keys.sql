DROP TABLE IF EXISTS Products;   -- replace the practice table from the first topic

CREATE TABLE Categories (
    Id   INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Products (
    Id          INT IDENTITY PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    Price       DECIMAL(10, 2) NOT NULL CHECK (Price >= 0),
    Stock       INT NOT NULL DEFAULT 0,
    Description NVARCHAR(500) NULL,             -- optional
    CategoryId  INT NOT NULL
        FOREIGN KEY REFERENCES Categories(Id)   -- must be a real category
);

INSERT INTO Categories (Name) VALUES ('Accessories'), ('Displays');
INSERT INTO Products (Name, Price, Stock, CategoryId)
VALUES ('Keyboard', 49.99, 120, 1), ('Monitor', 179.00, 15, 2);

-- NULL means "no value": compare with IS NULL, never = NULL
SELECT Name FROM Products WHERE Description IS NULL;
