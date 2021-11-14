import PD from './js/pd.js';
import RPI, { LED_NAMES } from './js/raspberry.js';

const onRpiCon = (change) => {
    if (change.instrument) {
        console.log(`now ${change.color} has been connected to ${change.instrument}`);
        pd.connection(change.color, change.instrument);
    } else {
        console.log(`now ${change.color} has been disconnected`);

    }
}
/*
    start rpi when pd is ready
 */
const onPdReady = () => {
    console.log('pd connected');
    rpi.start();
}

const onPdBeat = () => {
    rpi.flashLed(LED_NAMES.BEAT);
}

const onPdRestart = () => {
    console.log('restart');
    rpi.flashLed(LED_NAMES.RESTART);
}

/*
    disconnect rpi when pd is down
*/
const onPdDestroy = () => {
    rpi.stop();
    rpi.disconnectPints();
}
const rpi = new RPI(onRpiCon, false);
const pd = new PD(onPdReady, onPdBeat, onPdRestart, onPdDestroy);

process.on('SIGINT', () => {
    pd.destroy();
});