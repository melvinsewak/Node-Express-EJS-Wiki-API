const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect('mongodb://localhost:27017/wikiDB');

const articleSchema = mongoose.Schema({
    title: String,
    content: String
});

const ArticleModel = mongoose.model('Article', articleSchema);

//This affects routing for accessing 
app.route('/articles')
.get(function(req, res){
    ArticleModel.find({}, function(err, articlesInDB){
        if(err){
            res.send(err);
        }
        else if(articlesInDB && articlesInDB.length > 0){
            res.send(articlesInDB);
        }
        else{
            res.send('There are no articles.');
        }
    });
})
.post(function(req, res){
    const article = new ArticleModel({
        title: req.body.title,
        content: req.body.content
    });

    article.save(function(err, articleInDB){
        if(err){
            res.send(err);
        }
        else{
            res.send('Sucessfully added the article.' + JSON.stringify(articleInDB));
        }
    });
})
.delete(function(req, res){
    ArticleModel.deleteMany({}, function(err){
        if(err){
            res.send(err);
        }
        else{
            res.send("Successfully deleted all the articles.");
        }
    });
});

app.route('/articles/:articleTitle')
.get(function(req,res){
    ArticleModel.findOne({title: req.params.articleTitle}, function(err, article){
        
        if(err){
            res.send(err);
        }
        else if(article){
            res.send(article);
        }
        else{
            res.send('Article not found');
        }
    });
})
.put(function(req,res){
    console.log(req.body);
    ArticleModel.findOneAndUpdate(
        {title: req.params.articleTitle},
        req.body, //document will be updated as per schema of the model. Othe properties are ignored.
        {overwrite: true}, 
        function(err){
            if(err){
                console.log('error', err);
                res.send(err);
            }
            else{
                res.send('sucessfully replaced the article.');
            }
        }
    );
})
.patch(function(req,res){
    ArticleModel.findOneAndUpdate(
        {title: req.params.articleTitle}, 
        req.body, //document will be updated as per schema of the model. Othe properties are ignored.
        null,
        function(err){
            if(err){
                console.log('error', err);
                res.send(err);
            }
            else{
                res.send('sucessfully updated the article.');
            }
        });
})
.delete(function(req,res){
    ArticleModel.deleteOne({title: req.params.articleTitle}, function(err){
        if(err){
            res.send(err);
        }
        else{
            res.send('Article was deleted successfully');
        }
    });
});


const port = process.env.PORT || 3000;
app.listen(port, function(){
   console.log(`server is running on port ${port}`); 
});
