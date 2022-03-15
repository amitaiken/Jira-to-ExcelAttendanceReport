const XLSXGenerator = require('./helpers/create-xlsx.js');
const issuesIntervalData = require('./time-sheets-json/minimalExample.json');
const fastify = require('fastify')({ logger: true });
const config = require('./config');

const galeraCluster = require('@voicenter-team/mysql-dynamic-cluster');
const cluster = galeraCluster.createPoolCluster(config.mysql);
async function runQurey() {
    let result;
    try {
        await cluster.connect();
        result = await cluster.query(`SELECT FN_GetGlobalTimeSheet(null,null) as data;`);
        console.log("result",result);
        await cluster.disconnect();
        if(result &&result[0].data) return result[0].data;
    } catch (e){
        console.log(e.message);
    }
    return result;
}

fastify.get('/', async function (request, reply) {
    const ReportData = await runQurey();
    const hrExcelAttendanceReport = new XLSXGenerator(ReportData);
    const exelFile = await hrExcelAttendanceReport.createExcelAttendanceReport(hrExcelAttendanceReport.reportData, 'tasks-summarize-sheet.xlsx');

    reply.header('Content-Type', 'application/vnd.ms-excel').send(exelFile)
})



const startWebService = async () => {
    try {
        await fastify.listen(3000)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
startWebService();

//module.exports = fastify;



/*



console.log("excelFile:", exelFile);
*/
