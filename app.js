var express = require("express");
var bodyParser = require('body-parser');
let ejs = require('ejs');
const mongoose = require('mongoose');
var _ = require('lodash');

let app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect('mongodb+srv://test-fay:OHzowu9cxIYoKbzn@cluster0.vw6bmxx.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,

    items: [itemsSchema]
});


const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);


const item1 = new Item({
    name: " eat lunch "
});

const item2 = new Item({
    name: " eat dinner "
});

const item3 = new Item({
    name: " eat breakfast "
});

let defualtArray = [item1 , item2 , item3];


let today = new Date();

const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

let day = today.toLocaleDateString('en-GB', options);
 




app.get("/" , function(req ,res){
   


    Item.find({})
    .then(items => {

    if(items.length==0){
     
Item.insertMany(defualtArray)
.then(function () {
    console.log("Successfully saved defult items to DB");
  })
.catch(function (err) {
    console.log(err);
  });
 res.redirect("/");
    }else{
// Do something with the retrieved items
res.render('list', {listTitle:day , listItems:items} );
    }
        

     

      })
      .catch(err => {
        console.error(err);
        // Handle the error accordingly
      });

   
})

app.get('/:list', (req, res) => {
const listName =_.capitalize(req.params.list); 

List.findOne({name: listName }).then( listNameFound => {
    if(listNameFound){
        
    res.render('list', {listTitle: listName , listItems: listNameFound.items} );
    }
    if(!listNameFound){
        const list = new List({
            name: listName ,
            items: defualtArray
        });
    
        list.save();
        res.redirect("/"+listName);
    }
}) .catch(err => {
    console.error('Error:', err);
  });
 

})

app.post("/" , function(req,res){
    let item_ = req.body.ListItem ;
    let Title = req.body.listTitle;
     

    const item = new Item({
        name: item_
    });

    if(Title == day){
        item.save();

        res.redirect("/");
    }else{
        List.findOne({name: Title }).then( listNameFound => {
            if(listNameFound){
                listNameFound.items.push(item);
                listNameFound.save();
                res.redirect("/"+Title);
            }
            
        }) .catch(err => {
            console.error('Error:', err);
          });
    }


  


})

app.post("/delete" , function(req,res){
    let checkedItem = req.body.checkbox ; 
    let listName = req.body.listName

    if(listName===day){
    Item.findByIdAndRemove(checkedItem)
    .then(deletedItem => {
      if (deletedItem) {
        console.log('Deleted Item:', deletedItem);
      } else {
        console.log('No item found with the given ID');
      }
    })
    .catch(err => {
      console.error('Error:', err);
    });

       res.redirect("/");
}else{
    List.findOneAndUpdate({name: listName} , {$pull: { items:{ _id: checkedItem}}})
    .then(
          console.log('item deleted')
      ).catch(err => {
        console.error('Error:', err);
      });

      res.redirect("/"+listName);
}
});


app.listen(3000 , function(){
    console.log("server running on port 3000")
})

