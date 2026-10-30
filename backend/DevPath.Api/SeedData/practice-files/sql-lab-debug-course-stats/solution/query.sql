SELECT c.Title,
       COUNT(e.StudentId) AS Students,
       ROUND(AVG(e.Grade), 1) AS AverageGrade
FROM Courses c
LEFT JOIN Enrollments e ON e.CourseId = c.Id
GROUP BY c.Id, c.Title
ORDER BY c.Title;
