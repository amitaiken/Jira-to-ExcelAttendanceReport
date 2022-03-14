# -Summarize-DB-to-Excel
This repository describes how to summarize and convert database represented with json object, to Excel file, indexed by dates.
## Business logic
Assume you have data in one data unit system, and you want to deliver it to other data unit system.
Hence, each system got a different business logic, each system got a different indexes.
### Example
In this example we take data from Jira system which index by issues, and deliver it to HR system which index by dates and used excel sheets
## API
### createExcelAttendanceReport(issuesIntervalData, filename)
#### Input:
- issuesIntervalData - json object included start & end Dates and Data: workers data from jira system.
```
{
  "Data": {
    "fName.sName": [
      {
        "issueid": 10795,
        "TaskList": [
          {
            "logDay": 7,
            "logYear": 2022,
            "logMonth": 2,
            "timeworked": 29400
          }
        ],
        "issue_type": "10000",
        "project_name": "Real Time Dashboard",
        "issue_summary": "Testing Dashboard",
        "total_timeworked": 98040
      }
    ]
  },
  "EndDate": "2022-03-09 01:00:19.000000",
  "StartDate": "2022-02-07 01:00:19.000000"
}
```
- fileName: file name
#### Output:
- Excel Buffer(binary) file
- tasks-summarize-sheet.xlsx file with time stamp added to sever

