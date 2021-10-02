import RPI from './js/raspberry.js';
const rpi = new RPI();

rpi.start();

process.on('SIGINT', () => {
    rpi.stop();
    rpi.disconnectPints();
});

