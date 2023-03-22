import {urlencoded} from "express";

const express = require('express');
const app = express();
const userRoute = require('./presentation/routers/user-router')
const methodOverride = require('method-override');


app.use(urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use('/users', userRoute);

app.listen(3000, () => {
    console.log('listening...')
});

