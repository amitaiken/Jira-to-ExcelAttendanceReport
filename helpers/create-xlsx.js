/* xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */
const XLSX = require('xlsx');
const fs = require('fs');

const DayMultiplier = 60*60*24*1000;

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function reverseString(str) {     // program to reverse a string
    let newString = "";
    for (let i = str.length - 1; i >= 0; i--) {
        newString += str[i];
    }
    return newString;
}

function convertToAbBase(columnNumber) {
    let columnName = '';
    while (columnNumber > 0) {
        let Zremainder = columnNumber % 26;
        if (Zremainder == 0) {                  // If remainder is 0, then a 'Z' must be there in output
            columnName = columnName + "Z"
            columnNumber = Math.floor(columnNumber / 26) - 1;
        }
        else {                                  // If remainder is non-zero
            columnName = columnName + String.fromCharCode((Zremainder - 1) + 'A'.charCodeAt(0))
            columnNumber = Math.floor(columnNumber / 26);
        }
    }
    columnName = reverseString(columnName)
    return columnName
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
                const workerSheetData = new WorkerTableSheet(headers, workerData);

                /* fill jira issue lines */
                workerSheetData.fillJiraLines(workerData);
                /* Add total line */
                workerSheetData.summarizeDateTimeWork(workerData);
                workerSheetData.defineCellsAsHours();
                XLSX.utils.book_append_sheet(wb, workerSheetData.worksheet, key);
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
    workerData;
    countLines = 0;
    headers = [];
    workerXLSXLines = [];
    headerLine = [];
    firstColumn = {name: 'JiraIssues/Dates'};
    lineNames = [];
    worksheet = [];
    constructor(headers, workerData) {
        this.headers = headers;
        this.workerData = workerData;
        this.countLines = workerData.length;
        headers.forEach(header => {
            const date = header;
            this.headerLine.push(date);
            this.countHeaders += 1;
        });
        this.worksheet =  XLSX.utils.json_to_sheet(this.headerLine);
        /* fix headers */
        XLSX.utils.sheet_add_aoa(this.worksheet, [this.headerLine], { origin: "C1" });
        XLSX.utils.sheet_add_aoa(this.worksheet, [['JiraIssues/Dates']], { origin: "A1" });
        XLSX.utils.sheet_add_aoa(this.worksheet, [['Issue total work']], { origin: "B1" });
        //XLSX.utils.sheet_add_aoa(this.worksheet, [['Issue total work']], { origin: {c:this.countHeaders ,r:0} });
        /* column width */
        this.worksheet["!cols"] = [{wch:25}];
        for(let i=0; i<headers.length + 2; i++) {
            this.worksheet["!cols"].push({wch: 15});
        }
    }

     fillJiraLines() {
        this.workerData.forEach(workerJira => {
            const jiraIssues = [];
            let issueTotalWork = 0;
            const jiraIssue = workerJira.project_name + '-' + workerJira.issueid;
            jiraIssues.push(jiraIssue);
            const jiraTaskList = workerJira.TaskList;
            const taskListLength = jiraTaskList.length;
            //this.countLines += taskListLength;
            let taskIndex = 0;
            for (let i = 0;  i<this.countHeaders; i++) {
                let timeWork = 0;
                if (taskIndex < taskListLength) {
                    let currentTaskDate = new Date(jiraTaskList[taskIndex].logYear, (jiraTaskList[taskIndex].logMonth - 1), jiraTaskList[taskIndex].logDay);
                    if ((this.headers[i]).getTime() === currentTaskDate.getTime()) {
                        timeWork = jiraTaskList[taskIndex].timeworked;
                        issueTotalWork += timeWork;
                        taskIndex += 1;
                    }
                }
                jiraIssues.push(timeWork);
            }
            jiraIssues.insert(1, issueTotalWork);
            this.workerXLSXLines.push(jiraIssues);
        });
        XLSX.utils.sheet_add_aoa(this.worksheet,(this.workerXLSXLines),{origin: "A2"});
    }
    summarizeDateTimeWork(workerData) {
        let sumLine = [];
        const totalLineIndex = workerData.length;
        for (let i = 1;  i<(this.countHeaders+2) ; i++) {
            let totalDateTime = 0;
            for(let j = 0; j<totalLineIndex; j++) {
                if (this.workerXLSXLines[j][i]) totalDateTime += this.workerXLSXLines[j][i];    //&& this.workerXLSXLines[i][j]>0
            }
            sumLine.push(totalDateTime);
        }
        const targetCell =  {c:1, r:(totalLineIndex+1)};
        XLSX.utils.sheet_add_aoa(this.worksheet, [sumLine], { origin: targetCell });
        const totalTitleIndex = {c:0, r:(totalLineIndex+1)};
        XLSX.utils.sheet_add_aoa(this.worksheet, [['Total']], { origin: totalTitleIndex });
    }

    defineCellsAsHours() {
        let columnLetter;
        for (let i = 2;  i<(this.countHeaders+3) ; i++) {
            let letterIndex = convertToAbBase(i);
            for(let j = 2; j<this.countLines+3; j++) {
                const cellAddress = letterIndex + j;
                this.worksheet[cellAddress].v = ((this.worksheet[cellAddress].v)/3600).toFixed(3);
            }
        }
    }
}

module.exports = XLSXGenerator;

