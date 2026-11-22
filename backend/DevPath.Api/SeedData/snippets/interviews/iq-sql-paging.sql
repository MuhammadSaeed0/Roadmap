DECLARE @Page int = 3, @PageSize int = 20;

SELECT Id, Name, Price
FROM Products
ORDER BY Name, Id                      -- Id breaks ties so pages are stable
OFFSET (@Page - 1) * @PageSize ROWS
FETCH NEXT @PageSize ROWS ONLY;
