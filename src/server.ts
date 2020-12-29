import * as path from 'path';
import express from 'express';
import cors from 'cors';
import { CronJob } from 'cron';

import { general } from './api/general';
import { states } from './api/states';
import { statesMap } from './api/states-map';
import { districts } from './api/districts';
import { districtsMap } from './api/districts-map';

import { updateGeneral } from './cronjobs/updateGeneral';
import { updateDistricts } from './cronjobs/updateDistricts';
import { updateStates } from './cronjobs/updateStates';
import { updateDistrictsMap } from './cronjobs/updateDistrictsMap';
import { updateStatesMap } from './cronjobs/updateStatesMap';

import { GenerateNow } from './data/now';
import { GenerateStates } from './data/states';
import { getLastCasesHistory, getStatesData } from './requests';

const app = express()
const port = 3000

app.use(cors())

app.get('/', async (req, res) => {
  res.sendFile(path.resolve(path.dirname('static/index.html')));
})

app.get('/api', async (req, res) => {
  res.redirect('/api/general');
})

app.get('/api/general', general)

app.get('/api/states', states)
app.get('/api/states-map', statesMap)
app.get('/api/districts', districts)
app.get('/api/districts-map', districtsMap)

app.get('/history/germany/cases/:days', async (req, res) => {
  const history = await getLastCasesHistory(parseInt(req.params.days));
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    dates: history
  }))
})

app.get('/history/germany/cases', async (req, res) => {
  const history = await getLastCasesHistory();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    dates: history
  }))
})

async function updateDataSources(database) {
  try {
    await updateGeneral(database);
    await updateDistricts();
    await updateStates();
    await updateStatesMap();
    await updateDistrictsMap();
  } catch (error) {
    console.log(error);
  }
}

// async function main() {

//   console.log("Starting..");

//   console.log("Connection to database..");

//   console.log("Updating data sources..");
//   await updateDataSources(database);

//   console.log("Starting cronjob..");
//   var job = new CronJob('0 */20 * * * *', () => updateDataSources(database));
//   job.start();

//   console.log("Starting server..");
//   app.locals.database = database;
//   app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`)
//   })
// }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })

//main();
getLastCasesHistory(7).then((now) => {
  console.log(now.reduce((acc, value) => {
    return {
        cases: acc.cases + value.cases,
        date: 0
    }
  }));
})

const statedNow = new Date();
GenerateNow().then((now) => {
  console.log(new Date().getTime() - statedNow.getTime());
  //console.log(now);
})

const statedStates = new Date();
GenerateStates().then((states) => {
  console.log(new Date().getTime() - statedStates.getTime());
  //console.log(states);
})