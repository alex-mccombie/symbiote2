const express = require('express');
const url = require('url');
//const bodyParser = require('body-parser');
const app = express();
//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
const sqlite3 = require('sqlite3');

const BR = '<BR>';
const HR = '<HR>';
// Connecting Database
let db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
        console.log("Error Occurred - " + err.message);
    } else {
        console.log("DataBase Connected");
    }
});



app.get('/', (req, res) => { // Home page
    let Now = new Date();
    let TABLE_SELECTOR = '';
    TABLE_NAMES.forEach(function (tableName) {
        TABLE_SELECTOR += HREF('/select/' + tableName, tableName) + BR;
    });

    let REPORT_LINKS =
        HREF('/report/upcoming_races', 'View Upcoming Races')
         + ' | ' + HREF('/report/completed_races', 'View Completed Races');

    let CREATE_LINKS =
        HREF('/create/RIDERS', 'Create new rider')
        + ' | '+ HREF('/create/RACES', 'Create new race');


    let HTM = '<H1>Racing Report</H1>'
        + HR+'<H4>TABLES:</H4>' + TABLE_SELECTOR
        + HR + '<H4>REPORTS:</H4>' + REPORT_LINKS
        + HR + '<H4>CREATE:</H4>' + CREATE_LINKS
        ;
    res.send(PageHTM(HTM));
});


app.get('/create/RIDERS', (req, res) => {
    let tableName = req.path.replace(/^\/create\//, '');

    let InputForm = `
<form action="/post_data/${tableName}" method="get">
<TABLE>
<TR><TD>FIRST NAME:</TD><TD> <input type=text size=30 name='FIRST_NAME'></TD></TR>
<TR><TD>LAST NAME:</TD><TD><input type=text size=30 name='LAST_NAME'></TD></TR>
<TR><TD>AGE:</TD><TD><input type=text size=3 name='AGE'></TD></TR>
<TR><TD>GRADING:</TD><TD><input type=text size=3 name='GRADING'></TD></TR>
</TABLE>
<input type="submit" value="Save">
</form>`;
    let HTM = '<H1>Create '+tableName+' record</H1>'+InputForm;
    res.send(PageHTM(HTM));
});



app.get('/post_data/RIDERS', (req, res) => {
    const queryData = url.parse(req.url, true).query;
    //console.log('queryObject:', queryData);
    let tableName = req.path.replace(/^\/post_data\//, '');
    let FIRST_NAME = queryData.FIRST_NAME;
    let LAST_NAME = queryData.LAST_NAME;
    let AGE = queryData.AGE;
    let GRADING = queryData.GRADING;
    let CLUB_ID = queryData.CLUB_ID || 1;

    let HTM = '<H1>Saving ' + tableName + '</H1>';
    HTM += BR + '<PRE>' + JSON.stringify(queryData, null, 4) + '</PRE>';
    //HTM += BR + 'First:' + FIRST_NAME + ' Last:' + LAST_NAME;
    CreateRiderRecord({
        CLUB_ID: CLUB_ID,
        FIRST_NAME: FIRST_NAME,
        LAST_NAME: LAST_NAME,
        AGE: AGE,
        GRADING: GRADING
    });
    res.send(PageHTM(HTM));
});


app.get('/assign_riders_club', (req, res) => {
    const queryData = url.parse(req.url, true).query;
    //console.log('queryObject:', queryData);
    let CLUB_ID = queryData.CLUB_ID;
    let RIDER_ID = queryData.RIDER_ID;
    let HTM = '<H1>Assigned RIDER_ID:' + RIDER_ID + ' to CLUB:'+CLUB_ID+'</H1>';
    //HTM += BR + '<PRE>' + JSON.stringify(queryData, null, 4) + '</PRE>';
    //HTM += BR + 'First:' + FIRST_NAME + ' Last:' + LAST_NAME;
    AssignRiderToClub(RIDER_ID, CLUB_ID);
    res.send(PageHTM(HTM));
});



function AssignRiderToClub(RIDER_ID, CLUB_ID) {
    if (!RIDER_ID || !CLUB_ID) {
        return;
    };

    let updateQuery = `
UPDATE RIDERS SET CLUB_ID=${CLUB_ID} WHERE RIDER_ID=${RIDER_ID};
`;
    
    console.log('AssignRiderToClub:', RIDER_ID,'to ',CLUB_ID, 'updateQuery:', updateQuery);
    db.run(updateQuery, (err) => {
        if (err) {
            console.error(err, 'Error in insertQuery:', insertQuery);
            return;
        };
    });
};



function CreateRiderRecord(Record) {
    let CLUB_ID = Record.CLUB_ID;
    let FIRST_NAME = Record.FIRST_NAME;
    let LAST_NAME = Record.LAST_NAME;
    let AGE = Record.AGE;
    let GRADING = Record.GRADING;

    let insertQuery = `
INSERT INTO RIDERS (CLUB_ID,FIRST_NAME,LAST_NAME,GRADING,AGE) VALUES (
    ${CLUB_ID}
    ,"${FIRST_NAME}"
    ,"${LAST_NAME}"
    ,"${GRADING}"
    ,${AGE});
`;
    console.log('CreateRiderRecord:', Record, 'insertQuery:', insertQuery);
    db.run(insertQuery, (err) => {
        if (err) {
            console.error(err, 'Error in insertQuery:', insertQuery);
            return;
        };
    });
};






app.get('/create/RACES', (req, res) => {
    let tableName = req.path.replace(/^\/create\//, '');

    let InputForm = `
<form action="/post_data/${tableName}" method="get">
<TABLE>
<TR><TD>TITLE:</TD><TD> <input type=text size=30 name='RACE_TITLE'></TD></TR>
<TR><TD>DATE:</TD><TD><input type=date size=30 name='RACE_DATETIME'></TD></TR>
<TR><TD>ADDRESS:</TD><TD><input type=text size=3 name='RACE_ADDRESS'></TD></TR>
<TR><TD>STATUS:</TD><TD><input type=text size=3 name='STATUS'></TD></TR>
</TABLE>
<input type="submit" value="Save">
</form>`;
    let HTM = '<H1>Create new ' + tableName + '</H1>' + InputForm;
    res.send(PageHTM(HTM));
});


app.get('/post_data/RACES', (req, res) => {
    const queryData = url.parse(req.url, true).query;
    let tableName = req.path.replace(/^\/post_data\//, '');
    let RACE_TITLE = queryData.RACE_TITLE;
    let RACE_DATETIME = queryData.RACE_DATETIME;
    let RACE_DATEVALUE = new Date(RACE_DATETIME).toISOString();
    console.log('RACE_DATETIME:', RACE_DATETIME, 'RACE_DATEVALUE:', RACE_DATEVALUE);
    let RACE_ADDRESS = queryData.RACE_ADDRESS;
    let STATUS = queryData.STATUS;
    let CLUB_ID = 1;

    let HTM = '<H1>Saving ' + tableName + '</H1>';
    HTM += BR + '<PRE>' + JSON.stringify(queryData, null, 4) + '</PRE>';
    //HTM += BR + 'First:' + FIRST_NAME + ' Last:' + LAST_NAME;
    CreateRaceRecord({
        RACE_TITLE: RACE_TITLE,
        RACE_DATETIME: RACE_DATEVALUE,
        RACE_ADDRESS: RACE_ADDRESS,
        STATUS: STATUS,
        CLUB_ID: CLUB_ID
    });
    res.send(PageHTM(HTM));
});


function CreateRaceRecord(Record) {
    let CLUB_ID = Record.CLUB_ID;
    let RACE_TITLE = Record.RACE_TITLE;
    let RACE_ADDRESS = Record.RACE_ADDRESS;
    let RACE_DATETIME = Record.RACE_DATETIME;
    let STATUS = Record.STATUS;

    let insertQuery = `
INSERT INTO RACES (CLUB_ID,RACE_TITLE,RACE_ADDRESS,RACE_DATETIME,STATUS) VALUES (
    ${CLUB_ID}
    ,"${RACE_TITLE}"
    ,"${RACE_ADDRESS}"
    ,"${RACE_DATETIME}"
    ,"${STATUS}"
    );
`;
    db.run(insertQuery, (err) => {
        if (err) {
            console.error(err, 'Error in insertQuery:', insertQuery);
            return;
        };
    });
};



function HREF(URL, TEXT) {
    return ('<A HREF="' + URL + '">' + TEXT + '</A>');
};

function PageHTM(BODY_HTM) {
    let HomeLink = '<A HREF="/">HOME</A>';
    let HeaderRow = HomeLink;
    let HTM =
`<!DOCTYPE html>
<HTML>
<HEAD></HEAD>
<BODY style="font-family:Verdana">
${HeaderRow}
${BODY_HTM}
</BODY>
</HTML>
`;
    return (HTM);
};


let TableFieldsDef = {
    RIDERS:['FIRST_NAME','LAST_NAME','AGE','GRADING']
    ,CLUBS: ['TITLE', 'ADDRESS']
    , RACES: ['RACE_TITLE', 'RACE_DATETIME', 'RACE_ADDRESS', 'STATUS', 'CLUB_ID']
    , RACE_RESULTS: ['RACE_ID','RIDER_ID','RIDER_FINISHED']
};


app.get('/select*', (req, res) => {
    let tableName = req.path.replace(/^\/select\//, '');
    console.log('req path', req.path, 'tableName:', tableName);
    let TableFields = TableFieldsDef[tableName];

    let SortClause = '';
    if (tableName == 'RIDERS'){
        SortClause=' ORDER BY LAST_NAME,FIRST_NAME';
    };
    var selectQuery = 'SELECT * FROM ' + tableName + ' '+SortClause+';'
    db.all(selectQuery, (err, rowData) => {
        if (err) return;
        let HTM = '';
        let RiderTable = '';
        let HeaderRow = '';
        TableFields.forEach(function (FieldName) {
            HeaderRow += '<TD>' + FieldName + '</TD>';
        });
        HeaderRow = '<TR>' + HeaderRow + '</TR>';
        RiderTable += HeaderRow;
        rowData.forEach(function (rowObject) {
            let DataRow = '';
            TableFields.forEach(function (FieldName) {
                let FieldValue = rowObject[FieldName];
                DataRow += '<TD>' + FieldValue + '</TD>';
            });
            RiderTable += '<TR>'+DataRow+'</TR>';
        });
        RiderTable = '<TABLE>' + RiderTable + '</TABLE>';
        HTM += '<H1>' + tableName + ' table</H1>';
        HTM += RiderTable;
        res.send(PageHTM(HTM));
    });
    //res.send("ALIVE");
});

app.get('/report/upcoming_races', (req, res) => {
    let CurrentTime = "'"+new Date().toISOString()+"'";
    var selectQuery = "SELECT * FROM RACES WHERE RACE_DATETIME>=" + CurrentTime + ";";
    db.all(selectQuery, (err, data) => {
        if (err) return;
        let HTM = '<H2>Upcoming Races</H2><PRE>' + JSON.stringify(data, null, 4) + '</PRE>';
        res.send(PageHTM(HTM));
    });
});



app.get('/report/completed_races', (req, res) => {
    let CurrentTime = "'" + new Date().toISOString() + "'";
    var selectQuery = "SELECT * FROM RACES WHERE RACE_DATETIME<" + CurrentTime + ";";
    db.all(selectQuery, (err, data) => {
        if (err) return;
        let HTM = '<H2>Completed Races</H2><PRE>'; // + JSON.stringify(data, null, 4) + '</PRE>';
        data.forEach(function (raceDetails) {
            let RaceID = raceDetails.RACE_ID;
            let RaceTitle = raceDetails.RACE_TITLE;
            let RaceURL = '/report/race_details/' + RaceID;
            let RaceLink = '<A HREF="' + RaceURL + '">' + RaceTitle + '</A>';
            HTM += '<BR>' + RaceLink;
        });
        let AddResultLink = HREF('/report/completed_races/add_result', 'Add Rider Result');
        HTM += AddResultLink;

        res.send(PageHTM(HTM));
    });
});


app.get('/report/race_details/*', (req, res) => {
    let RaceID = req.path.replace(/^\/report\/race_details\//, '');
    let HTM = '';

    let selectQuery = "SELECT * FROM RACES INNER JOIN RACE_RESULTS USING (RACE_ID) WHERE RACES.RACE_ID=" + RaceID + " AND RACE_RESULTS.RACE_ID="+RaceID+" ORDER BY RIDER_FINISHED;";
    db.all(selectQuery, (err, data) => {
        if (err) return;
        let RaceTitle = data[0].RACE_TITLE;
        HTM += '<H2>Race:' + RaceTitle + ' Details</H2>';
        let resultsQuery = "SELECT RACE_RESULTS.RIDER_ID,FIRST_NAME,LAST_NAME,RIDER_FINISHED FROM RIDERS INNER JOIN RACE_RESULTS ON RACE_RESULTS.RIDER_ID=RIDERS.RIDER_ID WHERE RACE_ID=" + RaceID + " ORDER BY RIDER_FINISHED;";
        db.all(resultsQuery, (resultsErr, resultsData) => {
            if (resultsErr) {
                console.error('resultsErr:', resultsErr)
                return;
            };
            console.log('resultsData:',resultsData);
            //HTM += '<BR>Results: <PRE>' + JSON.stringify(resultsData,null,4)+'</PRE>';
            let Table = '';
            resultsData.forEach(function (raceResult) {
                let RIDER_ID = raceResult.RIDER_ID;
                let Position = raceResult.RIDER_FINISHED;
                let RiderName = raceResult.FIRST_NAME + ' ' + raceResult.LAST_NAME;
                console.log(Position, RiderName);
                //let PositionInput = '';
                let UpdateURL = req.originalUrl + '/set_result/' + RIDER_ID + '&POS=';
                //let OnChange = "window.location.replace('" + UpdateURL + "'+this.value)";
                let PositionInput = Position;
                if (!Position) {
                    //let OnChange = "console.log('" + UpdateURL + "'+this.value)";
                    let OnChange = "window.location.replace('" + UpdateURL + "'+this.value)";
                    PositionInput = '<input action="" type=string length=3 onchange=\"' + OnChange + '\">';
                    //PositionInput = '<form action="/post_data/" ><input type=string ID="POSITION" onchange="this.closest(\'form\').submit"></form>'
                };
                Table += '<TR><TD>' + RiderName + '</TD><TD>' + PositionInput+ '</TD></TR>';
            });
            Table = '<TABLE>' + Table + '</TABLE>';
            HTM += Table;
            
            res.send(PageHTM(HTM));
        });
    });
});



// Create database 
const SelectTable = async (selectQuery) => {
    console.log('START SelectTable:', selectQuery,'db:',db);
    return db.all(selectQuery, (err, data) => {
        if (err) return;
        console.log('SELECT:',data);
    });
};



let CREATE_SCRIPTS = [
    [
        'CLUBS',
        `CREATE TABLE CLUBS (
            CLUB_ID INTEGER PRIMARY KEY,
            TITLE TEXT,
            ADDRESS TEXT
        );
        `
        , `INSERT INTO CLUBS (TITLE,ADDRESS) VALUES
            ('First Club','123 Street Rd, Townton'),
            ('Second Club','456 Road St, Villaville'),
            ('Third Club','789 Avenue Cres, Cresley')
         ;`
    ],
    [
        'RIDERS',
        `CREATE TABLE RIDERS (
            RIDER_ID INTEGER PRIMARY KEY,
            FIRST_NAME TEXT,
            LAST_NAME TEXT,
            GRADING TEXT CHECK(GRADING IN ('A','B','C')),
            AGE INTEGER,
            CLUB_ID INTEGER NOT NULL,
            FOREIGN KEY(CLUB_ID)
                REFERENCES CLUBS(CLUB_ID)
        );`
        , `INSERT INTO RIDERS (CLUB_ID,FIRST_NAME,LAST_NAME,GRADING,AGE) VALUES
            (1,'Fred','Jones','A',36),
            (2,'John','Smith','B',18),
            (3,'Fred','Carter','C',42),
            (1,'Mary','Brown','B',28),
            (2,'Barry','Grey','A',33),
            (3,'Garry','White','C',31),
            (1,'Sherry','Green','B',34)
         ;`
    ],
    [
        'RACES',
        `CREATE TABLE RACES (
            RACE_ID INTEGER PRIMARY KEY,
            RACE_TITLE TEXT,
            RACE_DATETIME DATETIME,
            RACE_ADDRESS TEXT,
            STATUS TEXT CHECK(STATUS IN ('P','C')),
            CLUB_ID INTEGER NOT NULL,
            FOREIGN KEY(CLUB_ID) REFERENCES CLUBS(CLUB_ID)
        );`
        , `INSERT INTO RACES (RACE_TITLE,RACE_DATETIME,RACE_ADDRESS,STATUS,CLUB_ID) VALUES 
            ("Future Race",'2022-05-02T12:30','789 Curly Avenue, Yayville','P',1),
            ("First Race",'2022-01-02T12:30','123 Steep Lane, Booville','C',1),
            ("Second Race",'2022-01-03T1:30','456 Flat Road, Wowville','C',1)
        ;`
    ],
    [
        'RACE_RESULTS',
        `CREATE TABLE RACE_RESULTS (
            RACE_ID INTEGER NOT NULL,
            RIDER_ID INTEGER NOT NULL,
            RIDER_FINISHED INTEGER NOT NULL,
            FOREIGN KEY(RACE_ID) REFERENCES RACES(RACE_ID),
            FOREIGN KEY(RIDER_ID) REFERENCES RIDERS(RIDER_ID)
        );`
        , `INSERT INTO RACE_RESULTS (RACE_ID,RIDER_ID,RIDER_FINISHED) VALUES 
            (1,1,7),
            (1,2,5),
            (1,3,4),
            (1,4,3),
            (1,5,6),
            (1,6,2),
            (1,7,1),
            (2,1,5),
            (2,3,1),
            (2,5,4),
            (2,6,2),
            (2,7,3),
            (3,1,0),
            (3,3,0),
            (3,5,0),
            (3,6,0)
        ;`
    ]
];
let TABLE_NAMES = ['CLUBS','RIDERS','RACES','RACE_RESULTS'];


const CreateAllDatabases = async () => {
    let ALL_OK = true;
    CREATE_SCRIPTS.forEach(function (TABLE_DEF) {
        let CREATED_OK = CreateTable(TABLE_DEF);
        if (!CREATED_OK) {
            ALL_OK = false
            console.log('CREATE FAILED');
        };
    });
    return (['Created Result:',ALL_OK]);
};


const CreateTable = async (TABLE_DEF) => {
    let [tableName,createQuery, insertQuery] = TABLE_DEF;

    return db.run(createQuery, (err) => {
        if (err) {
            console.log("Table Create Error:", err);
            return;
        } else {
            //TABLE_NAMES.push(tableName);
            db.run(insertQuery, (err) => {
                if (err) return;
            }); 
        };
    });
};



const SetupData = async () => {
    let CreateAllResult = await CreateAllDatabases();
    console.log('CreateAllDatabases()', CreateAllResult);
};


// Start the server
app.listen(4000, () => {
    console.log("Server started on port 4000");
    SetupData();
})
