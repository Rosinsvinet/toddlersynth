import { LED_NAMES, flashLed, disconnectPins, BASS_1 } from './js/raspberry.js';

BASS_1.watch((err, value) => { 
    if (err) {
        console.error('There was an error', err);
        return;
    }

    console.log('BASS_1', value);
    if (value === 0) {
        console.log('red led');
        flashLed(LED_NAMES.BEAT);
    } else if (value === 1) {
        console.log('green led');
        flashLed(LED_NAMES.RESTART);
    }
});

process.on('SIGINT', disconnectPins);