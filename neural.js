const brain = require("brain.js");
const trainDb = require("./database")("train");

const net = new brain.NeuralNetwork({
    activation: 'sigmoid', // activation function sigmoid   relu   leaky-relu   tanh
    hiddenLayers: [2],
    learningRate: 0.6 // global learning rate, useful when training using streams
});


// const data = [{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
//     {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
//     {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}];

const main = async () => {
    const data = (await trainDb.find({})).map(item => ({input: item.input, output: item.output}));
    const SPLIT = Math.floor(data.length * 0.75);
    const trainData = data.slice(0, SPLIT);
    const testData = data.slice(SPLIT + 1);
    //console.log(testData);

    net.train(trainData, {
        errorThresh: 0.005,  // error threshold to reach
        iterations: 20000,   // maximum training iterations
        log: true,           // console.log() progress periodically
        logPeriod: 1000,       // number of iterations between logging
    });

    const output = testData.map(test => ({input: test.input, output: net.run(test.input)}));
//const output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
    console.log(output);
    //console.log(net.run(testData[0].input));
    //console.log(net.run(testData[1].input));
    //console.log(net.run(testData[2].input));


    //
    // const output2 = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }
    // console.log(output2);
};
main();
