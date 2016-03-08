var async = require('async');

/**
 * Выполнение функций из массива параллельно.
 * Если во время выполнения некоторой функции возникает ошибка, то
 * выполнение всех прекращается и вызывается итоговый callback с ошибкой
 * @param tasks
 * @param callback
 */
module.exports.serial = async.waterfall;

module.exports.parallel = async.parallel;

module.exports.map = async.map;

module.exports.makeAsync = async.asyncify;

module.exports.parallel = async.parallelLimit;

module.exports.apply = async.apply;
