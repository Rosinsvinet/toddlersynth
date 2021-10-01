import { LED_NAMES, flashLed, disconnectPins } from './js/raspberry.js';

setTimeout(() => {
    console.log('BEAT LED, red');
    flashLed(LED_NAMES.BEAT)
}, 500)

setTimeout(() => {
    console.log('RESTART LED, green');
    flashLed(LED_NAMES.RESTART)
}, 2000)

setTimeout(() => {
    console.log('exiting');
    disconnectPins();
}, 3000);