/*
 * Avocado bot
 * copyright (c) 2015 Susisu
 */

"use strict";

var fs = require("fs");

var avocore    = require("avocore"),
    Action     = avocore.Action,
    pure       = avocore.pure,
    bind       = avocore.bind,
    then       = avocore.then,
    map        = avocore.map,
    filter     = avocore.filter,
    reduce     = avocore.reduce,
    merge      = avocore.merge,
    echo       = avocore.echo,
    cron       = avocore.cron,
    splitArray = avocore.splitArray;

var twitter = avocore.twitter;

var config = require("./config.json");

var keys =
    new twitter.KeySet(
        config["consumer_key"],
        config["consumer_secret"],
        config["access_token"],
        config["access_token_secret"]
    );

function readList(file) {
    return new Action(function (emit) {
        fs.readFile(file, { "encoding": "utf8" }, function (error, content) {
            if (!error) {
                emit(content.split("\n"));
            }
            else {
                console.log(error);
            }
        });
    });
}

function pickRandom(list) {
    return new Action(function (emit) {
        if (list.length > 0) {
            emit(list[Math.floor(Math.random() * list.length)]);
        }
    });
}

function tweet(status) {
    return twitter.post(keys, "statuses/update", {
        "status": status
    });
}

module.exports = [
    cron("00 */10 * * * *").then(readList("data/random.txt")).bind(pickRandom).bind(tweet)
];
