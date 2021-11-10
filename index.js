const inquirer = require('inquirer');
const mysql = require('mysql2');
const table = require('console.table');


const menuPrompt = {
    allDepts: "View all Departments",
    allRoles: "View all Roles",
    allEmployees: "View all Employees",
    adddDept: "Add a Department",
    addRole: "Add a Role",
    addEmployee: "Add an Employee",
    updtaeEmployeeRole: "Update and Employee Role",
    exit: "Exit"
};

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'VisionJet',
      database: 'company_db'
    },
);
    
db.connect(err => {
    if (err) {
        console.log(err)
        //throw new Error(err)
    };
    console.log(`Connected to the company_db database.`)
    mainMenu()
})

function mainMenu() {
    //console.clear();
    inquirer.prompt([
        {
            name: "menuSelect",
            type: "list",
            message:"Please select from the list",
            choices:
                [
                menuPrompt.allDepts,
                menuPrompt.allRoles,
                menuPrompt.allEmployees,
                menuPrompt.adddDept,
                menuPrompt.addRole,
                menuPrompt.addEmployee,
                menuPrompt.updtaeEmployeeRole,
                menuPrompt.exit
                ]
        }
    ])
    .then(({menuSelect})=> {
        console.log(menuSelect);
        switch (menuSelect) {
            case menuPrompt.allDepts:
                renderAllDepts();
                break;
            case menuPrompt.allRoles:
                renderAllRoles();
                break;
            case menuPrompt.allEmployees:
                renderAllEmployees();
                break;
            case menuPrompt.adddDept:
                addDept();
                break;
            case menuPrompt.addRole:
                addRole();
                break;
            case menuPrompt.exit:
                db.end()
                return;
            default:
                mainMenu();
        }
    })
};

function renderAllDepts() {
    console.clear()
    console.log("View all Departments\n")
    const sql = `SELECT department.id as ID, department.name as Department FROM department ORDER BY id;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        console.table(rows)
        // console.log("\n")
    })
    .catch((error) => console.log(error))
    .then(() => mainMenu())
};
function renderAllRoles() {
    console.clear()
    console.log("View all Roles\n")
    const sql = `SELECT role.title as Title, role.id as ID, department.name as Department, role.salary as Salary
    FROM role
    JOIN department on role.department_id = department.id
    ORDER BY Title;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        console.table(rows)
    })
    .catch((error) => console.log(error))
    .then(() => mainMenu())
};
function renderAllEmployees() {
    console.clear()
    console.log("View all Roles\n")
    const sql = `SELECT employee.id as ID, employee.first_name as 'First Name', employee.last_name as 'Last Name', role.title as Title, department.name as Department, role.salary as Salary, concat(manager.first_name, ' ' ,  manager.last_name) as Manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department on role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
    ORDER BY ID;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        console.table(rows)
    })
    .catch((error) => console.log(error))
    .then(() => mainMenu())
};

function addDept() {
    console.clear();
    console.log('Adding a new Department');
    inquirer.prompt([
        {
            name: "deptName",
            type: "input",
            message:"What is the department Name"
        }
    ])
    .then(({deptName}) => {
        console.log(`Adding ${deptName} to Departments`)
        const sql = `INSERT INTO department (name) VALUES (?)`
        return db.promise().query(sql,deptName)
        .then((res, err) => {
            console.log('New department Added')
        })
        .catch((err) => console.status('500',err));
    })
    .then(() => {
        mainMenu();
    });
};

function addRole() {
    console.clear();
    console.log('Adding a new Role');
    const sql = `SELECT department.name as Department, department.id as ID FROM department ORDER BY department.id;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        const deptList = rows.map((item) => item.Department)
        inquirer.prompt([
            {
                name: "newRole",
                type: "input",
                message: "Input the new role"
            },
            {
                name: "newSalary",
                type: "input",
                message: "Input the salary of the new role",
            },
            {
                name: "department",
                type: "list",
                message:"Choose from the list the new role's department",
                choices: deptList
            },
        ])
        .then((answers) => {
            const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`
            const params = [answers.newRole.trim(),answers.newSalary,deptList.indexOf(answers.department)+1]
            return db.promise().query(sql,params)
            .then((res, err) => {
                console.log('New Role Added \n')
            })
            .catch((err) => console.log('500',err))
            .then(() => {
                mainMenu()
            });
            
        })
    })
    .catch((err) => console.log('500',err))
}