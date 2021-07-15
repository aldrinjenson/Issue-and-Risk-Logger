const pdf = require("pdf-creator-node");
const fs = require("fs");
const { getDateStrfromDateObj } = require("./messageUtils");
const pdfTemplate = fs.readFileSync("pdfTemplate.html", "utf8");

const tempData = [
  {
    _id: "60e87293c166800e35adb0f2",
    name: "Hello thre bararbarara",
    type: "issue",
    addedBy: "aldrinjenson",
    addedGroupId: "-408110969",
    addedDate: "1625846400",
    addedGroupName: "Sub group Q",
    assignee: null,
    criticalDate: new Date(),
    mainGroupId: "-507658471",
    isOpen: true,
    recordId: "SG/I-1",
    impact: "High",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "60f065d9581b823c72808ed6",
    name: "Hello thre bararbarara",
    type: "issue",
    addedBy: "aldrinjenson",
    addedGroupId: "-408110969",
    addedDate: "1626367402",
    addedGroupName: "Sub group Q",
    assignee: null,
    criticalDate: new Date(),
    mainGroupId: "-507658471",
    isOpen: true,
    recordId: "SG/I-2",
    impact: "Low",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "60f06602581b823c72808edb",
    name: "Hello thre bararbarara",
    type: "issue",
    addedBy: "aldrinjenson",
    addedGroupId: "-408110969",
    addedDate: "1626367453",
    addedGroupName: "Sub group Q",
    assignee: "Johnny Doe",
    criticalDate: new Date(),
    mainGroupId: "-507658471",
    isOpen: true,
    recordId: "SG/I-3",
    impact: "Medium",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "60f06645581b823c72808ee0",
    name: "Hello thre bararbarara",
    type: "issue",
    addedBy: "aldrinjenson",
    addedGroupId: "-408110969",
    addedDate: "1626367500",
    addedGroupName: "Sub group Q",
    assignee: "Jane Doe",
    criticalDate: null,
    mainGroupId: "-507658471",
    isOpen: true,
    recordId: "SG/I-4",
    impact: "High",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "60f06645581b823c72808ee0",
    name: "Hello thre bararbarara",
    type: "issue",
    addedBy: "aldrinjenson",
    addedGroupId: "-408110969",
    addedDate: "1626367500",
    addedGroupName: "Random Group",
    assignee: "Jason Vithayahathil",
    criticalDate: new Date(),
    mainGroupId: "-507658471",
    isOpen: true,
    recordId: "RG/I-7",
    impact: "High",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "60f06645581b823c72808ee0",
    name: "Hello thre bararbarara",
    type: "issue",
    addedBy: "aldrinjenson",
    addedGroupId: "-408110969",
    addedDate: "1626367500",
    addedGroupName: "Site V",
    assignee: "Luigi Stewart",
    criticalDate: null,
    mainGroupId: "-507658471",
    isOpen: true,
    recordId: "SV/I-9",
    impact: "High",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const options = {
  format: "letter",
  orientation: "portrait",
  border: "6mm",
};

const sendRecordsAsPdf = (record2s = [], bot, message) => {
  // const groupName = message.chat.title || "Main Group";
  let isFromSubGroup = true;
  const records = tempData.map((record) => ({
    ...record,
    criticalDate: getDateStrfromDateObj(record.criticalDate),
  }));

  const document = {
    html: pdfTemplate,
    data: {
      records: records,
      date: new Date().toLocaleString(),
      isSubGroup: isFromSubGroup,
      entityName: "Issue",
      groupName: "Main group 1",
    },
    path: "./output.pdf",
    type: "",
  };
  pdf
    .create(document, options)
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.error(error);
    });
};
sendRecordsAsPdf();
module.exports = { sendRecordsAsPdf };
