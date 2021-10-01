import { Gpio } from "onoff";

const LED_NAMES = {
    BEAT: 'BEAT',
    RESTART: 'RESTART'
}

const FLASH_TIME = 800;
const DEBOUNCE_TIME = 50;

// red led
const BEAT_LED = new Gpio(4, 'out');

// green led
const RESTART_LED = new Gpio(3, 'out');

const BASS_1 = new Gpio(21, 'in', 'both', {debounceTimeout: DEBOUNCE_TIME});

const toggleLed = (led) => {
    led.writeSync(led.readSync() ^ 1);
}

const _flashLed = (led) => {
    toggleLed(led);

    setTimeout(() => {
        toggleLed(led);
    }, FLASH_TIME);
}

const flashLed = (led) => {
    switch (led) {
        case LED_NAMES.BEAT:
            _flashLed(BEAT_LED);
            break;

        case LED_NAMES.RESTART: {
            _flashLed(RESTART_LED);
            break
        };

        default:
            console.log('unknown led', led)
    }
};

const disconnectPins = () => {
    BEAT_LED.writeSync(0);
    BEAT_LED.unexport();

    RESTART_LED.writeSync(0);
    RESTART_LED.unexport();

    BASS_1.unexport();
}


export {LED_NAMES, flashLed, disconnectPins, BASS_1}