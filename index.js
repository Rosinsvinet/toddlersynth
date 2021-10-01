import port from 'port';
import KBTest from './js/keytest.js';
import { LED_NAMES, flashLed, disconnectPins } from './js/raspberry.js';

const pd = port({
	'read': 10004,
	'write': 9006,
	'encoding': 'ascii',
	'basepath': process.cwd(),
	'flags': {
		//'nogui': true,
		'stderr': true,
		'send': 'pd dsp 1',
		'open': './pd/main.pd'
	}
})
.on('connect', function(){
	console.log('on connect');
})
.on('data', function(data){
	if (data.indexOf('beat') > -1) {
		flashLed(LED_NAMES.BEAT);
	}
	if (data.indexOf('restart') > -1) {
		flashLed(LED_NAMES.RESTART);
	}
})
.on('stderr', function(buffer){
	console.log('on stderr');
	console.log(buffer.toString());
})
.on('destroy', function(){
	disconnectPins(()=> {
		console.log('good bye')
		process.exit();
	});
})
.create();

const kbTest = new KBTest((f,t) => {
	if (pd && pd.isRunning()) {
		const msg = `${f} ${t};\n`;
		console.log(msg);
		pd.write(msg);
	} else {
		console.log('connection not yet established')
	}
}, () => {
	pd.destroy();
	
});
console.log(process.cwd());