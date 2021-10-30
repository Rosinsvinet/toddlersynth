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
    INSTRUMENT.GUITAR,
    INSTRUMENTS.DRUMS,
    INSTRUMENTS.KEYBOARD
];

const COLOR = {
    GREEN: 'GREEN',
    RED: 'RED',
    BLUE: 'BLUE',
    PURPLE: 'PURPLE'
};

const COLORS = [
    COLOR.GREEN,
    COLOR.RED,
    COLOR.BLUE,
    COLOR.PURPLE
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
const DRUMS_IN = new Gpio(16, 'in', 'both', {debounceTimeout: DEBOUNCE_TIME});
const KEYBOARD_IN = new Gpio(12, 'in', 'both', {debounceTimeout: DEBOUNCE_TIME});

const INSTRUMENT_PINS = {
    BASS: BASS_IN,
    GUITAR: GUITAR_IN,
    DRUMS: DRUMS_IN,
    KEYBOARD: KEYBOARD_IN
};

const GREEN_OUT = new Gpio(26, 'out');
const RED_OUT = new Gpio(19, 'out');
const BLUE_OUT = new Gpio( 13 ,'out');
const PURPLE_OUT = new Gpio( 6 ,'out');

const COLOR_PINS = {
    GREEN: GREEN_OUT,
    RED: RED_OUT,
    BLUE: BLUE_OUT,
    PURPLE: PURPLE_OUT
};

class RPI {
    constructor(cb, debug) {
        this.cb = cb;
        this.debug = debug;

        this.isRunning = false;
        this.interval = null;
        this.currentColor = null;

        this.instrumentData = {};
        for (const instrument of INSTRUMENTS) {
            this.instrumentData[instrument] = {};

            for (const color of COLORS) {
                this.instrumentData[instrument][color] = [];
            }
        }

        this.conectionState = {
            GREEN: null,
            RED: null,
            BLUE: null,
            PURPLE: null
        };

        // input listeners
        for (const instrument of INSTRUMENTS) {
            INSTRUMENT_PINS[instrument].watch((err, value) => {
                if (err) {
                    console.error('There was an error', err);
                    return;
                }
    
                if (this.isRunning) {
                    this.instrumentData[instrument][this.currentColor].push(value);
                }
            });
        }
    }

    start() {
        this.isRunning = true;
        this.interval = setInterval(() => this.cycle(), CYCLE_TIME);
    }

    cycle() {
        if (this.currentColor) {
            if(this.debug) {
                console.log('finished cycle', this.currentColor);
            }

            // report states
            let currentInstrument = null;
            for (let i = 0; i < INSTRUMENTS.length; i++) {
                const instr = INSTRUMENTS[i];
                const isOn = this.isOn(this.currentColor, instr);
                if (isOn) {
                    currentInstrument = instr;
                    break;
                }
            }
            const prevInstrument = this.conectionState[this.currentColor];

            // has a change been detected?
            if (prevInstrument !== currentInstrument) {
                this.conectionState[this.currentColor] = currentInstrument;
                this.cb({
                    color: this.currentColor,
                    instrument: currentInstrument
                });
            }

            // delete cycle data
            for (const instrument of INSTRUMENTS) {
                this.instrumentData[instrument][this.currentColor] = [];
            }

            // turn off pin from previous cycle
            COLOR_PINS[this.currentColor].writeSync(0);
        }

        // pick next color
        const colorIdx = COLORS.indexOf(this.currentColor) // will give -1 if currentColor is null
        colorIdx ++;

        if (colorIdx === COLORS.length) {
            colorIdx = 0;
        }
        this.currentColor = COLORS[colorIdx];

        // turn on pin from current cycle
        COLOR_PINS[this.currentColor].writeSync(1);
    }

    isOn(color, instrument) {
        const avg = this.likelihood(color, instrument);
        if (this.debug) {
            console.log('likelihood', color, instrument, avg);
        }
        return avg > 0.5;
    }

    likelihood(color, instrument) {
        let valuesFromCycle = this.instrumentData[instrument][color];

        const sum = valuesFromCycle.reduce((a, b) => a + b, 0);
        const avg = (sum / valuesFromCycle.length) || 0;

        return avg;
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.interval);
        this.currentColor = null;
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

        for (const instrument of INSTRUMENTS) {
            INSTRUMENT_PINS[instrument].writeSync(0);
            INSTRUMENT_PINS[instrument].unexport();
        }
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
}

export default RPI;