require('dotenv').config();

//adding imgs to private and main pages
process.env.PWD = process.cwd();

const app = require('./app');
const mongoose = require('mongoose');

const PORT = parseInt(process.env.PORT, 10);
const URI = process.env.MONGODB_URI;

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.set('port', PORT);
    const server = app.listen(PORT);

    server.on('error', (error) => {
      const { syscall, port, code } = error;
      if (syscall === 'listen' && code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
      } else {
        console.error('There was an unknown error.');
        console.log(error);
        throw error;
      }
    });
    server.on('listening', () => {
      console.log(`Node server listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`There was an error connecting the database to URI "${URI}"`);
    console.log(error);
  });
