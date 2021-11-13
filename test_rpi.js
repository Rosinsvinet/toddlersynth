import RPI, { LED_NAMES } from './js/raspberry.js';
const rpi = new RPI((change) => {
    if (change.instrument) {
        console.log(`now ${change.color} has been connected to ${change.instrument}`);
        rpi.flashLed(LED_NAMES.BEAT);
    } else {
        console.log(`now ${change.color} has been disconnected`);
        rpi.flashLed(LED_NAMES.RESTART);
    }
}, false);

console.log('starting up...')
rpi.start();

process.on('SIGINT', () => {
    rpi.stop();
    rpi.disconnectPints();
});