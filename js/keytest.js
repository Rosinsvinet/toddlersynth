import readline from 'readline';
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const FROM_KEYS = ['q', 'w', 'e', 'r'];
const FROM_NAMES = ['bas', 'guitar', 'drums', 'keyboard'];
const TOS = ['a', 's', 'd', 'f', 'g'];

function KBTest (instrumentCallback, exitCallback) {
    this.fromKey = -1;
    
    process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c') {
            exitCallback();
        } else {
            if (this.fromKey > -1) {
                if (TOS.indexOf(key.name) > -1 ) {
                    instrumentCallback(FROM_NAMES[this.fromKey], TOS.indexOf(key.name) );
                    this.fromKey = -1;
                }
            } else {
                if (FROM_KEYS.indexOf(key.name) > -1 ) {
                    this.fromKey = FROM_KEYS.indexOf(key.name);
                }
            }
        }
    });
    console.log('KBTEST initialized')
}

export default KBTest;