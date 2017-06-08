'use strict';
module.exports = function(sequelize, DataTypes) {
  var AboutMe = sequelize.define('AboutMe', {
    bio: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    },
  freezeTableName: true
  });
  return AboutMe;
};