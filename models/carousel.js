'use strict';
module.exports = function(sequelize, DataTypes) {
  var Carousel = sequelize.define('Carousel', {
    imagepath: DataTypes.STRING,
    quote: DataTypes.STRING,
    quotesource: DataTypes.STRING,
    quoteWidth: DataTypes.STRING,
    quoteHeight: DataTypes.STRING,
    vAlignment: DataTypes.STRING,
    hAlignment: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return Carousel;
};