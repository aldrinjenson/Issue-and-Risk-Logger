/* eslint-disable object-property-newline */
/* eslint-disable camelcase */

const callBackKeys = {};

const handleButtons = (rows) => {
  const markupRows = rows.map((row) => {
    const key = String(row.callback);
    callBackKeys[key] = row.callback;
    return { text: row.text, callback_data: key };
  });

  return {
    reply_markup: {
      inline_keyboard: [markupRows],
    },
  };
};

module.exports = { handleButtons, callBackKeys };
