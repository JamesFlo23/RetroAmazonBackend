import express from 'express';
import debug from 'debug';
const debugUser = debug('app:User');
debugUser.color = '63';
import {addUser,loginUser} from '../../database.js';
const router = express.Router();
import bcrypt from 'bcrypt';

router.get('/list', (req,res) => {
  debugUser('Getting all users');
  res.send('Hello from amazon.com user route.');
});

router.post('/add',async (req,res) =>{
  const newUser = req.body;
  newUser.password = await bcrypt.hash(newUser.password, 10);
  try{
    const result = await addUser(newUser);
    res.status(200).json({message: `User ${result.insertedId} added`});
  }catch(err){
    res.status(400).json({error: err.stack});
  }
});

router.post('/login',async (req,res) =>{
  const user = req.body;
  const resultUser = await loginUser(user);
  debugUser(resultUser);
  if(resultUser && await bcrypt.compare(user.password, resultUser.password)){
    res.status(200).json(`Welcome ${resultUser.fullName}`);
  }else{
    res.status(400).json({error: resultUser})
  }
});

export {router as UserRouter};
