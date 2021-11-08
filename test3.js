import RPI from './js/raspberry.js';
const rpi = new RPI((change) => {
    if (change.instrument) {
        console.log(`now ${change.color} has been connected to ${change.instrument}`);
    } else {
        console.log(`now ${change.color} has been disconnected`);
    }
}, true);

console.log('starting up...')
rpi.start();

process.on('SIGINT', () => {
    rpi.stop();
    rpi.disconnectPints();
});