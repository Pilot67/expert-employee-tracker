INSERT INTO department (name)
VALUES ("Accounting"),
("Maintenance"),
("Corporate"),
("IT"),
("Retail");

INSERT INTO role 
    (title, salary, department_id)
VALUES
    ("Fitter", 47000, 2),
    ("Senior Accountant", 130000, 1),
    ("Store Manager", 83000, 5),
    ("Assistant", 43000, 5),
    ("Electrician", 55000, 2),
    ("Web Developer", 99000, 4),
    ("Front End Developer", 111000, 4),
    ("HR Manager", 127000, 3),
    ("CEO",200000,3);

INSERT INTO employee 
    (first_name, last_name, role_id, manager_id)
VALUES 
    ("Wayne", "Evans", 9, NULL),
    ("Stuart", "Simmons", 5, 1),
    ("John", "Smith", 6, NULL),
    ("Patty", "Wagstaff", 7, 3),
    ("Jeff", "Johnson", 1, 2),
    ("Benn", "Benn", 8, NULL);