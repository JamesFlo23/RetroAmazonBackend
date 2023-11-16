import express from 'express';
import { BookRouter } from './routes/api/book.js';
import { UserRouter } from './routes/api/user.js';
import * as dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
//import {connect} from './database.js';
//import * as dbModule from './database.js';

//create a debug channel called app:Server
import debug from 'debug';
const debugServer = debug('app:Server');
import cookieParser from 'cookie-parser';
import { authMiddleware } from '@merlin4/express-auth';

const app = express();
app.use(express.static('public'));
app.use(express.json()); //accepts json data in the body of the request from the client. This and cors() must come before the routes
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
})); 
app.use(cookieParser());
app.use(authMiddleware(process.env.JWT_SECRET,'authToken',{
  httpOnly:true,
  maxAge:1000*60*60
}));
//middleware
app.use(express.urlencoded({extended: true}));
app.use('/api/book', BookRouter);
app.use('/api/user',UserRouter);

//error handling middleware
app.use((req,res) =>{
  res.status(404).json({error:`Sorry couldn't find ${req.originalUrl}`});
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
