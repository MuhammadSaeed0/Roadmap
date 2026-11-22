DECLARE @New TABLE (Id int);

INSERT INTO Customers (Name, Email)
OUTPUT inserted.Id INTO @New
VALUES (N'Mona Ali', N'mona@example.com');

SELECT Id FROM @New;
