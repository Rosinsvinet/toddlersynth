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

const COLORS = {
    GREEN: 'GREEN',
    BLUE: 'BLUE'
};

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

const GREEN = new Gpio(26, 'out');
const BLUE = new Gpio(19, 'out');
/*
const RED = new Gpio( 13 ,'out');
const YELLOW = new Gpio( 6 ,'out');
*/

const COLOR_PINS = [GREEN, BLUE];

class RPI {
    constructor() {
        this.isRunning = false;
        this.interval = null;
        this.currentColor = -1;

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

        BASS_IN.watch((err, value) => {
            if (err) {
                console.error('There was an error', err);
                return;
            }

            if (this.isRunning) {
                this.bassData[this.currentColor].push(value);
            }
        });

        GUITAR_IN.watch((err, value) => {
            if (err) {
                console.error('There was an error', err);
                return;
            }

            if (this.isRunning) {
                this.guitarData[this.currentColor].push(value);
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

    cycle() {
        if (this.currentColor !== -1) {
            // report states
            console.log(
                'is bass in currentColor?',
                this.likelihood(this.currentColor, INSTRUMENT.BASS),
                this.currentColor
            );
            console.log(
                'is bass in currentColor?',
                this.likelihood(this.currentColor, INSTRUMENT.BASS),
                this.currentColor
            );

            const isBass = this.isOn(this.currentColor, INSTRUMENT.BASS);
            const isGuitar = this.isOn(this.currentColor, INSTRUMENT.GUITAR);

            // green
            if (this.currentColor === 0) {
                if (isBass) {
                    console.log('Green Bass !');
                }
                if (isGuitar) {
                    console.log('Green Guitar !');
                }
            }

            // blue
            if (this.currentColor === 1) {
                if (isBass) {
                    console.log('Blue Bass !');
                }
                if (isGuitar) {
                    console.log('Blue Guitar !');
                }
            }

            // turn off pin from previous cycle
            COLOR_PINS[this.currentColor].writeSync(0);
        }

        this.currentColor++;
        if (this.currentColor === COLOR_PINS.length) {
            this.currentColor = 0;
        }

        // turn on pin from current cycle
        COLOR_PINS[this.currentColor].writeSync(1);
    }

    isOn(color, instrument) {
        const avg = this.likelihood(color, instrument);
        return avg > 0.5;
    }

    likelihood(color, instrument) {
        let valuesFromCycle = [];

        if (instrument === INSTRUMENT.BASS) {
            valuesFromCycle = this.bassData[color];
            this.bassData[color] = [];
        } else if (instrument === INSTRUMENT.GUITAR) {
            valuesFromCycle = this.guitarData[color];
            this.guitarData[color] = [];
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
    
        for (let i = 0; i < COLOR_PINS.length; i++) {
            const clrpin = COLOR_PINS[i];
            clrpin.writeSync(0);
            clrpin.unexport();
        }

        BASS_IN.unexport();
        GUITAR_IN.unexport();
    }
}

export default RPI;