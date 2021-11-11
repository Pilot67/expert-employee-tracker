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
    updtaeEmployeeRole: "Update an Employee Role",
    updateEmployeeMgr: "Update Employee's Manager",
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
    };
    console.log(`Connected to the company_db database.`)
    mainMenu()
})

function mainMenu() {
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
                menuPrompt.updateEmployeeMgr,
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
            case menuPrompt.addEmployee:
                addEmployee();
                break;
            case menuPrompt.updtaeEmployeeRole:
                updateEmployee();
                break;
            case menuPrompt.updateEmployeeMgr:
                updateEmployeeMgr();
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
    console.log('Adding a new Role\n');
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
            const selRow = rows.filter((item) => item.Department === answers.department)
            const params = [answers.newRole.trim(),answers.newSalary,selRow[0].ID]
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
function addEmployee() {
    console.clear();
    console.log('Adding a new Employee\n');
    const roleSql = `SELECT role.title as role, role.id as ID 
                FROM role ORDER BY role;`
    const managerSql = `SELECT concat(employee.first_name, " ", employee.last_name) as managerName, employee.id as ID
                FROM employee ORDER BY managerName;`
    return db.promise().query(roleSql)
    .then(([roleSearch,fields]) => {
        return db.promise().query(managerSql)
        .then(([managerSearch, err]) => {
            const roleList = roleSearch.map((item) => item.role)
            const managerList = managerSearch.map((item) => item.managerName)
            managerSearch.unshift({managerName:"No Manager", ID:null})
            managerList.unshift('No Manager')
            inquirer.prompt([
                {
                    name: "newFirstName",
                    type: "input",
                    message: "Input the employee's First Name"
                },
                {
                    name: "newLastName",
                    type: "input",
                    message: "Input the employee's Last Name"
                },
                {
                    name: "newRole",
                    type: "list",
                    message: "Choose from the list the employee's role",
                    choices: roleList
                },
                {
                    name: "newManager",
                    type: "list",
                    message:"Choose from the list the employee's manager",
                    choices: managerList
                },
            ])
            .then((answers) => {
                const selRole = roleSearch.filter((item) => item.role === answers.newRole)
                const selManager = managerSearch.filter((item) => item.managerName === answers.newManager)
                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`
                const params = [answers.newFirstName.trim(), answers.newLastName.trim(), selRole[0].ID, selManager[0].ID]
                return db.promise().query(sql, params)
                .then((res, err) => {
                    console.log('New Employee Added \n')
                })
                .catch((err) => console.log('500',err))
                .then(() => {
                    mainMenu()
                });            
            })

        })
    })
    .catch((err) => console.log('500',err))
}

function updateEmployee() {
    console.clear();
    console.log('Updating an Employee\n');
    const employeeSql = `SELECT concat(employee.first_name, " ", employee.last_name) as Employee, employee.id as ID
                FROM employee ORDER BY Employee;`
    const roleSql = `SELECT role.title as role, role.id as ID 
                FROM role ORDER BY role;`
    return db.promise().query(roleSql)
    .then(([roleSearch,fields]) => {
        return db.promise().query(employeeSql)
        .then(([employeeSearch, err]) => {
            const roleList = roleSearch.map((item) => item.role)
            const employeeList = employeeSearch.map((item) => item.Employee)
            inquirer.prompt([
                {
                    name: "updateName",
                    type: "list",
                    message:"Choose which Employee to update",
                    choices: employeeList
                },
                {
                    name: "updateRole",
                    type: "list",
                    message: "Choose from the list the employee's new role",
                    choices: roleList
                },
            ])
            .then((answers) => {
                const selEmployee = employeeSearch.filter((item) => item.Employee === answers.updateName)
                const selRole = roleSearch.filter((item) => item.role === answers.updateRole)
                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`
                const params = [selRole[0].ID, selEmployee[0].ID]
                return db.promise().query(sql, params)
                .then((res, err) => console.log('Updated Employee \n'))
                .catch((err) => console.log('500',err))
                .then(() => mainMenu());            
            })

        })
    })
}

function updateEmployeeMgr() {
    console.clear();
    console.log("Updating Employee's Manager\n");
    const employeeSql = `SELECT concat(employee.first_name, " ", employee.last_name) as Employee, employee.id as ID
                FROM employee ORDER BY Employee;`
    return db.promise().query(employeeSql)
    .then(([employeeSearch,fields]) => {
        const employeeList = employeeSearch.map((item) => item.Employee)
        const managerList = employeeList.map((item) => item)
        managerList.unshift('No Manager')
        inquirer.prompt([
            {
                name: "updateName",
                type: "list",
                message:"Choose which Employee to update",
                choices: employeeList
            },
            {
                name: "updateMgr",
                type: "list",
                message: "Choose their new Manager",
                choices: managerList
            },
        ])
        .then((answers) => {
            employeeSearch.unshift({Employee:"No Manager", ID:null})
            const selEmployee = employeeSearch.filter((item) => item.Employee === answers.updateName)
            const selMgr = employeeSearch.filter((item) => item.Employee === answers.updateMgr)
            const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`
            const params = [selMgr[0].ID, selEmployee[0].ID]
            return db.promise().query(sql, params)
            .then((res, err) => console.log("Updated Employee's Manager \n"))
            .catch((err) => console.log('500',err))
            .then(() => mainMenu());            
        })

    })
}