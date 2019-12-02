/* jshint esversion:8, node:true, strict:true */
"use strict";
/**
 * Node-RED mocker.
 * 
 * This script mocks Node-RED so that it is possible
 * to natively call a module originally designed for Node-RED from command line without requiring Node-RED.
 *
 * The first command-line argument parameter must be a Node-RED module name as declared in the local `package.json['node-red']['nodes']`.
 * The following command-line arguments must use the format `--someArgument='Hello World'` and are passed to the module via the Node-RED configuration.
 *
 * @author Alexandre Alapetite <https://alexandra.dk/alexandre.alapetite>
 * @copyright Alexandra Institute <https://alexandra.dk> for the SynchroniCity European project <https://synchronicity-iot.eu> as a contribution to FIWARE <https://www.fiware.org>
 * @license MIT
 * @version 1.0
 * @date 2019-11-28 / 2019-12-02
 */

const EventEmitter = require('events').EventEmitter;

function Context() {
	this._values = {};
	this.get = key => this._values[key];
	this.set = (key, value) => this._values[key] = value;
}

const RED = {
		node: null,
		nodes: {
			config: {},
			createNode: (node, config) => {
				node.eventEmitter = new EventEmitter();
				node.on = (eventName, listener) => node.eventEmitter.on(eventName, listener);
				node.debug = msg => {
					node.eventEmitter.emit('debug', msg);
					if (node.eventEmitter.listenerCount('debug') <= 0) {
						console.warn(msg);
					}
				};
				node.error = msg => {
					node.eventEmitter.emit('error', msg);
					if (node.eventEmitter.listenerCount('error') <= 0) {
						console.warn(msg);
					}
				};
				node.input = msg => node.eventEmitter.emit('input', msg);
				node.log = msg => {
					node.eventEmitter.emit('log', msg);
					if (node.eventEmitter.listenerCount('log') <= 0) {
						console.warn(msg);
					}
				};
				node.send = msg => node.eventEmitter.emit('send', msg);

				node.status = status => {};

				const context = new Context();
				context.flow = new Context();
				context.global = new Context();
				node.context = () => context;

				RED.node = node;
				RED.nodes.list.push(node);
			},
			list: [],
			registerType: (name, f) => new f(RED.nodes.config),
		},
		load: (main = null) => {
			if (!main) {
				main = require.main;
			}
			try {
				const args = process.argv.slice(2);
				const config = main.require('./package.json');
				let module = args && args.length > 0 ? args[0] : '';
				if (!/^[a-zA-Z0-9_-]+$/g.test(module)) {
					module = '';
				}
				const script = module && config && config['node-red'] && config['node-red'].nodes ? config['node-red'].nodes[module] : '';
				if (script) {
					//Pass all command-line arguments to the future Node-RED module
					RED.nodes.config = {};
					for (let param of args.slice(1)) {
						const match = /^--([a-zA-Z0-9_]+)=(.+)?$/g.exec(param);
						if (match) {
							const paramKey = match[1];
							const paramValue = JSON.parse(match[2]);
							RED.nodes.config[paramKey] = paramValue;
						} else {
							console.warn('Invalid parameter for Node-RED module: ' + param);
						}
					}

					const module = main.require('./' + script);
					module(RED);
					return RED.node;
				}
			} catch (ex) {
				console.error(ex);
			}
			console.error('Invalid argument for Node-RED module! Check package.json');
			console.error('Usage: node ./index.js node-name --firstProperty="Hello World"');
			return false;
		},
		run: () => {
			//Number of STDIN lines for which we have not received a result yet
			let nbAwaited = 0;
			let done = false;

			//When our Node-RED module sends/outpus a new message
			RED.node.on('send', msg => {
				console.log(JSON.stringify(msg));
				nbAwaited--;
				if (done && nbAwaited <= 0) {
					process.exit(0);
				}
			});

			RED.node.on('error', msg => {
				console.error(msg);
			});

			RED.node.on('log', msg => {
				console.warn(msg);
			});


			const readline = require('readline');

			const rl = readline.createInterface({
				input: process.stdin,
				terminal: false,
			});

			//Read JSON messages from standard input
			rl.on('line', line => {
				try {
					const msg = JSON.parse(line);
					nbAwaited++;
					RED.node.input(msg);
				} catch (ex) {
					console.error('Invalid JSON input: ' + ex);
				}
			});

			rl.on('error', () => {
				console.error('==== STDIN error ====');
				done = true;
			});

			rl.on('pause', () => {
				console.error('==== STDIN paused ====');
				done = true;
			});

			rl.on('close', () => {
				console.error('==== STDIN closed ====');
				done = true;
			});
		},
	};

module.exports = RED;
