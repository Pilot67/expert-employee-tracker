SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;

SELECT role.title as Roles, employee.first_name, department.name as 'department'
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
ORDER BY role.title;

