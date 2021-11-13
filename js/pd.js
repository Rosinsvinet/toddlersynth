import port from 'port';
import { COLORS, INSTRUMENTS } from './colorsAndInstruments.js';

class PD {
    constructor(onReady, onBeat, onRestart, onDestroy) {
        this.pd = port({
            'read': 10004,
            'write': 9006,
            'encoding': 'ascii',
            'basepath': process.cwd(),
            'flags': {
                'nogui': true,
                'stderr': true,
                'send': 'pd dsp 1',
                'open': './pd/main.pd'
            }
        })
        .on('connect', function(){
            onReady();
        })
        .on('data', function(data){
            if (data.indexOf('beat') > -1) {
                onBeat();
            }
            if (data.indexOf('restart') > -1) {
                onRestart();
            }
        })
        .on('stderr', function(buffer){
            console.log('on stderr');
            console.log(buffer.toString());
        })
        .on('destroy', function(){
            onDestroy();
        })
        .create();

        /* 
            i messed up:
            the rpi is checking which instrument the color is connected to
            while pd is expecting to be told which color the instrument is connected to
            connectionState and connection() are meant to fix that
        */
        this.connectionState = {
            BASS: null,
            GUITAR: null,
            DRUMS: null,
            KEYBOARD: null
        };
    }

    destroy() {
        this.pd.destroy();
    }

    connection(color, instrument) {
        // were some of the instruments previously connected to this color?
        for (const instr of INSTRUMENTS) {
            if (this.connectionState[instr] === color ) {
                // instrument is now disconnected from color
                this.write(instr, null);
                this.connectionState[instr] = null;
            }
        }

        // do we need to connect something new to this instrument
        if (instrument) {
            this.write(instrument, color);
            this.connectionState[instrument] = color;
        }
    }

    write(instrument, color) {
        if (this.pd.isRunning()) {
            /*
                color index:
                0: off
                1: green
                2: red
                3: blue
                4: purple
            */
            let colorIdx = 0;
            if (color) {
                colorIdx = COLORS.indexOf(color) + 1;
            } 
            const msg = `${instrument.toLowerCase()} ${colorIdx};\n`;
            console.log('msg to pd:', msg);
            this.pd.write(msg);
            return true;
        } else {
            return false;
        }
    }
}

export default PD;