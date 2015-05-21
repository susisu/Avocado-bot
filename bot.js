/*
 * Avocado bot
 * copyright (c) 2015 Susisu
 */

"use strict";

var avocore = require("avocore");

var twitter = avocore.twitter;

var config = require("./config.json");

var keys =
    new twitter.KeySet(
        config["consumer_key"],
        config["consumer_secret"],
        config["access_token"],
        config["access_token_secret"]
    );

module.exports = [
    avocore.cron("00 */10 * * * *")
        .then(twitter.tweetRandom(keys, "data/random.txt", "\n", "utf8")),
    avocore.cron("00 */5 * * * *")
        .then(avocore.readFile("data/reply_log.json", "utf8"))
        .bind(function (logJSON) {
            var logData;
            return new avocore.Action(function (emit) {
                    try {
                        logData = JSON.parse(logJSON);
                        if (logData["latest_reply_id_str"] !== undefined) {
                            emit(logData["latest_reply_id_str"]);
                        }
                        else {
                            console.log("\"latest_reply_id_str\" not found");
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                })
                .bind(function (sinceIdStr) {
                    return twitter.replyMentions(keys, config["screen_name"],
                            100, sinceIdStr, require("./data/reply_patterns.js"))
                        .bind(function (latestIdStr) {
                            logData["latest_reply_id_str"] = latestIdStr;
                            return avocore.writeFile("data/reply_log.json",
                                    JSON.stringify(logData), "utf8");
                        });
                });
        }),
    avocore.cron("00 */5 * * * *")
        .then(avocore.readFile("data/reply_timeline_log.json", "utf8"))
        .bind(function (logJSON) {
            var logData;
            return new avocore.Action(function (emit) {
                    try {
                        logData = JSON.parse(logJSON);
                        if (logData["latest_reply_timeline_id_str"] !== undefined) {
                            emit(logData["latest_reply_timeline_id_str"]);
                        }
                        else {
                            console.log("\"latest_reply_timeline_id_str\" not found");
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                })
                .bind(function (sinceIdStr) {
                    return twitter.replyHomeTimeline(keys, config["screen_name"],
                            100, sinceIdStr, require("./data/reply_timeline_patterns.js"))
                        .bind(function (latestIdStr) {
                            logData["latest_reply_timeline_id_str"] = latestIdStr;
                            return avocore.writeFile("data/reply_timeline_log.json",
                                    JSON.stringify(logData), "utf8");
                        });
                });
        }),
    avocore.cron("00 */10 * * * *")
        .then(twitter.followBack(keys, config["screen_name"], 20))
];
