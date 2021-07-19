const excel = require("node-excel-export");
const fs = require("fs");

const styles = {
  headerDark: {
    fill: {},
    font: {
      sz: 14,
    },
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: "FF00FF00",
      },
    },
  },
};

const specification = {
  customer_name: {
    headerStyle: styles.headerDark,
    displayName: "Issue ID",
    cellStyle: function (value, row) {
      return row.status_id == 1
        ? styles.cellGreen
        : { fill: { fgColor: { rgb: "FFFF0000" } } }; // <- Inline cell style is possible
    },
    width: 120,
  },
  status_id: {
    displayName: "Issue Name",
    headerStyle: styles.headerDark,
    cellFormat: function (value, row) {
      return value == 1 ? "Active" : "Inactive";
    },
    width: "10", // width in letters
  },
  note: {
    headerStyle: styles.headerDark,
    displayName: "Description",
    width: 220,
  },
};

const dataset = [
  { customer_name: "IBM", status_id: 1, note: "some note", misc: "not shown" },
  { customer_name: "HP", status_id: 0, note: "some note" },
  { customer_name: "MS", status_id: 0, note: "some note", misc: "not shown" },
];

// This function will return Buffer
const report = excel.buildExport([
  {
    name: "Issues",
    specification: specification,
    data: dataset,
  },
  {
    name: "Risks",
    specification: specification,
    data: dataset,
  },
  {
    name: "Actions",
    specification: specification,
    data: dataset,
  },
]);

fs.writeFile("./report.xlsx", report, (err) => {
  if (err) {
    console.error(err);
    return;
  }
});
