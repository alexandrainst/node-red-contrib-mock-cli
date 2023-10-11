# node-red-contrib-mock-cli

This is a [Node.js](https://nodejs.org) module to allow running **a single** [Node-RED](https://nodered.org) node from command-line, and pipe one to another, using a similar flow than what would be done in the Node-RED graphical interface.

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/alexandrainst/node-red-contrib-mock-cli/nodejs.yml?branch=main&logo=github)
![npm](https://img.shields.io/npm/dy/node-red-contrib-mock-cli?logo=npm)

[![NPM statistics](https://nodei.co/npm/node-red-contrib-mock-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-red-contrib-mock-cli/)

Originally made in December 2019 by [Alexandre Alapetite](https://alexandra.dk/alexandre.alapetite) at the [Alexandra Institute](https://alexandra.dk) for the [SynchroniCity European project](https://synchronicity-iot.eu).

License: [MIT](LICENSE.md)

See examples of use in [*node-red-contrib-json-multi-schema*](https://github.com/alexandrainst/node-red-contrib-json-multi-schema),
[*node-red-contrib-chunks-to-lines*](https://github.com/alexandrainst/node-red-contrib-chunks-to-lines), [*node-red-http-basic-auth*](https://github.com/alexandrainst/node-red-http-basic-auth).

## Usage

Add an entry file `index.js` (or another name) to your Node-RED node, next to a `package.json` that contains a structure like `{ "node-red": {"node-type": "node-type.js"} }`:

```js
const RED = require('node-red-contrib-mock-cli');
const noderedNode = RED.load(require.main);
if (noderedNode) {
	//noderedNode.*	//Access to the Node-RED node instance
	RED.run();
} else {
	console.error('Error loading Node-RED node!');
}
```

One can then invoke the node from command-line, passing the node type first, and then some optional node properties in JSON format:

```sh
node ./index.js node-type --firstProperty='{"Some":"JSON"}' --secondProperty='"Some text"' --thirdProperty='123'
```

Properties of configuration nodes can be specified using a *dot* such as:

```sh
node ./index.js node-type --server.url='"https://example.net/"' --server.username='"Alice"'
```

### Example

Replace `test.js` by the name of your entry file (e.g. `index.js`), and `test-node` by the name of the type of your node.

```sh
printf '{"payload":3} \n {"payload":7}' | node ./test.js test-node --multiplyBy='5'
```

Outputs:

```json
{"payload":15}
{"payload":35}
```

### JSON in Node-RED format

The command expects JSON messages with a Node-RED structure `{"payload":"Example"}` from standard input, one line per message.

[`jq`](https://stedolan.github.io/jq/) may be used to break down and format a standard payload into a Node-RED payload:

For instance if the input is a list of observations wrapped into a JSON array:

```sh
jq -c '.[] | {"payload":.}'
```

The command outputs JSON messages with a Node-RED structure to standard output, one line per message.

See some examples of inputs and outputs in [*node-red-contrib-json-multi-schema*](https://github.com/alexandrainst/node-red-contrib-json-multi-schema#wiringpiping-all-modules-together).

### Standard outputs

Only the Node-RED JSON payload is emitted on standard-output (STDOUT), while all other messages and errors are on the standard-error (STDERR).


### Advanced usage

It is possible to catch the node events { `debug`, `error`, `log` } to override the default behaviour (which is to write to standard-error):

```js
noderedNode.on('debug', msg => console.warn('Caught event: ' + msg));
```


## Limitations

This module does not have the ambition of exposing the full Node-RED functionality, but instead focuses on simple cases, providing a tiny and efficient layer without any dependency.
So for more advanced unit testing, and if requiring the full Node-RED is fine, then check the official [node-red-node-test-helper](https://github.com/node-red/node-red-node-test-helper) instead of this module.
