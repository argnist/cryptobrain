const brain = require("brain.js");
const trainDb = require("./database")("train");

const getAccuracy = (net, testData) => {
    let hits = 0;
    testData.forEach((datapoint) => {
        const output = net.run(datapoint.input);

        const passed = output.map((item, index) => Number(Math.round(item) === datapoint.output[index]))
            .reduce((prev, cur) => prev + cur);
        console.log(datapoint.input, datapoint.output, [...output], passed);
        if (output.length <= passed) {
            hits += 1;
        }
    });
    return 1 - hits / testData.length;
};

const createNet = (inputLength, outputLength, trainLength) => {
    const layers = Math.round((trainLength / 3 - outputLength) / (inputLength + outputLength + 1));
    console.log(layers);
    console.log(`(${trainLength / 3 - outputLength}-${inputLength+1}X)/(X+${outputLength+1})`);
    return new brain.NeuralNetwork({
        activation: 'sigmoid', // activation function sigmoid   relu   leaky-relu   tanh
        hiddenLayers: [36],
        learningRate: 0.2 // global learning rate, useful when training using streams
    });
};

const getInput = (input) => [
    ...input.slice(1, 7),
    ...input.slice(8, 14),
    ...input.slice(15,21),
    ...input.slice(22,28),
    ...input.slice(29,35),
    ...input.slice(36,42),
];

const main = async () => {
    const data = (await trainDb.find({})).map(item => ({
        input: getInput(item.input),
        output: item.output.slice(0, 6)
    }));

    const SPLIT = Math.floor(data.length * 0.8);
    const trainData = data.slice(0, SPLIT);
    const testData = data.slice(SPLIT + 1);

    const net = createNet(data[0].input.length, data[0].output.length, trainData.length);

    const trainResult = net.train(trainData, {
        errorThresh: 0.01,  // error threshold to reach
        iterations: 20000,   // maximum training iterations
        log: true,           // console.log() progress periodically
        logPeriod: 500,       // number of iterations between logging
    });

    const accuracy = getAccuracy(net, testData);

    console.log(trainResult);
    console.log(accuracy, testData.length);

};
main();
