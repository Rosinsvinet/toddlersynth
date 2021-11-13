import { hasUncaughtExceptionCaptureCallback } from 'process';
import readline from 'readline';
import { INSTRUMENTS, COLORS } from './colorsAndInstruments.js';
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const FROM_KEYS = ['q', 'w', 'e', 'r'];
const TO_KEYS = ['a', 's', 'd', 'f', 'g'];

function KBTest (instrumentCallback, exit) {
    this.fromKey = -1;
    
    process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c'){
            exit();
        }
        if (this.fromKey > -1) {
            if (TO_KEYS.indexOf(key.name) > -1 ) {
                instrumentCallback(INSTRUMENTS[this.fromKey], COLORS[TO_KEYS.indexOf(key.name)]);
                this.fromKey = -1;
            }
        } else {
            if (FROM_KEYS.indexOf(key.name) > -1 ) {
                this.fromKey = FROM_KEYS.indexOf(key.name);
            }
        }
    });
    console.log('KBTEST initialized')
}

export default KBTest;