function reverseString(str) {     // program to reverse a string
    let newString = "";
    for (let i = str.length - 1; i >= 0; i--) {
        newString += str[i];
    }
    return newString;
}


module.exports = function convertToAbBase(columnNumber) {
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