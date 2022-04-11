
//requires
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://********:***********@cluster0.bsdqp.mongodb.net/todolistDB");

//Mongoose schemas and collections initialize
const itemSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);
const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];



//GET methods

app.get("/", function(req, res) {

  Item.find({},function(err,found)
  {
    if(found.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }
        else{
          console.log("items added successfully");
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: found});
    }
    
  });



});

app.get("/:customListName",function(req,res){

  const route = _.capitalize(req.params.customListName);
  
  List.findOne({name: route},function(err,results){
    if(err){console.log(err);}
    
    else{
      if(!results)
      {
        const list = new List({
          name: route,
          items: defaultItems 
        });
        list.save();
        res.redirect("/"+route);
      }
      else{
        res.render("list",{listTitle: results.name,newListItems: results.items});
      }
    }
  });

  
  
})

//POST methods

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName},function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today")
  {
    Item.findByIdAndRemove(id,function(err){
      if(err){console.log(err);}
      else{console.log("success");}
    })
    res.redirect("/")
  } 
  else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: id}}},function(err,results){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});


//Server listen
let port = process.env.PORT;
if(port == null || port =="")
{
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on successfully");
});
