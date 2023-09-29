import express from 'express';
import debug from 'debug';
const debugBook = debug('app:Book');
import { connect, getBooks,getBookById,updateBook,addBook,deleteBook} from '../../database.js';

const router = express.Router();
const books = [
  {"title":"Country Bears, The","author":"Vince Glader","publication_date":"10/25/1907","genre":"mystery","_id":1},
  {"title":"Secret Things (Choses secrètes)","author":"Betteanne Copley","publication_date":"8/28/1978","genre":"non-fiction","_id":2},
  {"title":"Fitna","author":"Heall Markham","publication_date":"5/31/1936","genre":"non-fiction","_id":3},
  {"title":"Words, The","author":"Kelly Benech","publication_date":"11/9/1958","genre":"non-fiction","_id":4},
  {"title":"Muppet Christmas: Letters to Santa, A","author":"Natala Amar","publication_date":"1/18/1914","genre":"non-fiction","_id":5}
]
//get all books
router.get('/list', async (req, res) => {
  debugBook('Getting all books');
  try{
    const db = await connect();
    const books = await getBooks();
    res.status(200).json(books);
  }catch(err){
    res.status(500).json({error:err.stack})
  }
});

//get a book by the id
router.get('/book/:id',async (req, res) => {
  const id = req.params.id;
  try{
    const book = await getBookById();
    res.status(200).json(book);
  }catch(err){
    res.status(500).json({error:err.stack});
  }
});

//delete book from array
router.delete('/delete/:id',async (req, res) => {
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

//add a new book to the array
router.post('/books/add', async (req, res) => {
  const newBook = req.body;
  const dbResult = await addBook(newBook);
  try{
  if(dbResult.acknowledge == true){
    res.status(200).json({message: `Book ${newBook.title} added with an id of ${dbResult.insertedId}`});
  }else{
    res.status(400).json({message: `Book ${newBook.title} not added`});
  }
}catch(err){
  res.status(500).json({error:err.stack});
}
});

//update a book by the id -- update can use a put or a post
router.put('/update/:id', async (req, res) =>{
  const id = req.params.id;
  const updatedBook = req.body;
try{
  const updatedResult = await updateBook(id,updatedBook);
  if(updatedResult.modifiedCount == 1){
    res.status(200).json({message:`Book ${id} updated`});
  }else{
    res.status(400).json({message:`Book ${id} not updated`});
  }
}catch(err){
  res.status(500).json({error:err.stack});
}
  
});


export {router as BookRouter};