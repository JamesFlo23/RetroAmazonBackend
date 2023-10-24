import express from 'express';
import debug from 'debug';
const debugBook = debug('app:Book');
import {connect,ping,getBooks,getBookById,updateBook,addBook,deleteBook} from '../../database.js';
import Joi from 'joi';
import { validBody } from '../../middleware/validBody.js';
import { validId } from '../../middleware/validId.js';

const router = express.Router();

const newBookSchema = Joi.object({
  isbn:Joi.string().trim().min(14).required(),
  title:Joi.string().trim().min(1).required(),
  author:Joi.string().trim().min(1).required(),
  genre:Joi.string().valid('Fiction', 'Magical Realism', 'Dystopian', 'Mystery', 'Young Adult', 'Non-Fiction').required(),
  publication_year:Joi.number().integer().min(1900).max(2023).required(),
  price:Joi.number().min(0).required(),
  description:Joi.string().trim().min(1).required(),
});

const updateBookSchema = Joi.object({
  isbn:Joi.string().trim().min(14),
  title:Joi.string().trim().min(1),
  author:Joi.string().trim().min(1),
  genre:Joi.string().valid('Fiction', 'Magical Realism', 'Dystopian', 'Mystery', 'Young Adult', 'Non-Fiction'),
  publication_year:Joi.number().integer().min(1900).max(2023),
  price:Joi.number().min(0),
  description:Joi.string().trim().min(1),
});

router.get('/list', async (req, res) => {
  //req.query
  //a query string is a part of the URL that starts with a ?


  debugBook(`Getting all books, the query string is ${JSON.stringify(req.query)}`);
  let {keywords,minPrice,maxPrice,genre,sortBy,pageSize,pageNumber} = req.query;
  const match =  {};  //match stage of the aggregation pipeline is the filter similar to the where clause in SQL
  let sort = {author:1};  //default sort stage  will sort by author ascending

  try{
    // const db = await connect();
    // const books = await getBooks();
    // res.status(200).json(books);

    if(keywords){
      match.$text = {$search: keywords};
    }

    if(genre){
      match.genre = {$eq:genre};
    }

    if(minPrice && maxPrice){
      match.price = {$gte: parseFloat(minPrice),$lte: parseFloat(maxPrice)};
    }else if(minPrice){
      match.price = {$gte: parseFloat(minPrice)};
    }else if(maxPrice){
      match.price = {$lte: parseFloat(maxPrice)};      
    }
    switch(sortBy){
      case "price": sort = {price : 1}; break;
      case  "year": sort = {publication_date : 1}; break; //switch datatype to just a year instead of a date
    }

    debugBook(`Sort is ${JSON.stringify(sort)}`);

    pageNumber = parseInt(pageNumber) || 1;
    pageSize = parseIt(pageSize) || 100;
      const skip = (pageNumber - 1) * pageSize;
      const limit = pageSize;

    const pipeline = [
      {$match: match},
      {$sort: sort},
      {$skip: skip},
      {$limit: limit}
      
    ];
    const db = await connect();
    const cursor = await db.collection('Book').aggregate(pipeline);
    const books = await cursor.toArray();
    res.status(200).json(books);

  }catch(err){
    res.status(500).json({error:err.stack})
  }
});
//get a book by the id
router.get('/:id',validId('id'),async (req, res) => {
  const id = req.params.id;
  try{
    const book = await getBookById(id);
    res.status(200).json(book);
  }catch(err){
    res.status(500).json({error:err.stack});
  }
});
//add a new book to the array
router.post('/add',validBody(newBookSchema), async (req, res) => {
  const newBook = req.body;
  try{
    const dbResult = await addBook(newBook);
  if(dbResult.acknowledged == true){
    res.status(200).json({message: `Book ${newBook.title} added with an id of ${dbResult.insertedId}`});
  }else{
    res.status(400).json({message: `Book ${newBook.title} not added`});
  }
}catch(err){
  res.status(500).json({error:err.stack});
}
});
//update a book by the id -- update can use a put or a post
router.put('/update/:id',validId('id'),validBody(updateBookSchema), async (req, res) =>{
  const id = req.params.id;
  const updatedBook = req.body;
try{
  const updatedResult = await updateBook(id,updatedBook);
  debugBook(updatedResult);
  if(updatedResult.modifiedCount == 1){
    res.status(200).json({message:`Book ${id} updated`});
  }else{
    res.status(400).json({message:`Book ${id} not updated`});
  }
}catch(err){
  res.status(500).json({error:err.stack});
}
  
});

//delete book from array
router.delete('/delete/:id',validId('id'),async (req, res) => {
  //gets id from url
  const id = req.params.id;
  const dbResult = await deleteBook(id);
  try{
    if(dbResult.deletedCount ==1){
      res.status(200).json({message: `Book ${id} deleted`});
    }else{
      res.status(400).json({message: `Book ${id} not deleted`});
    }
  }
  catch(err){
    res.status(500).json({error: err.stack});
  }
});

export {router as BookRouter};