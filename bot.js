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

function parseJSON(json) {
    return new avocore.Action(function (emit) {
        var data;
        try {
            data = JSON.parse(json);
        }
        catch (error) {
            console.log(error);
        }
        if (data !== undefined) {
            emit(data);
        }
    });
}

module.exports = [
    avocore.cron("00 */10 * * * *")
        .then(twitter.tweetRandom(keys, "data/random.txt", "\n", "utf8")),
    avocore.cron("00 */5 * * * *")
        .then(avocore.readFile("data/reply_log.json", "utf8"))
        .bind(parseJSON)
        .bind(function (data) {
            return twitter.replyMentions(
                    keys, config["screen_name"],
                    100, data["latest_reply_id_str"],
                    require("./data/reply_patterns.js")
                )
                .bind(function (latestIdStr) {
                    if (latestIdStr !== "0") {
                        data["latest_reply_id_str"] = latestIdStr;
                    }
                    return avocore.writeFile(
                            "data/reply_log.json",
                            JSON.stringify(data), "utf8"
                        );
                });
        }),
    avocore.cron("00 */5 * * * *")
        .then(avocore.readFile("data/reply_timeline_log.json", "utf8"))
        .bind(parseJSON)
        .bind(function (data) {
            return twitter.replyHomeTimeline(
                    keys, config["screen_name"],
                    100, data["latest_reply_timeline_id_str"],
                    require("./data/reply_timeline_patterns.js")
                )
                .bind(function (latestIdStr) {
                    if (latestIdStr !== "0") {
                        data["latest_reply_timeline_id_str"] = latestIdStr;
                    }
                    return avocore.writeFile(
                            "data/reply_timeline_log.json",
                            JSON.stringify(data), "utf8"
                        );
                });
        }),
    avocore.cron("00 */10 * * * *")
        .then(twitter.followBack(keys, config["screen_name"], 20))
];
