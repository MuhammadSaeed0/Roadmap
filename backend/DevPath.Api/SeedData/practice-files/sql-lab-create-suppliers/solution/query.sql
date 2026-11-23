CREATE TABLE Suppliers (
  Id INT PRIMARY KEY,
  Name NVARCHAR(100) NOT NULL,
  Email NVARCHAR(200) NOT NULL UNIQUE,
  City NVARCHAR(50) NULL
);

INSERT INTO Suppliers (Id, Name, Email, City) VALUES
  (1, 'Nile Electronics', 'sales@nile.example', 'Cairo'),
  (2, 'Delta Cables', 'hello@delta.example', 'Tanta'),
  (3, 'Remote Parts', 'parts@remote.example', NULL);
