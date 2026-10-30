DELETE FROM OrderLines
WHERE OrderId IN (SELECT Id FROM Orders WHERE Status = 'Cancelled');

DELETE FROM Orders
WHERE Status = 'Cancelled';
