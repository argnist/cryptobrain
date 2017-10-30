const fs = require("fs");
const db = require("./database")("history");
fs.unlinkSync("./vector");
const trainDb = require("./database")("vector");

async function finder() {
    try {
        const currCount = 10;
        const data = await db.find({}, {time: 1, id: 1});
        const train = [];
        // const startShift = currCount * 12;
        for (let i = currCount - 1; i < data.length; i += currCount) {
            // if (data[i + startShift].time - data[i].time > 4000000) continue;
            let input = [];
            for (let j = currCount - 1; j >= 0; j--) {
                input = [
                    ...input,
                    data[i - j].id,
                    data[i - j].price_usd,
                    data[i - j].price_btc,
                    data[i - j].change_1h,
                    data[i - j].change_24h,
                    data[i - j].change_7d,
                    data[i - j].volume_24h,
                ];
            }
            train.push({
                input: input,
                time: data[i].time
            });

        }
        trainDb.insert(train);
    } catch (e) {
        console.error(e.message);
    }


}

finder();
