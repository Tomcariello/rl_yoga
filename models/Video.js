'use strict';
module.exports = function(sequelize, DataTypes) {
  var Videos = sequelize.define('videos', {
    videoname: DataTypes.STRING,
    description: DataTypes.STRING,
    url: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return Videos;
};