'use strict';
module.exports = function(sequelize, DataTypes) {
  var Bio = sequelize.define('Bio', {
    bio: DataTypes.STRING,
    image: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
      }
    },
  freezeTableName: true
  });
  return Bio;
};