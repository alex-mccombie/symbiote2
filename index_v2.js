const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');

// Connecting Database
let db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
        console.log("Error Occurred - " + err.message);
    } else {
        console.log("DataBase Connected");
    }
});

app.get('/', (req, res) => { // Put the front page here
    res.send("<HTML><HEAD></HEAD><BODY>Racing Report<HR></BODY></HTML>");
});


// Select data
app.get('/select', (req, res) => { 
    var selectQuery = 'SELECT * FROM RACES;'
    console.log('selectQuery:', selectQuery);
    db.all(selectQuery, (err, data) => {
        if (err) return;

        // Success
        console.log(data);
        res.json(data);
    });
    //res.send("ALIVE");
});


// Create database 
function CreateTable(createQuery, insertQuery, selectQuery) { 
/*    var createQuery = 'CREATE TABLE RACES ( ID NUMBER , NAME VARCHAR(100));';
    var insertQuery = 'INSERT INTO RACES (ID,NAME) VALUES (1,"First Race"),(2,"Second Race"),(3,"Third Race");';
    var selectQuery = 'SELECT * FROM RACES;' */

    db.run(createQuery, (err) => {
        if (err) {
            console.log("Table Create Error:",err);
            return;
        } else {
            // Success
            //console.log("Table Created");
            db.run(insertQuery, (err) => {
                if (err) return;

                // Success
                //console.log("Insertion Done");
                db.all(selectQuery, (err, data) => {
                    if (err) return;
                    // Success
                    console.log(data);
                    //res.json("CREATED",data);
                });
            });
        };
    });
    //res.send("CREATED");
};


/*
function CreateTable(SQL) {
    var createQuery =
        'CREATE TABLE RACES ( ID NUMBER , NAME VARCHAR(100));';
    var insertQuery =
        'INSERT INTO RACES (ID , NAME) VALUES (1 , "First Race"),(2,"Second Race"),(3,"Third Race");'

    var selectQuery = 'SELECT * FROM RACES ;'

    // Running Query
    db.run(createQuery, (err) => {
        if (err) return;

        // Success
        console.log("Table Created");
        db.run(insertQuery, (err) => {
            if (err) return;

            // Success
            console.log("Insertion Done");
            db.all(selectQuery, (err, data) => {
                if (err) return;
                // Success
                console.log(data);
                //res.json("CREATED",data);
            });
        });
    });
    //res.send("CREATED");
};
*/


function CreateAllDatabases() {
    //db.run('PRAGMA foreign_keys=ON;');
    
    CreateTable(
        `CREATE TABLE CLUBS (
            CLUB_ID INTEGER PRIMARY KEY,
            NAME VARCHAR(100)
        );
        `
        , 'INSERT INTO CLUBS (NAME) VALUES ("First Club"),("Second Club"),("Third Club");'
        , 'SELECT * FROM CLUBS;'
    );

    CreateTable(
        `CREATE TABLE RACES (
            RACE_ID INTEGER PRIMARY KEY,
            NAME VARCHAR(100),
            CLUB_ID INTEGER NOT NULL,
            FOREIGN KEY(CLUB_ID)
                REFERENCES CLUBS(CLUB_ID)
        );`
        , 'INSERT INTO RACES (NAME,CLUB_ID) VALUES ("First Race",1),("Second Race",2),("Third Race",3);'
        , 'SELECT * FROM RACES;'
    );


};


// Start the server
app.listen(4000, () => {
    console.log("Server started on port 4000");
    CreateAllDatabases();
    console.log("Datebase created in memory");
})
