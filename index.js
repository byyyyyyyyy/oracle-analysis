const ethers = require('ethers');
const web3 = require('web3');

const threshold = 99.09;
const WSS_URL = "wss://mainnet.infura.io/ws/v3/8da7ddd87641452fa02eb9c4a116b391";
const args = process.argv.slice(2);

if (!args.length) {
    console.log('Params contract address and feed type - (dai,usdc,usdt) are required.');
    return;
}

const abi = require(`./abi/${args[1]}-abi.json`);

console.log('Running through round data...\n');

const address = args[0];

const provider = new ethers.providers.WebSocketProvider(
    WSS_URL
)

const contract = new ethers.Contract(
    address,
    abi,
    provider
);

let latestRound = args[2];

contract
    .latestRound()
    .then(async (result) => {

        if (!latestRound) {
            latestRound = BigInt(result);
        }

        for (let i = latestRound; i >= 0; i--) {

            console.log('Current roundId: ', i.toString());
            const res = await contract.getRoundData(i);
            const answer = BigInt(res.answer).toString();
            
            const convertedAnswer = answer / 1000000;

            if (convertedAnswer <= threshold) {
                console.log('--!Treshold Reached!--')
                console.log('roundId:', res.roundId.toString());
                console.log('answer:', res.answer.toString());
            }
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
