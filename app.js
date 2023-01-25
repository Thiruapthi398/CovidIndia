const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbpath = path.join(__dirname, "covid19India.db");

let db = null;

app.use(express.json());

const InitizatizeDBAndData = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The Server is started http:localhost:3000");
    });
  } catch (e) {
    console.log(`DB error was occur ${e.message}`);
    process.exit(1);
  }
};

InitizatizeDBAndData();

//API  1 GET from state table
app.get("/states/", async (request, response) => {
  const AllStatesFromState = `
        SELECT 
            *
        FROM 
            state;
    `;
  const AllStatesQuery = await db.all(AllStatesFromState);
  response.send(AllStatesQuery);
  //console.log(AllStatesQuery);
});

// API 2  Returns a state based on the state ID

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const StateWithStateId = `
        select 
            * 
        from 
            state 
        where state_id =  ${stateId};
    `;
  const StateWithStateIdQuery = await db.get(StateWithStateId);
  response.send(StateWithStateIdQuery);
});

//API FOR FETCHING DATA  FROM THR DISTRICT TABLE

app.get("/district/", async (request, response) => {
  const AllStatesFromState = `
        SELECT 
            *
        FROM 
            district;
    `;
  const AllStatesQuery = await db.all(AllStatesFromState);
  response.send(AllStatesQuery);
  //console.log(AllStatesQuery);
});

//API 3 Create a district in the district table, district_id is auto-incremented

app.post("/districts/", async (request, response) => {
  const districtsitems = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtsitems;
  const AddingTheDistrict = `
    INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    VALUES(
        '${districtName},
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );
  `;
  const AddingTheDistrictQuery = await db.run(AddingTheDistrict);
  response.send("District Successfully Added");
});

//API4  Returns a district based on the district ID

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const GetingTheDistrictWithDistrictId = `
        SELECT * 
        FROM district 
        where district_id = ${districtId};
    `;
  const GetingTheDistrictWithDistrictIdQeury = await db.get(
    GetingTheDistrictWithDistrictId
  );
  response.send(GetingTheDistrictWithDistrictIdQeury);
});

//API5 Deletes a district from the district table based on the district ID

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const DeleteDistrictFromDist = `
        delete from district
        where district_id = ${districtId};
    `;
  const DeleteDistrictFromDistQuery = await db.run(DeleteDistrictFromDist);
  response.send("District Removed");
});

// API 6 Updates the details of a specific district based on the district ID

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const RequestedData = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = RequestedData;

  const updateingThedistrictWith = `
        update district
        set 
            district_name = '${districtName}',
            state_id = ${stateId},
            cases = ${cases},
            cured = ${cured},
            active = ${active},
            deaths = ${deaths}
        where district_id = ${districtId} ;
    `;

  const updateingThedistrictWithQuery = await db.run(updateingThedistrictWith);
  response.send("District Details Updated");
});

//API 7 Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const GetingTheTotalofEachState = `
    SELECT 
        SUM(cases) as totalCases,
        sum(cured) as totalCured,
        sum(active) as totalActive,
        sum(deaths) as totalDeaths
    from 
        district
    where 
        state_id = ${stateId};
   
  `;
  const stats = await db.get(GetingTheTotalofEachState);
  //console.log(stats);
  response.send(stats);
});

//API 8 Returns an object containing the state name of a district based on the district ID

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const GetStateName = `
        SELECT 
            state_name as  stateName 
        from 
            state inner join district on state.state_id = district.state_id

        where district_id = ${districtId}
    `;
  const GetStateNameQuery = await db.get(GetStateName);
  console.log(GetStateNameQuery);
});

module.exports = app;
