import RPI from './js/raspberry.js';
const rpi = new RPI();

console.log('starting up...')
rpi.start();

process.on('SIGINT', () => {
    rpi.stop();
    rpi.disconnectPints();
});

