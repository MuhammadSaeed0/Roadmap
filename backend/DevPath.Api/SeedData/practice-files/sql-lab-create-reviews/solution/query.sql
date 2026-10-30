CREATE TABLE Reviews (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL REFERENCES Products(Id),
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(500) NULL,
    CreatedOn DATE NOT NULL
);

INSERT INTO Reviews (ProductId, Rating, Comment, CreatedOn) VALUES
    (1, 5, N'Great keyboard', '2025-10-01'),
    (1, 4, NULL, '2025-10-02');
