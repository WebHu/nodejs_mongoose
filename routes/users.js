var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var UserModel = require("./../model/userSchema");
//创建entity，相当于mongodb的document，即行
//var UserInfo=new UserModel({name:"zhangsan"});

require('../db/dbconnect');

/* post users . */
router.get('/', function (req, res, next) {

        var sum;
        UserModel.count({}, function (err, count) {
            sum = count;
        });
        UserModel.find({}, function (err, docs) {
            if(err){
                res.send(err);
            }else{
                try{
                    //组装数据转为json
                    var j="{\"count\": "+sum+",\"data\":"+JSON.stringify(docs)+"}";
                    res.send(JSON.parse(j));

                }catch (err){
                    res.locals.message = err.message;
                    res.locals.error = err;
                    // render the error page
                    res.status(err.status || 500);
                    res.render('error');

                }
            }
        });
        res.end;

});
//新增
router.get('/create/:name/:age', function (req, res, next) {
    console.log("create....")

    try {
        var name = req.params.name;
        var age = req.params.age;

        UserModel.create({name: name, age: age}, function (err, node, numAffected) {
            if (err) {
                res.send({'success': false, 'err': err});
            } else {
                //node返回新增的对象信息
                console.log("save: " + node);
                res.redirect('/users');
            }
        });
    }catch (err){
        console.error(err);
        res.locals.message = err.message;
        res.locals.error = err;
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
     res.end;
});

//删除
router.get('/delete/:name', function (req, res, next) {

    UserModel.remove({name: req.params.name}, function (err, node) {
        if (err) {
            res.send({'success': false, 'err': err});
        } else {
            console.log("delete: " + node);
            res.redirect('/users');
        }
    });

});
//修改
router.get('/update/:name/:name1', function (req, res, next) {

    var query = {name: req.params.name};
    UserModel.update(query, {name: req.params.name1}, function (err, node) {

        try {
            if (err) {
                res.send({'success': false, 'err': err});
            } else {
                console.log("update: " + node.toString());
                res.redirect('/users');
            }
        } catch (err) {
            console.error(err);
            res.locals.message = err.message;
            res.locals.error = err;
            // render the error page
            res.status(err.status || 500);
            res.render('error');
        }
    });

});


module.exports = router;
