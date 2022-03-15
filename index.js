

const XLSXGenerator = require('./helpers/create-xlsx.js');

const issuesIntervalData = require('./time-sheets-json/minimalExample.json')
const hrExcelAttendanceReport = new XLSXGenerator(issuesIntervalData);
const exelFile = hrExcelAttendanceReport.createExcelAttendanceReport(hrExcelAttendanceReport.reportData, 'tasks-summarize-sheet.xlsx');
console.log("excelFile:", exelFile);