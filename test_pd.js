import PD from './js/pd.js';
import KBTest from './js/keytest.js';

const onPdReady = () => {
    console.log('pd ready');
}

const onPdBeat = () => {
    console.log('pd beat');
}

const onPdRestart = () => {
    console.log('pd restart');
}

/*
    disconnect rpi when pd is down
*/
const onPdDestroy = () => {
    console.log('pd destroyed');
    process.exit(0);
}

const pd = new PD(onPdReady, onPdBeat, onPdRestart, onPdDestroy);

const onKeyInstrument = (instrument, color) => {
    pd.connection(color, instrument);
}

const onKeyExit = () => {
    pd.destroy();
}

new KBTest(onKeyInstrument, onKeyExit);