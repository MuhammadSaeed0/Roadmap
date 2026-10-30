UPDATE Products
SET Price = Price * 1.10
WHERE CategoryId = (SELECT Id FROM Categories WHERE Name = 'Mice');
