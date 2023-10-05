import express from 'express';
import debug from 'debug';
const debugUser = debug('app:User');
debugUser.color = '63';
import {getUsers,addUser,loginUser} from '../../database.js';
const router = express.Router();
import bcrypt from 'bcrypt';
import {validBody} from '../../middleware/validBody.js'
import Joi from 'joi';

//step 1: define new user schema
const newUserSchema = Joi.object({
  fullName:Joi.string().trim().min(1).max(50).required(),
  password:Joi.string().trim().min(8).max(50).required(),
  email:Joi.string().trim().email().required()
});
//step 2
const loginUserSchema = Joi.object({
  email:Joi.string().trim().email().required(),
  password:Joi.string().trim().min(8).max(50).required()
});

router.get('/list', async (req,res) => {
  debugUser('Getting all users');
  try{
    const users = await getUsers();
    res.status(200).json(users);
  }catch(err){
    res.status(500).json({error:err.stack})
  }
});

router.post('/add',validBody(newUserSchema), async (req,res) =>{
  const newUser = req.body;
  newUser.password = await bcrypt.hash(newUser.password, 10);//this just hashes the new password
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
