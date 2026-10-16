
const sqlite3 = require('sqlite3').verbose();
let sql;

//Connect to DB
const db = new sqlite3.Database('./../database',sqlite3.OPEN_READWRITE,(err)=>{
  if (err) return console.error('err.message');
});

//Create Table
// sql =  `CREATE TABLE users(id INTEGER PRIMARY KEY,first_name,last_name,username,password,email)`;
// db.run(sql);

// Drop Table
// db.run('DROP TABLE users');

//Insert Data into Table
// sql = `INSERT INTO users(first_name,last_name,username,password,email) VALUES(?,?,?,?,?)`;
// db.run(sql,["Trevor","Hedgehog","violinist234","cookingmama","trevorhedgehog@aol.com"],(err)=>{
//   if (err) return console.error('err.message');
// });

//Update Data
// sql = `UPDATE users SET first_name = ? WHERE id = ?`;
// db.run(sql,["Sonic",1],(err)=>{
//   if (err) return console.error('err.message');
// });

//Deleting Data
sql = `DELETE FROM users WHERE id = ?`;
db.run(sql,[1],(err)=>{
  if (err) return console.error('err.message');
});

//Query Data
sql = `SELECT * FROM users`;
db.all(sql,[],(err,rows)=>{
  if (err) return console.error('err.message');
  rows.forEach((row)=>{
    console.log(row);
  });
});
