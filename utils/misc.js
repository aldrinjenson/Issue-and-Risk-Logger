const areValuesEqual = (val1, val2) => {
  if (val1 instanceof Date) {
    return val1.getTime() === val2.getTime();
  } else {
    return val1 === val2;
  }
};

module.exports = { areValuesEqual };
