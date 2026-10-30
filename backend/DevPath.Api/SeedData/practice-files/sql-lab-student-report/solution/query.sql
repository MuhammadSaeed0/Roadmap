SELECT s.Name AS Student,
       COUNT(*) AS Courses,
       ROUND(AVG(e.Grade), 1) AS Average,
       CASE WHEN AVG(e.Grade) >= 85 THEN 'Honors'
            WHEN AVG(e.Grade) < 60 THEN 'At risk'
            ELSE 'On track' END AS Status
FROM Students s
JOIN Enrollments e ON e.StudentId = s.Id
WHERE e.Grade IS NOT NULL
GROUP BY s.Id, s.Name
ORDER BY Average DESC, Student;
