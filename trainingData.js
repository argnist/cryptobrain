const fs = require("fs");
const db = require("./database")("history");
fs.unlinkSync("./train");
const trainDb = require("./database")("train");


const min = (data, field) => Math.min(...data.map(item => item[field]));
const max = (data, field) => Math.max(...data.map(item => item[field]));

const normPercent = (value, min, max) => Number(((value - min) / (max - min)).toFixed(5));

async function finder() {
    try {
        const currencies = ["bitcoin", "bitcoin-cash"];
        const currCount = currencies.length;
        const data = await db.find({"id": {$in: currencies}}, {time: 1, id: 1});
        // console.log(data);
        const train = [];
        const startShift = currCount * 12;
        for (let i = currCount - 1; i < data.length - startShift; i += currCount) {
            if (data[i + startShift].time - data[i].time > 4000000) continue;
            let input = [];
            let output = [];
            for (let j = currCount - 1; j >= 0; j--) {
                input = [
                    ...input,
                    data[i - j].price_usd,
                    data[i - j].price_btc,
                    normPercent(data[i - j].change_1h, min(data, "change_1h"), max(data, "change_1h")),
                    normPercent(data[i - j].change_24h, min(data, "change_24h"), max(data, "change_24h")),
                    normPercent(data[i - j].change_7d, min(data, "change_7d"), max(data, "change_7d")),
                    normPercent(data[i - j].volume_24h, min(data, "volume_24h"), max(data, "volume_24h"))
                    //Number(((data[i - currCount - j].volume_24h / data[i - currCount - j].price_usd)).toFixed(5)),
                ];
                output = [
                    ...output,
                    Number(data[i + startShift - j].change_1h > 2)
                ];
                console.log(data[i - j].price_usd, data[i + startShift - j].price_usd, data[i + startShift - j].time - data[i - j].time);

            }
            train.push({
                input: input,
                output: output,
                key: data[i].time
            });

        }
        trainDb.insert(train);
    } catch (e) {
        console.error(e.message);
    }


}

finder();
