const fs = require("fs");
const db = require("./database")("vector");
fs.unlinkSync("./train");
const trainDb = require("./database")("train");


const min = (data, field) => Math.min(...data.map(item => item.input[field]));
const max = (data, field) => Math.max(...data.map(item => item.input[field]));

const normPercent = (value, min, max) => {
    if (isNaN(min) || isNaN(max) || (Math.abs(min - max) < 0.000001)) return value;
    return Number(((value - min) / (max - min)).toFixed(5));
};

async function finder() {
    try {
        const currCount = 10;
        const data = await db.find({}, {time: 1});
        const minimax = data[0].input.map((item, index) => ({
            min: min(data, index),
            max: max(data, index)
        }));
        const startShift = 12*24;
        for (let i = 0; i < data.length - startShift; i++) {
            if (data[i + startShift].time - data[i].time > 330000*startShift) continue;
            const input = data[i].input.map((value, index) => normPercent(value, minimax[index].min, minimax[index].max));
            const output = [];
            for (let j = 0; j < currCount; j++) {
                output.push(
                    Number(data[i + startShift].input[7*j+4] > 2) // change_24h
                );
            }

            const train = {
                input: input,
                output: output,
                key: data[i].time
            };
            trainDb.insert(train);
        }
    }
    catch (e) {
        console.error(e.message);
    }
}

finder();
