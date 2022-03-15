/* xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
const XLSX = require('xlsx');
const fs = require('fs');

const DayMultiplier = 60*60*24*1000;

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getDatesBetween(startDate, stopDate) {
    let dateArray = new Array();
    let currentDate =  new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDay());
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

class XLSXGenerator {
    constructor(req, res) {
        console.log("XLSXGenerator Class is loading ... ");
        this.reportData = req;
    }
    async createExcelAttendanceReport(reportData, fileName){
        try {
            let wb = XLSX.utils.book_new();
            wb.Props = {
                Title: fileName,
                Author: "Generate by voiCenter machine",
                CreatedDate: new Date(Date.now())
            };
            const startDate =  new Date(this.reportData.StartDate); //new Date((Date.now()) - DayMultiplier*30 );//if() issuesIntervalData.StartDate;
            const endDate = new Date(this.reportData.EndDate); //new Date(Date.now());
            console.log('EndDate', endDate, 'StartDate', startDate)
            const headers = getDatesBetween(startDate, endDate);
            let issuesIntervalData = this.reportData.Data;
            Object.keys(issuesIntervalData).forEach(key => {
                const workerData = issuesIntervalData[key];
                const workerSheetData = new WorkerTableSheet(headers);
                workerSheetData.fillJiraLines(workerData, headers);
                let worksheet = XLSX.utils.json_to_sheet(workerSheetData.xlsxData);  //, workerSheetData.headers
                /* fix headers */
                XLSX.utils.sheet_add_aoa(worksheet, [this.headerLine], { origin: "A2" });
                /* column width */
                worksheet["!cols"] = [ {wch:25} ];
                for(let i=0; i<headers.length; i++) {
                    worksheet["!cols"].push({wch: 15});
                }
                //XLSX.utils.sheet_set_array_formula(worksheet, "C5", "SUM(C3:C4)");
                //workerSheetData.summarizeDailyTimeWork(ws);
                XLSX.utils.book_append_sheet(wb, worksheet, key);
            });
            const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'} );
            const date = Date.now();
            let f = XLSX.writeFile(wb, String(date + fileName));
            const excelFile = new Buffer.from(excelBuffer, "binary");
            return excelFile;
        } catch (e) {
            console.log(e);
        }
    }
}

class WorkerTableSheet {
    countHeaders = 0;
    countLines = 0;
    headers = [];
    headerLine = ['JiraIssues/Dates'];
    lineNames = [];
    xlsxData = [];
    constructor(headers) {
        this.headers = headers;
        headers.forEach(header => {
            const date = header;
            this.headerLine.push(date);
            this.countHeaders += 1;
        });
        this.xlsxData.push(this.headerLine);
    }

    fillJiraLines(workerJiraIssues, headers) {
        workerJiraIssues.forEach(workerJira => {
            const jiraIssues = [];
            const jiraIssue = workerJira.project_name + '-' + workerJira.issueid;
            jiraIssues.push(jiraIssue);
            const jiraTaskList = workerJira.TaskList;
            const taskListLength = jiraTaskList.length;
            this.countLines += taskListLength;
            let taskIndex = 0;
            for (let i = 0;  i<this.countHeaders; i++) {
                if (taskIndex < taskListLength) {
                    let currentTaskDate = new Date(jiraTaskList[taskIndex].logYear, (jiraTaskList[taskIndex].logMonth - 1), jiraTaskList[taskIndex].logDay);
                    if ((headers[i]).getTime() === currentTaskDate.getTime()) {   //d1.getTime() === d2.getTime()
                        jiraIssues.push(jiraTaskList[taskIndex].timeworked);
                        taskIndex += 1;
                    } else jiraIssues.push(0);
                }
                else jiraIssues.push(0);
            }
            this.xlsxData.push(jiraIssues);
        });
    }

    summarizeDailyTimeWork(worksheet) {
        let summarizeDailyArray = ['Total:'];
        if(this.xlsxData[1][0]) for (let i = 1; i <= this.countHeaders; i++){
            let summarizeDaily = 0;
            if(this.xlsxData[i][0]) {
                for (let j = 1; j < this.countLines; j++) {
                    if (this.xlsxData[i][j]) summarizeDaily += this.xlsxData[i][j];
                    XLSX.utils.sheet_set_array_formula(worksheet, "C1", "SUM(A1:A3*B1:B3)");
                }
            }
            summarizeDailyArray.push(summarizeDaily);
            summarizeDaily = 0;
        }
        this.xlsxData.push(summarizeDailyArray);
    }
}

module.exports = XLSXGenerator;


