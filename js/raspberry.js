import { Gpio } from "onoff";

export const LED_NAMES = {
    BEAT: 'BEAT',
    RESTART: 'RESTART'
}

const INSTRUMENT = {
    BASS: 'BASS',
    GUITAR: 'GUITAR',
    DRUMS: 'DRUMS',
    KEYBOARD: 'KEYBOARD'
};

const INSTRUMENTS = [
    INSTRUMENT.BASS,
    INSTRUMENT.GUITAR
];

const COLOR = {
    GREEN: 'GREEN',
    BLUE: 'BLUE'
};

const COLORS = [
    COLOR.GREEN,
    COLOR.BLUE
];

const FLASH_TIME = 800;
const CYCLE_TIME = 200;
const DEBOUNCE_TIME = 20;

// red led
const BEAT_LED = new Gpio(4, 'out');

// green led
const RESTART_LED = new Gpio(3, 'out');

const BASS_IN = new Gpio(21, 'in', 'both', {debounceTimeout: DEBOUNCE_TIME});
const GUITAR_IN = new Gpio(20, 'in', 'both', {debounceTimeout: DEBOUNCE_TIME});
/*
const DRUMS_IN = new Gpio(16, 'in', 'both', {debounceTimeout: DEBOUNCE_TIME});
const KEYBOARD_IN = new Gpio(12, 'in', 'both', {debounceTimeout: DEBOUNCE_TIME});
*/

const GREEN_OUT = new Gpio(26, 'out');
const BLUE_OUT = new Gpio(19, 'out');
/*
const RED = new Gpio( 13 ,'out');
const YELLOW = new Gpio( 6 ,'out');
*/

const COLOR_PINS = {
    'green': GREEN_OUT,
    'blue': BLUE_OUT
}

class RPI {
    constructor(cb, debug) {
        this.cb = cb;
        this.debug = debug;

        this.isRunning = false;
        this.interval = null;
        this.currentColorIdx = -1;

        this.bassData = [
            // green
            [],

            // blue
            []
        ];


        this.guitarData = [
            // green
            [],

            // blue
            []
        ];

        this.conectionState = {
            green: null,
            blue: null,
            yellow: null,
            purple: null
        };

        BASS_IN.watch((err, value) => {
            if (err) {
                console.error('There was an error', err);
                return;
            }

            if (this.isRunning) {
                this.bassData[this.currentColorIdx].push(value);
            }
        });

        GUITAR_IN.watch((err, value) => {
            if (err) {
                console.error('There was an error', err);
                return;
            }

            if (this.isRunning) {
                this.guitarData[this.currentColorIdx].push(value);
            }
        });

    }
    
    toggleLed (led) {
        led.writeSync(led.readSync() ^ 1);
    }

    _flashLed (led) {
        this.toggleLed(led);

        setTimeout(() => {
            this.toggleLed(led);
        }, FLASH_TIME);
    }

    flashLed (led) {
        switch (led) {
            case LED_NAMES.BEAT:
                this._flashLed(BEAT_LED);
                break;

            case LED_NAMES.RESTART: {
                this._flashLed(RESTART_LED);
                break
            };

            default:
                console.log('unknown led', led)
        }
    }

    start() {
        this.isRunning = true;
        this.interval = setInterval(() => this.cycle(), CYCLE_TIME);
    }

    getColorNameLC(idx) {
        return COLORS[idx].toLowerCase();
    }

    cycle() {
        let currentColorName;
        
        if (this.currentColorIdx !== -1) {
            currentColorName = this.getColorNameLC(this.currentColorIdx);
            if(this.debug) {
                console.log('finished cycle', this.currentColorIdx, currentColorName);
            }

            // report states
            let currentInstrument = null;
            for (let i = 0; i < INSTRUMENTS.length; i++) {
                const instr = INSTRUMENTS[i];
                const isOn = this.isOn(this.currentColorIdx, instr);
                if (isOn) {
                    currentInstrument = instr;
                    break;
                }
            }
            const prevInstrument = this.conectionState[currentColorName];

            // has a change been detected?
            if (prevInstrument !== currentInstrument) {
                this.conectionState[currentColorName] = currentInstrument;
                this.cb({
                    color: currentColorName,
                    instrument: currentInstrument
                });
            }

            // delete cycle data
            this.bassData[this.currentColorIdx] = [];
            this.guitarData[this.currentColorIdx] = [];

            // turn off pin from previous cycle
            COLOR_PINS[currentColorName].writeSync(0);
        }

        this.currentColorIdx++;

        if (this.currentColorIdx === COLORS.length) {
            this.currentColorIdx = 0;
        }
        currentColorName = this.getColorNameLC(this.currentColorIdx);

        // turn on pin from current cycle
        COLOR_PINS[currentColorName].writeSync(1);
    }

    isOn(color, instrument) {
        const avg = this.likelihood(color, instrument);
        if (this.debug) {
            console.log('likelihood', color, instrument, avg);
        }
        return avg > 0.5;
    }

    likelihood(color, instrument) {
        let valuesFromCycle = [];

        if (instrument === INSTRUMENT.BASS) {
            valuesFromCycle = this.bassData[color];
        } else if (instrument === INSTRUMENT.GUITAR) {
            valuesFromCycle = this.guitarData[color];
        }
        const sum = valuesFromCycle.reduce((a, b) => a + b, 0);
        const avg = (sum / valuesFromCycle.length) || 0;

        return avg;
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.interval);
    }

    disconnectPints() {
        BEAT_LED.writeSync(0);
        BEAT_LED.unexport();
    
        RESTART_LED.writeSync(0);
        RESTART_LED.unexport();
    
        for (let i = 0; i < COLORS; i++) {
            const clr = COLORS[i].toLowerCase();
            const clrpin = COLOR_PINS[clr];
            clrpin.writeSync(0);
            clrpin.unexport();
        }

        BASS_IN.unexport();
        GUITAR_IN.unexport();
    }
}

export default RPI;