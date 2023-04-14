const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ardasumbul:Abcd1234.@todoserver.dni6qru.mongodb.net/todoDB',{useNewUrlParser:true});

const app = express();

var items = [];

const todoSchema = new mongoose.Schema({
    todo: {
        type: String
    }
})

const listSchema = new mongoose.Schema({
    name: String,
    elements: [todoSchema]
})

const Todo = mongoose.model('Todo', todoSchema);
const List = mongoose.model('List', listSchema);


async function deleteOne(id){
    await Todo.deleteOne({_id: id });
}



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    let items = await Todo.find({});
    res.render("list", {listTitle: "Today", new_items: items});


});

app.post("/", async function(req,res){
    const new_item = req.body.todo;
    const listName = req.body.list; 
    let new_todo = new Todo({todo:new_item});

    if(listName === "Today"){
        new_todo.save();
        items.push(new_todo);
        res.redirect("/");
    }
    else{
        let found_list = await List.findOne({name: listName})
        found_list.elements.push(new_todo);
        found_list.save();
        res.redirect("/"+listName);
    }

})

app.post("/delete",async function(req,res){
    const checked_item_id = req.body.checkbox;
    const listName = req.body.listName;

    await List.deleteMany({name:"favicon.ico"});
    if (listName === "Today"){
        deleteOne(checked_item_id);
        res.redirect("/");
    }
    else{
        await List.findOneAndUpdate({name:listName},{$pull:{elements:{_id:checked_item_id}}});
        res.redirect("/"+listName);
    }

})

app.get("/:customListName", async function(req,res){
    let customListName = req.params.customListName;
    let list_valid = await List.findOne({name:customListName});

    await List.deleteOne({name:"favicon.ico"});

    if(list_valid === null){

        let new_list = new List({
            name: customListName,
            elements: []
        })
        new_list.save();
        res.redirect("/"+customListName);
    }
    else{
        res.render("list", {listTitle: customListName, new_items: list_valid.elements});
    } 

})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function () {
    console.log("Server has started");    
});
