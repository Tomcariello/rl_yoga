'use strict';
module.exports = function(sequelize, DataTypes) {
  var Schedule = sequelize.define('Schedule', {
    scheduletext: DataTypes.STRING,
    scheduleimage: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
      }
    },
  freezeTableName: true
  });
  return Schedule;
};