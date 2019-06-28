const express = require ('express');
const expressLayouts = require ('express-ejs-layouts');
const app = express();
const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI;
mongoose.connect(db,{useNewUrlParser:true}).
then(()=>console.log('wow')).catch(err => {console.log(err)})
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.urlencoded({extended:false}));
//routes
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));

const port = process.env.PORT || 5000;
app.listen(port, console.log('listen on',port));