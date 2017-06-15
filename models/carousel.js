'use strict';
module.exports = function(sequelize, DataTypes) {
  var Carousel = sequelize.define('Carousel', {
    imagepath: DataTypes.STRING,
    quote: DataTypes.STRING,
    quotesource: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return Carousel;
};