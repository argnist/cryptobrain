const brain = require("brain.js");
const trainDb = require("./database")("train");

const net = new brain.NeuralNetwork({
    activation: 'sigmoid', // activation function sigmoid   relu   leaky-relu   tanh
    hiddenLayers: [4, 3],
    learningRate: 0.1 // global learning rate, useful when training using streams
});

const getAccuracy = (net, testData) => {
    let hits = 0;
    testData.forEach((datapoint) => {
        const output = net.run(datapoint.input);
        console.log(datapoint.input, datapoint.output, [...output]);
        const passed = output.map((item, index) => Number(Math.round(item) === datapoint.output[index])).reduce((prev, cur) => prev + cur);

        if (output.length === passed) {
            hits += 1;
        }
    });
    return 1 - hits / testData.length;
};

const main = async () => {
    const data = (await trainDb.find({})).map(item => ({
        input: [...item.input.slice(2, 6), ...item.input.slice(7, 12)],
        output: item.output.slice(0, 2)
    }));
   // console.log(data);
    const SPLIT = Math.floor(data.length * 0.8);
    const trainData = data.slice(0, SPLIT);
    const testData = data.slice(SPLIT + 1);
    //console.log(testData);

    const trainResult = net.train(trainData, {
        errorThresh: 0.03,  // error threshold to reach
        iterations: 10000,   // maximum training iterations
        log: true,           // console.log() progress periodically
        logPeriod: 500,       // number of iterations between logging
    });

    const accuracy = getAccuracy(net, testData);

    console.log(trainResult);
    console.log(accuracy, testData.length);

};
main();
