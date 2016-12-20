"use strict"
const net = require('net');
const stdin = process.openStdin();

const connectionOptions = {
  host: 'localhost',
  port: 0
};

let client;

console.log('Enter port to connect:');

const stdinDataListenerNotConnected = (data) => {
  const port = data.toString().trim();

  if (port < 0 || port > 65535) {
    console.log('Error: port should be >= 0 and < 65536');
    console.log('Enter port to connect again:');
    return;
  }

  connectionOptions.port = parseInt(port);

  client = net.connect(connectionOptions, () => {
    console.log('connected to server!');
    stdin.removeListener('data', stdinDataListenerNotConnected);
    stdin.addListener('data', stdinDataListenerConnected);
    client.write('Hello world!\r\n');
  });

  client.on('data', (data) => {
    console.log('Server: ' + data.toString());
  });

  client.on('error', (error) => {
    console.log('Error: ' + error.message);
    console.log('Enter adress of server: ');
  });

  client.on('end', () => {
    console.log('disconnected from server');
    stdin.removeListener('data', stdinDataListenerConnected);
    stdin.addListener('data', stdinDataListenerNotConnected);
    console.log('Enter adress of server: ');
  });
}

stdin.addListener('data', stdinDataListenerNotConnected);

const stdinDataListenerConnected = (data) => {
  const str = data.toString().trim();
  console.log('You entered: ' + str);
  if (str === 'q') {
    client.end();
  } else if (str === 'help') {
    console.log('cats - show all cats from the server\n\n' +
                'size - show size of json object on server\n\n' +
                'clients - show all clients connected to the server\n\n' +
                'findcatby [attribute] [value] - find cat by given value of attribute\n\n' +
                'q - close connection');
  } else {
    client.write(str);
  }
}
