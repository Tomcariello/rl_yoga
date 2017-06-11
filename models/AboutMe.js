'use strict';
module.exports = function(sequelize, DataTypes) {
  var AboutMe = sequelize.define('AboutMe', {
    about: DataTypes.STRING,
    aboutimage: DataTypes.STRING,
    bio: DataTypes.STRING,
    bioimage: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    },
  freezeTableName: true
  });
  return AboutMe;
};