/**
 * Node-RED test node.
 */

module.exports = RED => {
	'use strict';

	function TestNode(config) {
		RED.nodes.createNode(this, config);
		const node = this;
		const multiplyBy = config.multiplyBy;

		node.on('input', async msg => {
			node.debug('test-node just received a message');
			try {
				msg.payload *= multiplyBy;
				node.send(msg);
			} catch (ex) {
				msg.error = 'Error: ' + ex;
			}
		});
	}

	RED.nodes.registerType('test-node', TestNode);
};
