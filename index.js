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
    deleteData: "Delete Department, Role or Employee",
    viewByDepartment: "View Employees by Department",
    viewByManager: "View Employees by Manager",
    combinedSalaries: "Display Salary Totals by Department",

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

//Check connection to the database
db.connect(err => {
    if (err) {
        console.log(err)
        return
    };
    console.log(`Connected to the company_db database.`)
    console.clear()
    console.log(`****************************************`)
    console.log(`* Expert Employee Tracking Application *`)
    console.log(`****************************************\n`)

    mainMenu()
})

//Main menu using inquirer
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
                menuPrompt.deleteData,
                menuPrompt.viewByDepartment,
                menuPrompt.viewByManager,
                menuPrompt.combinedSalaries,
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
            case menuPrompt.deleteData:
                deleteData()
                return;
            case menuPrompt.viewByDepartment:
                viewByDepartment()
                return;
            case menuPrompt.viewByManager:
                viewByManager()
                return;
            case menuPrompt.combinedSalaries:
                renderCombinedSalaries()
                return;
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
    })
    .catch((error) => console.log(error))
    .then(() => mainMenu())
};
function renderAllRoles() {
    console.clear()
    console.log("View all Roles\n")
    const sql = `SELECT role.title as Title, role.id as ID, department.name as Department, CONCAT('$',FORMAT(role.salary,2)) as Salary
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
    console.log("View all Employee's\n")
    const sql = `SELECT employee.id as ID, employee.first_name as 'First Name', employee.last_name as 'Last Name', role.title as Title, department.name as Department, CONCAT('$',FORMAT(role.salary,2)) as Salary, concat(manager.first_name, ' ' ,  manager.last_name) as Manager
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
        const sql = `INSERT INTO department (name) VALUES (?)`
        return db.promise().query(sql,deptName)
        .then((res, err) => {
            console.log('New department Added\n')
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
        const deptList = rows.map(({Department, ID}) => ({name: Department, value: ID}))
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
            const params = [answers.newRole.trim(),answers.newSalary,answers.department]
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
            const roleList = roleSearch.map(({role, ID}) => ({name: role, value: ID}))
            const managerList = managerSearch.map(({managerName, ID}) => ({name: managerName, value: ID}))
            managerList.unshift({name:"No Manager", value:null})
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
                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`
                const params = [answers.newFirstName.trim(), answers.newLastName.trim(), answers.newRole, answers.newManager]
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
            const roleList = roleSearch.map(({role, ID}) => ({name:role, value:ID}))
            const employeeList = employeeSearch.map(({Employee, ID}) => ({name: Employee, value:ID}))
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
                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`
                const params = [answers.updateRole, answers.updateName]
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
        const employeeList = employeeSearch.map(({Employee, ID}) => ({ name: Employee, value: ID}))
        const managerList = employeeList.map((item) => item)
        managerList.unshift({name:"No Manager", value:null})
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
            const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`
            const params = [answers.updateMgr, answers.updateName]
            return db.promise().query(sql, params)
            .then((res, err) => console.log("Updated Employee's Manager \n"))
            .catch((err) => console.log('500',err))
            .then(() => mainMenu());            
        })

    })
}
function deleteData() {
    console.clear()
    inquirer.prompt([
        {
            name:"deleteSelect",
            type: "list",
            message: "Select the data you would like to delete",
            choices: [
                {
                    name: "Department",
                    short: "Department Selected"
                },
                {
                    name: "Role",
                    short: "Role Selected"
                },
                {
                    name: "Employee",
                    short: "Employee Selected"
                },
                {
                    name: "Exit Menu",
                    short: "Exit Delete Menu"
                },
            ]
        }
    ])
    .then(({deleteSelect}) => {
        console.log(deleteSelect)
        switch (deleteSelect){
            case "Department":
                deleteDepartment()
                break;
            case "Role":
                deleteRole()
                break;
            case "Employee":
                deleteEmployee()
                break;
            default:
                mainMenu()
        }
    })
}

function deleteDepartment() {
    console.clear()
    console.log("Delete Department\n")
    const sql = `SELECT department.id as ID, department.name as Department FROM department ORDER BY id;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        const selDept = rows.map(({ID, Department })=> ({name: Department, value: ID, short: `${Department} Selected`}))
        inquirer.prompt(
            {
                name: "id",
                message: "Select the department to delete",
                type: "list",
                choices: selDept
            }
        )
        .then(({id}) => {
            inquirer.prompt({
                name: "yesNo",
                message: `Are you sure you want to delete ${selDept[selDept.findIndex(({value}) => value === id)].name}?`,
                type: "list",
                choices: [{name: "Yes", value: true},{name: "No", value: false}]
            })
            .then(({yesNo}) =>{
                if (yesNo){
                    const sql = `DELETE FROM department WHERE id=?;`
                    const params = [id]
                    return db.promise().query(sql,params)
                    .then(() => console.log(`Department Deleted !\n`))
                    .then(() => mainMenu())
                }else{
                    mainMenu()
                }
            })
            
            

        })
    })
    .catch((error) => console.log(error))
}
function deleteRole(){
    console.clear()
    console.log("Delete Role\n")
    const sql = `SELECT role.title as Title, role.id as ID FROM role ORDER BY Title;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        const selRole = rows.map(({Title, ID})=> ({name: Title, value: ID, short: `${Title} Selected`}))
        inquirer.prompt(
            {
                name: "id",
                message: "Select the department to delete",
                type: "list",
                choices: selRole
            }
        )
        .then(({id}) => {
            inquirer.prompt({
                name: "yesNo",
                message: `Are you sure you want to delete ${selRole[selRole.findIndex(({value}) => value === id)].name}?`,
                type: "list",
                choices: [{name: "Yes", value: true},{name: "No", value: false}]
            })
            .then(({yesNo}) =>{
                if (yesNo){
                    const sql = `DELETE FROM role WHERE id=?;`
                    const params = [id]
                    return db.promise().query(sql,params)
                    .then(() => console.log(`Role Deleted !\n`))
                    .then(() => mainMenu())
                }else{
                    mainMenu()
                }
            })
        })
    })
    .catch((error) => console.log(error))
}
function deleteEmployee(){
    console.clear()
    console.log("Delete Employee\n")
    const sql = `SELECT concat(employee.first_name, " ", employee.last_name) as Employee, employee.id as ID FROM employee ORDER BY Employee;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        const selEmployee = rows.map(({Employee, ID})=> ({name: Employee, value: ID, short: `${Employee} Selected`}))
        inquirer.prompt(
            {
                name: "id",
                message: "Select the Employee to delete",
                type: "list",
                choices: selEmployee
            }
        )
        .then(({id}) => {
            inquirer.prompt({
                name: "yesNo",
                message: `Are you sure you want to delete ${selEmployee[selEmployee.findIndex(({value}) => value === id)].name}?`,
                type: "list",
                choices: [{name: "Yes", value: true},{name: "No", value: false}]
            })
            .then(({yesNo}) =>{
                if (yesNo){
                    const sql = `DELETE FROM employee WHERE id=?;`
                    const params = [id]
                    return db.promise().query(sql,params)
                    .then(() => console.log(`Employee Deleted !\n`))
                    .then(() => mainMenu())
                }else{
                    console.clear()
                    mainMenu()
                }
            })
        })
    })
    .catch((error) => console.log(error))
}
function renderCombinedSalaries(){
    console.clear()
    console.log("Display Combined Salaries by Department\n")
    const sql = `SELECT department.id as ID, department.name as Department FROM department ORDER BY id;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        const selDept = rows.map(({ID, Department })=> ({name: Department, value: ID, short: `${Department} Selected`}))
        selDept.unshift(({name: "All Departments", value: 0, short: `All Departments Selected`}))
        inquirer.prompt(
            {
                name: "id",
                message: "Select the department to display the salary total",
                type: "list",
                choices: selDept
            }
        )
        .then(({id}) => {
            let sqlSum;
            if (id >= 1) {
                sqlSum = `SELECT department.name as Department, CONCAT('$',FORMAT(SUM(role.salary),2)) as 'Total Salary'
                FROM role
                JOIN department on role.department_id = department.id
                WHERE department.id = ?
                GROUP BY Department;`
            } 
            else {
                sqlSum = `SELECT department.name as Department, CONCAT('$',FORMAT(SUM(role.salary),2)) as 'Total Salary'
                FROM role
                JOIN department on role.department_id = department.id
                GROUP BY Department;`
            };
            return db.promise().query(sqlSum,id)
            .then(([rows,fields]) => {
                console.table(rows)
            })
            .catch((error) => console.log(error))
            .then(() => mainMenu())
        })
    })    
}
function viewByManager() {
    console.clear()
    console.log("View By Department\n")
    const sql = `SELECT  DISTINCT concat(manager.first_name, ' ' ,  manager.last_name) as Manager, employee.manager_id as ID
    FROM employee
    LEFT JOIN employee manager ON employee.manager_id = manager.id
    WHERE employee.manager_id != 'NULL'
    ORDER BY Manager;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        const selDept = rows.map(({Manager, ID})=> ({name: Manager, value: ID, short: `${Manager} Selected`}))
        selDept.unshift({name:"All Managers", value: 0, short:"All Managers Selected"})
        inquirer.prompt(
            {
                name: "id",
                message: "Select the Manager to display",
                type: "list",
                choices: selDept
            }
        )
        .then(({id}) => {
            let search;
            if (id >0 ){
                search = `WHERE employee.manager_id = ${id}`
            }else{
                search = `WHERE employee.manager_id != 'NULL'`
            }
            const sql = `SELECT concat(manager.first_name, ' ' ,  manager.last_name) as Manager, department.name as Department, employee.id as ID, concat(employee.first_name," ", employee.last_name) as 'Name', role.title as Title,  CONCAT('$',FORMAT(role.salary,2)) as Salary
            FROM employee
            JOIN role ON employee.role_id = role.id
            JOIN department on role.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id
            ${search}
            ORDER BY Manager;`
            return db.promise().query(sql)
            })
            .then(([rows,fields]) => {
                    console.table(rows)
            })
            .catch((error) => console.log(error))
            .then(() => mainMenu())    
        })
}

function viewByDepartment() {
    console.clear()
    console.log("View By Department\n")
    const sql = `SELECT department.id as ID, department.name as Department FROM department ORDER BY id;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        const selDept = rows.map(({ID, Department })=> ({name: Department, value: ID, short: `${Department} Selected`}))
        selDept.unshift({name:"All Departments", value: 0, short:"All Departments Selected"})
        inquirer.prompt(
            {
                name: "id",
                message: "Select the department to display",
                type: "list",
                choices: selDept
            }
        )
        .then(({id}) => {
            console.log("View Employee's by Department\n")
            let search = "";
            if (id >0) {
                search = `WHERE department.id = ${id}`
            }
            const sql = `SELECT department.name as Department, employee.id as ID, concat(employee.first_name," ", employee.last_name) as 'Name', role.title as Title,  CONCAT('$',FORMAT(role.salary,2)) as Salary, concat(manager.first_name, ' ' ,  manager.last_name) as Manager
            FROM employee
            JOIN role ON employee.role_id = role.id
            JOIN department on role.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id
            ${search}
            ORDER BY ID;`
            return db.promise().query(sql)
            })
            .then(([rows,fields]) => {
                if (rows.length > 0) {
                    console.table(rows)
                }else{
                    console.log ("\n*** No Employees in this department ***\n")
                }
            })
            .catch((error) => console.log(error))
            .then(() => mainMenu())    
    })
}