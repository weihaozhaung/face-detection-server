const express = require('express');
const cors = require("cors");
const knex = require('knex');
const bcrypt = require("bcrypt-nodejs");



const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'weihaozhuang',
    database : 'smartbrain'
  }
});


db.select('*').from('users').then(data=>{console.log(data);});


/*const database = {
	users:[
	{
		"id":"123",
		"name":"John",
		"email": "john@gmail.com",
		"password":"cookies",
		"entries":0,
		"joined":  new Date()
	},{
		"id":"124",
		"name":"Sally",
		"email": "sally@gmail.com",
		"password":"banana",
		"entries":0,
		"joined":  new Date()
	}

	]
}*/

const app = express();

app.use(express.json());
app.use(cors());

app.get('/',(req,res)=>{
	res.send(database.users);
})

app.get('/profile/:id',(req,res)=>{
	
	const {id} = req.params;
	//let found = false;
	db.select('*').from('users').where({
		id: id
	}).then(user=>{
		if(user.length){
		res.json(user);
	}else{
		res.status(400).json('User not found.')
		}
	})

	/*database.users.forEach(user =>{
		if(user.id ===id){
			found = true;
			return res.json(user);
		}
	})*/
	/*if(!found){
		res.status(400).json('not found');
	}*/
})

app.post('/signin',(req,res)=>{
	db.select("email",'hash').from('login')
	.where("email","=",req.body.email)
	.then(data =>{
		const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
		if(isValid){
			return db.select('*').from('users')
			.where('email','=',req.body.email)
			.then(user=>{
				console.log(user[0])
				res.json(user[0])
			})
			.catch(err => res.status.json('unable to get user'))
		}else{
			res.status(400).json('wrong credentials')
		}
	})
	.catch(err => res.status(400).json('wrong credentials'))

	/*if(req.body.email === database.users[0].email &&
		req.body.password === database.users[0].password 
		){
		res.json('success');
	}else{
		res.status(400).json("error logging in");
	}*/
})

app.post('/register',(req,res)=>{
	const {email, name, password} = req.body;
	if(!email||!password||!name){
		return res.status(400).json('invalid submission')
	}



	const hash = bcrypt.hashSync(password);
	db.transaction(trx =>{
		trx.insert({
			hash:hash,
			email:email
		})
		.into('login')
		.returning('email')
		.then(loginEmail =>{
				return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
				.then(user =>{
				res.json(user[0]);
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('unable to register, please double-check the information'))
		
/*	database.users.push({
		"id":"125",
		"name":name,
		"email": email,
		"password":password,
		"entries":0,
		"joined":  new Date()
	})*/
})



app.listen(3001, ()=>{
	console.log('app is running on port 3001.');
})


app.put('/image',(req,res)=>{
	const {id} = req.body;
	//let found = false;
	/*database.users.forEach(user =>{
		if(user.id === id){
			found = true;
			user.entries++
			return res.json(user.entries);
		}
	})*/

	db('users').where('id', '=', id)
  .increment('entries', 1).returning('entries')
  .then(entries =>{
  	res.json(entries);
  })
  .catch(err => res.status(400).json('unable to get entries'))
/*	if(!found){
		res.status(400).json('not found');
	}*/
})
/*
/ -->res = this is working
/signin -->post = success/fail
/register --> post = user
/profile/:userId --> GET = user
/image --> PUT -->user
*/