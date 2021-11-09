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
    inquirer.prompt(
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
    )
    .then(({menuSelect})=> {
        console.log(menuSelect);
        switch (menuSelect) {
            case menuPrompt.allDepts:
                console.log('Returning to the main menu')
                renderAllDepts();
                break;
            default:
                console.log('Exiting')
                db.end()
                return;
        }
    })
};

function renderAllDepts() {
    console.log("Render all Departments\n")
    const sql = `SELECT department.id as ID, department.name as Department
    FROM department
    ORDER BY id;`
    return db.promise().query(sql)
    .then(([rows,fields]) => {
        console.table(rows)
        console.log("\n")
    })
    .then(() => mainMenu())
    .catch((error) => console.log(error))
};


// mainMenu();

