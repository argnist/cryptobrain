const db = require("./database")("history");
const trainDb = require("./database")("train");

async function finder() {
    try {
        const currencies = ["bitcoin", "ethereum"];
        const currCount = currencies.length;
        const data = await db.find({"id": {$in: currencies}}, {time: 1, id: 1});

        const train = [];
        for (let i = currCount * 2 - 1; i < data.length; i += currCount) {

            let input = [];
            let output = [];
            for (let j = currCount - 1; j >= 0; j--) {
                input = [
                    ...input,
                    data[i - currCount - j].price_usd,
                    data[i - currCount - j].price_btc,
                    data[i - currCount - j].change_1h,
                    data[i - currCount - j].change_24h,
                    data[i - currCount - j].change_7d,
                    data[i - currCount - j].volume_24h,
                ];
                output = [
                    ...output,
                    Number(data[i - j].price_usd > data[i - currCount - j].price_usd)
                ]

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
