'use strict';
var flow = require('./lib/async-flow.js');
var fs = require('fs');
var directory = './cats/';

flow.serial([
    function (next) {
        fs.readdir(directory, function (error, data) {
            next(error, data);
        });
    },
    function (files, next) {
        files = files.map(function (dir) {
            return directory + dir;
        });
        flow.parallel([
            function (next) {
                // Получаем параметры для каждого файла
                flow.map(files, fs.stat, next);
            },
            function (next) {
                // Читаем содержимое для каждого файла
                flow.map(files, fs.readFile, next);
            }
        ], function (error, data) {
            next(error, data);
        });
    }
], function (error, data) {
    if (error) {
        console.error(error.message);
        return;
    }
    // Собранные параметры по файлам
    var stats = data[0];
    // Прочитанное содержимое файлов
    var contents = data[1];
    contents = contents
        // Исключаем пустые файлы
        .filter(function (content, index) {
            return stats[index].size > 0;
        })
        // Читаем JSON из файлов
        .map(JSON.parse);
    console.log(contents);
});
