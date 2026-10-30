/**
 * Sample databases for the SQL Playground and SQL exercises. They load into SQLite in the learner's browser.
 * The backend lists the same names (DbSeeder.SqlDatasets), so every SQL exercise points at one of these.
 * Changing the data changes exercise answers: frontend/src/app/core/runners/sql-exercises.spec.ts re-checks them.
 */
export interface SqlDataset { key: 'shop' | 'hr' | 'school'; setup: string; }

const shop = `
CREATE TABLE Categories (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name NVARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE Products (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name NVARCHAR(100) NOT NULL,
  Price DECIMAL(10, 2) NOT NULL CHECK (Price >= 0),
  Stock INT NOT NULL DEFAULT 0,
  CategoryId INT NOT NULL REFERENCES Categories(Id),
  IsActive BIT NOT NULL DEFAULT 1
);
CREATE TABLE Customers (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name NVARCHAR(100) NOT NULL,
  Email NVARCHAR(200) NOT NULL UNIQUE,
  City NVARCHAR(50) NOT NULL,
  JoinedOn DATE NOT NULL
);
CREATE TABLE Orders (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  CustomerId INT NOT NULL REFERENCES Customers(Id),
  OrderDate DATE NOT NULL,
  Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled'))
);
CREATE TABLE OrderLines (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  OrderId INT NOT NULL REFERENCES Orders(Id),
  ProductId INT NOT NULL REFERENCES Products(Id),
  Quantity INT NOT NULL CHECK (Quantity > 0),
  UnitPrice DECIMAL(10, 2) NOT NULL
);
INSERT INTO Categories (Name) VALUES ('Keyboards'), ('Mice'), ('Displays'), ('Audio'), ('Storage'), ('Cables');
INSERT INTO Products (Name, Price, Stock, CategoryId, IsActive) VALUES
  ('Mechanical Keyboard', 89.00, 25, 1, 1), ('Wireless Keyboard', 49.99, 40, 1, 1), ('Compact Keyboard', 39.50, 0, 1, 1),
  ('Gaming Mouse', 59.00, 30, 2, 1), ('Office Mouse', 15.99, 120, 2, 1), ('Vertical Mouse', 44.00, 8, 2, 1),
  ('27" Monitor', 249.00, 12, 3, 1), ('24" Monitor', 169.00, 20, 3, 1), ('Portable Monitor', 199.00, 5, 3, 0),
  ('Headset', 79.00, 18, 4, 1), ('USB Microphone', 109.00, 7, 4, 1), ('Speakers', 35.00, 0, 4, 1),
  ('1TB SSD', 95.00, 33, 5, 1), ('2TB HDD', 64.00, 15, 5, 1), ('USB Flash 64GB', 12.50, 200, 5, 1),
  ('HDMI Cable', 9.99, 150, 6, 1), ('USB-C Cable', 7.50, 180, 6, 1), ('DisplayPort Cable', 14.00, 60, 6, 1),
  ('Webcam', 69.00, 22, 4, 1), ('Docking Station', 189.00, 3, 6, 1);
INSERT INTO Customers (Name, Email, City, JoinedOn) VALUES
  ('Sara Ahmed', 'sara@example.com', 'Cairo', '2025-01-12'), ('Omar Khaled', 'omar@example.com', 'Alexandria', '2025-02-03'),
  ('Mona Hassan', 'mona@example.com', 'Cairo', '2025-02-20'), ('Youssef Ali', 'youssef@example.com', 'Giza', '2025-03-08'),
  ('Laila Nabil', 'laila@example.com', 'Mansoura', '2025-03-30'), ('Karim Adel', 'karim@example.com', 'Cairo', '2025-04-14'),
  ('Nour Samir', 'nour@example.com', 'Alexandria', '2025-05-02'), ('Hana Tarek', 'hana@example.com', 'Giza', '2025-05-19'),
  ('Ali Mostafa', 'ali@example.com', 'Aswan', '2025-06-07'), ('Dina Fathy', 'dina@example.com', 'Cairo', '2025-06-25'),
  ('Tamer Saeed', 'tamer@example.com', 'Tanta', '2025-07-11'), ('Reem Yasser', 'reem@example.com', 'Alexandria', '2025-08-01');
INSERT INTO Orders (CustomerId, OrderDate, Status) VALUES
  (1, '2025-03-01', 'Delivered'), (2, '2025-03-05', 'Delivered'), (1, '2025-03-18', 'Delivered'), (3, '2025-04-02', 'Delivered'),
  (4, '2025-04-10', 'Cancelled'), (5, '2025-04-22', 'Delivered'), (6, '2025-05-03', 'Delivered'), (2, '2025-05-15', 'Shipped'),
  (7, '2025-05-28', 'Delivered'), (8, '2025-06-09', 'Delivered'), (1, '2025-06-21', 'Delivered'), (3, '2025-07-04', 'Shipped'),
  (9, '2025-07-16', 'Delivered'), (10, '2025-07-30', 'Delivered'), (6, '2025-08-11', 'Delivered'), (4, '2025-08-23', 'Pending'),
  (2, '2025-09-02', 'Delivered'), (5, '2025-09-14', 'Shipped'), (10, '2025-09-26', 'Pending'), (1, '2025-10-05', 'Pending');
INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice) VALUES
  (1, 1, 1, 89.00), (1, 5, 2, 15.99), (2, 7, 1, 249.00), (2, 16, 2, 9.99), (3, 13, 2, 95.00),
  (4, 10, 1, 79.00), (4, 17, 3, 7.50), (5, 4, 1, 59.00), (6, 2, 1, 49.99), (6, 15, 4, 12.50),
  (7, 8, 2, 169.00), (7, 18, 2, 14.00), (8, 11, 1, 109.00), (9, 19, 1, 69.00), (9, 5, 1, 15.99),
  (10, 6, 1, 44.00), (10, 16, 1, 9.99), (11, 20, 1, 189.00), (11, 17, 2, 7.50), (12, 14, 1, 64.00),
  (13, 1, 1, 89.00), (13, 4, 1, 59.00), (14, 7, 1, 249.00), (14, 13, 1, 95.00), (15, 10, 2, 79.00),
  (16, 2, 1, 49.99), (17, 15, 10, 12.50), (17, 16, 3, 9.99), (18, 8, 1, 169.00), (19, 19, 1, 69.00),
  (20, 13, 1, 95.00), (20, 5, 1, 15.99);
`;

const hr = `
CREATE TABLE Departments (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name NVARCHAR(50) NOT NULL UNIQUE,
  Location NVARCHAR(50) NOT NULL
);
CREATE TABLE Employees (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  FirstName NVARCHAR(50) NOT NULL,
  LastName NVARCHAR(50) NOT NULL,
  Email NVARCHAR(200) NOT NULL UNIQUE,
  DepartmentId INT NOT NULL REFERENCES Departments(Id),
  ManagerId INT NULL REFERENCES Employees(Id),
  JobTitle NVARCHAR(80) NOT NULL,
  Salary DECIMAL(10, 2) NOT NULL CHECK (Salary > 0),
  HireDate DATE NOT NULL,
  IsActive BIT NOT NULL DEFAULT 1
);
CREATE TABLE Projects (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name NVARCHAR(100) NOT NULL,
  DepartmentId INT NOT NULL REFERENCES Departments(Id),
  StartDate DATE NOT NULL,
  Budget DECIMAL(12, 2) NOT NULL
);
CREATE TABLE EmployeeProjects (
  EmployeeId INT NOT NULL REFERENCES Employees(Id),
  ProjectId INT NOT NULL REFERENCES Projects(Id),
  Role NVARCHAR(50) NOT NULL,
  PRIMARY KEY (EmployeeId, ProjectId)
);
INSERT INTO Departments (Name, Location) VALUES
  ('Engineering', 'Cairo'), ('Sales', 'Alexandria'), ('Marketing', 'Cairo'), ('Finance', 'Giza'), ('Support', 'Cairo'), ('Research', 'Remote');
INSERT INTO Employees (FirstName, LastName, Email, DepartmentId, ManagerId, JobTitle, Salary, HireDate, IsActive) VALUES
  ('Ahmed', 'Mansour', 'ahmed.m@corp.test', 1, NULL, 'Head of Engineering', 52000, '2018-02-01', 1),
  ('Salma', 'Fouad', 'salma.f@corp.test', 1, 1, 'Senior Developer', 41000, '2019-06-15', 1),
  ('Mahmoud', 'Zaki', 'mahmoud.z@corp.test', 1, 2, 'Developer', 30000, '2021-09-01', 1),
  ('Yara', 'Hamdy', 'yara.h@corp.test', 1, 2, 'Developer', 31500, '2022-01-10', 1),
  ('Khaled', 'Osman', 'khaled.o@corp.test', 1, 2, 'Junior Developer', 21000, '2024-03-04', 1),
  ('Rana', 'Salem', 'rana.s@corp.test', 1, 1, 'QA Engineer', 27000, '2020-11-23', 1),
  ('Hassan', 'Gamal', 'hassan.g@corp.test', 2, NULL, 'Sales Director', 48000, '2017-04-12', 1),
  ('Aya', 'Mahmoud', 'aya.m@corp.test', 2, 7, 'Account Manager', 29000, '2020-05-05', 1),
  ('Mostafa', 'Ibrahim', 'mostafa.i@corp.test', 2, 7, 'Sales Representative', 18500, '2023-02-27', 1),
  ('Nada', 'Kamal', 'nada.k@corp.test', 2, 7, 'Sales Representative', 19000, '2022-08-08', 0),
  ('Ola', 'Wagdy', 'ola.w@corp.test', 3, NULL, 'Marketing Manager', 39000, '2019-01-21', 1),
  ('Sherif', 'Nasr', 'sherif.n@corp.test', 3, 11, 'Content Writer', 17000, '2023-07-17', 1),
  ('Marwa', 'Lotfy', 'marwa.l@corp.test', 3, 11, 'Designer', 24000, '2021-03-29', 1),
  ('Tarek', 'Helmy', 'tarek.h@corp.test', 4, NULL, 'Finance Manager', 45000, '2016-10-03', 1),
  ('Heba', 'Sobhy', 'heba.s@corp.test', 4, 14, 'Accountant', 23000, '2022-05-16', 1),
  ('Wael', 'Fawzy', 'wael.f@corp.test', 5, NULL, 'Support Lead', 30000, '2019-09-09', 1),
  ('Eman', 'Rashad', 'eman.r@corp.test', 5, 16, 'Support Agent', 15500, '2023-11-06', 1),
  ('Adel', 'Shawky', 'adel.s@corp.test', 5, 16, 'Support Agent', 16000, '2024-01-22', 1),
  ('Farida', 'Anwar', 'farida.a@corp.test', 6, NULL, 'Research Lead', 50000, '2020-02-17', 1),
  ('Ziad', 'Hosny', 'ziad.h@corp.test', 6, 19, 'Data Scientist', 38000, '2022-10-31', 1);
INSERT INTO Projects (Name, DepartmentId, StartDate, Budget) VALUES
  ('Customer Portal', 1, '2025-01-15', 250000), ('Mobile App', 1, '2025-04-01', 180000), ('Spring Campaign', 3, '2025-03-01', 60000),
  ('Partner Program', 2, '2025-02-10', 90000), ('Help Center', 5, '2025-05-20', 40000), ('Forecasting Model', 6, '2025-06-01', 120000);
INSERT INTO EmployeeProjects (EmployeeId, ProjectId, Role) VALUES
  (2, 1, 'Tech Lead'), (3, 1, 'Developer'), (4, 1, 'Developer'), (6, 1, 'Tester'),
  (2, 2, 'Reviewer'), (4, 2, 'Developer'), (5, 2, 'Developer'),
  (11, 3, 'Owner'), (12, 3, 'Writer'), (13, 3, 'Designer'),
  (7, 4, 'Owner'), (8, 4, 'Account Manager'),
  (16, 5, 'Owner'), (17, 5, 'Writer'), (12, 5, 'Writer'),
  (19, 6, 'Owner'), (20, 6, 'Data Scientist'), (3, 6, 'Developer');
`;

const school = `
CREATE TABLE Teachers (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name NVARCHAR(100) NOT NULL,
  Subject NVARCHAR(50) NOT NULL
);
CREATE TABLE Courses (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Title NVARCHAR(100) NOT NULL,
  TeacherId INT NULL REFERENCES Teachers(Id),
  Credits INT NOT NULL CHECK (Credits BETWEEN 1 AND 6)
);
CREATE TABLE Students (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name NVARCHAR(100) NOT NULL,
  BirthDate DATE NOT NULL,
  City NVARCHAR(50) NOT NULL,
  Email NVARCHAR(200) NULL
);
CREATE TABLE Enrollments (
  StudentId INT NOT NULL REFERENCES Students(Id),
  CourseId INT NOT NULL REFERENCES Courses(Id),
  EnrolledOn DATE NOT NULL,
  Grade INT NULL CHECK (Grade BETWEEN 0 AND 100),
  PRIMARY KEY (StudentId, CourseId)
);
INSERT INTO Teachers (Name, Subject) VALUES
  ('Dr. Amal Fahmy', 'Mathematics'), ('Mr. Samy Radwan', 'Programming'), ('Ms. Ghada Ezzat', 'Databases'), ('Dr. Hesham Badr', 'Networks'), ('Ms. Iman Saad', 'English');
INSERT INTO Courses (Title, TeacherId, Credits) VALUES
  ('Calculus I', 1, 4), ('Intro to Programming', 2, 4), ('Object-Oriented Programming', 2, 3), ('Databases', 3, 3),
  ('Computer Networks', 4, 3), ('Technical Writing', 5, 2), ('Discrete Mathematics', 1, 3), ('Web Development', NULL, 3);
INSERT INTO Students (Name, BirthDate, City, Email) VALUES
  ('Ahmed Samy', '2005-03-14', 'Cairo', 'ahmed.samy@uni.test'), ('Basma Adel', '2004-11-02', 'Giza', 'basma@uni.test'),
  ('Chadi Nour', '2005-07-21', 'Alexandria', NULL), ('Doaa Fathi', '2006-01-30', 'Cairo', 'doaa@uni.test'),
  ('Essam Hany', '2004-05-09', 'Tanta', 'essam@uni.test'), ('Farah Moussa', '2005-09-17', 'Cairo', NULL),
  ('Gamal Rizk', '2003-12-25', 'Aswan', 'gamal@uni.test'), ('Hoda Kamel', '2005-02-11', 'Alexandria', 'hoda@uni.test'),
  ('Islam Wahba', '2006-06-06', 'Giza', 'islam@uni.test'), ('Jana Lotfi', '2005-10-28', 'Cairo', 'jana@uni.test'),
  ('Kareem Sabry', '2004-08-19', 'Mansoura', NULL), ('Lina Zidan', '2006-04-03', 'Cairo', 'lina@uni.test');
INSERT INTO Enrollments (StudentId, CourseId, EnrolledOn, Grade) VALUES
  (1, 1, '2025-09-15', 78), (1, 2, '2025-09-15', 91), (1, 4, '2025-09-16', 85),
  (2, 1, '2025-09-15', 64), (2, 3, '2025-09-17', 72), (2, 6, '2025-09-18', 88),
  (3, 2, '2025-09-15', 55), (3, 4, '2025-09-16', 61), (3, 5, '2025-09-16', NULL),
  (4, 2, '2025-09-15', 95), (4, 3, '2025-09-17', 89), (4, 7, '2025-09-19', 93),
  (5, 1, '2025-09-15', 47), (5, 5, '2025-09-16', 70),
  (6, 4, '2025-09-16', 82), (6, 6, '2025-09-18', 90), (6, 2, '2025-09-15', 76),
  (7, 5, '2025-09-16', 68), (7, 7, '2025-09-19', 59),
  (8, 2, '2025-09-15', 84), (8, 3, '2025-09-17', NULL), (8, 4, '2025-09-16', 79),
  (9, 1, '2025-09-15', 73), (10, 3, '2025-09-17', 96), (10, 4, '2025-09-16', 91), (10, 7, '2025-09-19', 87),
  (11, 6, '2025-09-18', 66), (12, 2, '2025-09-15', 58);
`;

export const SQL_DATASETS: Record<SqlDataset['key'], SqlDataset> = {
  shop: { key: 'shop', setup: shop.trim() },
  hr: { key: 'hr', setup: hr.trim() },
  school: { key: 'school', setup: school.trim() },
};

export function datasetSetup(key: string | null | undefined): string {
  return (SQL_DATASETS as Record<string, SqlDataset>)[key ?? '']?.setup ?? '';
}
