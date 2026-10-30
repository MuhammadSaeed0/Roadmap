SELECT c.Title,
       COUNT(*) AS Students,
       ROUND(AVG(ISNULL(e.Grade, 0)), 1) AS AverageGrade
FROM Courses c
JOIN Enrollments e ON e.CourseId = c.Id
GROUP BY c.Id, c.Title
ORDER BY c.Title;
