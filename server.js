const request = require('request-promise');
const db = require("./database")("history");

const makeRequest = async () => {
    try {
        return await request.get('https://api.coinmarketcap.com/v1/ticker/?limit=10');
    }
    catch (e) {
        console.error(e.message);
    }
};

const parseData = rawData => {
    try {
        const parsedData = JSON.parse(rawData);
        return parsedData.map(item => ({
            id: item.id,
            price_usd: Number(item.price_usd),
            price_btc: Number(item.price_btc),
            volume_24h: Number(item["24h_volume_usd"]),
            change_1h: Number(item.percent_change_1h),
            change_24h: Number(item.percent_change_24h),
            change_7d: Number(item.percent_change_7d),
            updated: Number(item.last_updated)
        }));
    } catch (e) {
        console.error(e.message);
    }
};

const prepareData = (data, time) => data.map(item => ({
    ...item,
    key: item.id + item.updated,
    time: time
}));


async function main() {
    const rawData = await makeRequest();
    const parsedData = parseData(rawData);
    const time = Date.now();
    const data = prepareData(parsedData, time);
    db.insert(data);
    console.log("Finished for " + time);
}

main();
setInterval(main, 250000);
