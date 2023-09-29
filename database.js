import { MongoClient, ObjectId } from "mongodb";
import debug from "debug";
const debugDatabase = debug("app:Database");

let _db = null;

async function connect(){
  if(!_db){
    const connectionString = "mongodb+srv://jamesflorez2323:Sococo123@cluster0.5nw9kra.mongodb.net/?retryWrites=true&w=majority";
    const dbName = "RetroAmazon";
    const client = await MongoClient.connect(connectionString);
    _db = client.db(dbName);
  }
  return _db;
}

async function ping(){
  const db = await connect();
  await db.command({ping: 1});
  debugDatabase("Pinged your deployment!");
}

async function getBooks(){
  const db = await connect();
  //MongoSH command to find all books: db.books.find({})
  //find() returns a cursor, which is not the data itself, but a pointer to the result set of a query
  const books = await db.collection("Book").find().toArray();
  return books;
}

async function getBookById(id){
  const db = await connect();
  const book = await db.collection("Book").findOne({_id: new ObjectId(id)});
  return book;
}

async function addBook(){
  const db = await connect();
  const result = await db.collection("Book").insertOne(book);
  debugDatabase(result.insertedId);
  return result;
}

async function updateBook(id,updatedBook){
  const db = await connect();
  const result = await db.collection("Book").updateOne({_id:new ObjectId(id)},{$set:{...updatedBook}});
  console.table(result);
  return result;
}

async function deleteBook(id){
  const db = await connect();
  const result = await db.collection("Book").deleteOne({_id:new ObjectId(id)});
  return result;
}

async function addUser(user){
  const db = await connect();
  user.role = ['customer'];
  const result = await db.collection("User").insertOne(user);
  return result;
}

ping();

export {connect,ping,getBooks,getBookById,addBook,updateBook,deleteBook,addUser}