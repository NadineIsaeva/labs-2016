'use strict'
const net = require('net');
const fs = require('fs-extra');
const cats = fs.readJsonSync('./cats.json');
const clients = []

const server = net.createServer((connection) => {
  console.log('client %s:%s connected', connection.remoteAddress,
    connection.remotePort);
  clients.push(connection);

  connection.on('data', (data) => { //обрабатываем запрос из консоли
    const req = String(data).split(' ');

    if (req.length === 1) {
      switch (req[0]) {
        case 'cats':
          connection.write(JSON.stringify(cats['cats'], null, 4));
          console.log(JSON.stringify(cats['cats'], null, 4));
          break;
        case 'size':
          connection.write(cats['cats'].length.toString());
          console.log(cats['cats'].length.toString());
          break;
        case 'clients':
          clients.forEach((client, i, arr) => {
            connection.write(`client #${i}: ${client.remoteAddress}:
              ${client.remotePort}`);
            console.log(`client #${i}: ${client.remoteAddress}:
              ${client.remotePort}`);
          });
          break;
        default:
          connection.write('There is no such command.');
          console.log('There is no such command.');
      }
    }
    if (req.length === 3){
      if (req[0] === 'findcatby'){
        let value;
        const filter = req[1];

        if (filter === 'age' || filter === 'weight') {
          value = parseInt(req[2]);
        } else {
          value = req[2];
        }

        const result = [];
        for (let i = 0; i < cats['cats'].length; ++i) {
          if (cats['cats'][i][filter] === value) {
            result.push(cats['cats'][i]);
          }
        }
        if (result.length === 0) {
          connection.write('There is no cat with such parametrs');
          console.log('There is no cat with such parametrs');
        } else {
          result.forEach((cat, i ,arr) => {
            connection.write(JSON.stringify(cat, null, 4));
            console.log(JSON.stringify(cat, null, 4));
          });
        }
      } else {
         connection.write('There is no such command.');
         console.log('There is no such command.');
      }
    }
    console.log(req);
  });

  connection.on('end', () => {
    const index = clients.indexOf(connection);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    console.log('client disconnected');
  });

  connection.write('Hello World!\r\n');

  connection.pipe(connection);
});

server.listen(8081, function() {
  console.log('server is listening on port 8081');
});
