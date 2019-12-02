# node-red-contrib-mock-cli

This is a [Node.js](https://nodejs.org) module to allow running [Node-RED](https://nodered.org) nodes from command-line, and pipe one to another, using a similar flow than what would be done in the Node-RED graphical interface.

Made in December 2019 by [Alexandre Alapetite](https://alexandra.dk/alexandre.alapetite) at the [Alexandra Institute](https://alexandra.dk) for the [SynchroniCity European project](https://synchronicity-iot.eu).

License: MIT

## Usage

Add an `index.js` file to your Node-RED node, next to a `package.json` that has a structure like `{ "node-red": {"node-name": "node-name.js"} }`:

```js
const RED = require('node-red-contrib-mock-cli');
const noderedNode = RED.load(require.main);
if (noderedNode) {
	RED.run();
} else {
	console.error('Error loading Node-RED node!');
}
```

One can then invoke the node from command-line, passing the node name first, and then some optional node properties in JSON format:

```sh
node ./index.js node-name --firstProperty='{"Some":"JSON"}' --secondProperty='"Some text"' --thirdProperty='123'
```

The command expects JSON messages with a Node-RED structure `{"payload":"Example"}` from standard input, one line per message.

The command outputs JSON messages with a Node-RED structure to standard output, one line per message.

## Notes

For unit testing, and if requiring the full Node-RED is fine, then check the official [node-red-node-test-helper](https://github.com/node-red/node-red-node-test-helper) instead of this module.
