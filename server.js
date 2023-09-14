import express from 'express';
import { BookRouter } from './routes/api/book.js';
import * as dotenv from 'dotenv';
dotenv.config();

//creat adebug channel called app:Server
import debug from 'debug';
const debugServer = debug('app:Server');

const app = express();

  //middleware
//allow form data
app.use(express.urlencoded({extended: true}));
app.use('/api/books', BookRouter);

//error handling middleware
app.use((req,res) =>{
  res.status(404).json({error:`Sorry coudn't find ${req.originalUrl}`});
});

//handle server exceptions to keep server from crashing
app.use((err,req,res,next) =>{
  debugServer(err.stack);
  res.status(500).json({error: err.stack});
});

//default route
app.get('/',(req, res) => {
  res.send('Hello World! from amazon');
  debugServer('Hello from the upgraded console.log()')
});


//listen on port
const port = 3003;
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`)
});
