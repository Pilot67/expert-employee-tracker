INSERT INTO department (name)
VALUES ("Corporate"),
("Accounting"),
("Human Resources"),
("Maintenance"),
("IT"),
("Retail"),
("Warehouse");

INSERT INTO role 
    (title, salary, department_id)
VALUES
    ("CEO",200000,1),
    ("Fitter", 47000, 4),
    ("Electrician", 55000, 4),
    ("Mechanic",62000,4),
    ("Senior Accountant", 130000, 2),
    ("Accountant", 85000,2),
    ("Store Manager", 83000, 6),
    ("Assistant Sales", 43000, 6),
    ("Web Developer", 99000, 5),
    ("Front End Developer", 111000, 5),
    ("HR Manager", 127000, 3);

INSERT INTO employee 
    (first_name, last_name, role_id, manager_id)
VALUES 
    ("Stuart", "Simmons", 1, NULL),
    ("Wayne", "Evans", 9, 1),
    ("Patty", "Wagstaff", 5, 1),
    ("John", "Smith", 6, 3),
    ("Jeff", "Johnson", 11, 2),
    ("Monty", "Burns",8, 4),
    ("Benn", "Benn", 7, 6);