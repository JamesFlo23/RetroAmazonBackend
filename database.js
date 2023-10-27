import * as dotenv from 'dotenv';
dotenv.config();
import { MongoClient, ObjectId } from "mongodb";
import debug from "debug";
const debugDatabase = debug("app:Database");

//const newId = (str) => new ObjectId(str);
let _db = null;

const newId = (str) => new ObjectId(str);

async function connect(){
  if(!_db){
    const connectionString = process.env.DB_URL;
    const dbName = process.env.DB_NAME;
    const client = await MongoClient.connect(connectionString);
    _db = client.db(dbName);
    debugDatabase('Connected.')
  }
  return _db;
}

async function ping(){
  const db = await connect();
  await db.command({ping: 1});
  debugDatabase("Ping.");
}

//Book
async function getBooks(){
  const db = await connect();
  //MongoSH command to find all books: db.books.find({})
  //find() returns a cursor, which is not the data itself, but a pointer to the result set of a query
  const books = await db.collection("Book").find().toArray();
  debugDatabase("Got books");
  return books;
}
async function getBookById(id){
  const db = await connect();
  const book = await db.collection("Book").findOne({_id: new ObjectId(id)});
  debugDatabase("Got book by id");
  return book;
}
async function addBook(book){
  const db = await connect();
  const result = await db.collection("Book").insertOne(book);
  debugDatabase(result.insertedId);
  return result;
}
async function updateBook(id,updatedBook){
  const db = await connect();
  const result = await db.collection("Book").updateOne({_id:new ObjectId(id)},{$set:{...updatedBook}});
  console.table(result);
  debugDatabase("Book updated");
  return result;
}
async function deleteBook(id){
  const db = await connect();
  const result = await db.collection("Book").deleteOne({_id:new ObjectId(id)});
  debugDatabase("Book deleted");
  return result;
}
//User
async function getUsers(){
  const db = await connect();
  //MongoSH command to find all books: db.books.find({})
  //find() returns a cursor, which is not the data itself, but a pointer to the result set of a query
  const users = await db.collection("User").find().toArray();
  debugDatabase("Got users");
  return users;
}
async function addUser(user){
  const db = await connect();
  user.role = ['customer'];
  const result = await db.collection("User").insertOne(user);
  debugDatabase("New user added.")
  return result;
}
async function loginUser(user){
  const db = await connect();
  const resultUser = await db.collection("User").findOne({email:user.email});
  if(resultUser){
    if(resultUser.password == user.password){
      return resultUser;
    }else{
      return 'email or password incorrect';
    }
  }else{
    return 'email or password incorrect';
  }
}

ping();

export {connect,ping,getBooks,getBookById,addBook,updateBook,deleteBook,getUsers,addUser,loginUser,newId}