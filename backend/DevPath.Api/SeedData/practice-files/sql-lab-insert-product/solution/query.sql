INSERT INTO Products (Name, Price, Stock, CategoryId)
VALUES ('Laptop Stand', 39.99, 10, (SELECT Id FROM Categories WHERE Name = 'Displays'));
