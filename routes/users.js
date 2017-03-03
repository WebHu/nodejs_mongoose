/**
 * fileName:users.js
 * author:gamehu
 * date:2017/3/3 13:55
 * desc:根据http请求，处理CRUD操作
*/
var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
//注：post请求获取参数需要
var bodyParser = require("body-parser");

var UserModel = require("./../model/userSchema");
//创建entity，相当于mongodb的document，即行
//var UserInfo=new UserModel({name:"zhangsan"});

//require('../db/dbconnect');
//任意请求方式，且是完整匹配
/*router.all('/add/:name/:age', function (req, res, next) {
 console.log("all...")
 checkIfOption(req, res, next);
 });*/
//put 请求
router.put('/add/:name/:age', function (req, res, next) {
    add(req, res, next);
});
/* post users . */
router.get('/', function (req, res, next) {

    var sum;
    UserModel.count({}, function (err, count) {
        sum = count;
    });
    UserModel.find({}, function (err, docs) {
        if (err) {
            res.send(err);
        } else {
            try {
                //组装数据转为json
                var j = "{\"count\": " + sum + ",\"data\":" + JSON.stringify(docs) + "}";
                res.send(JSON.parse(j));
                res.end();
            } catch (err) {
                res.locals.message = err.message;
                res.locals.error = err;
                // render the error page
                res.status(err.status || 500);
                res.render('error');

            }
        }
    });


});
//设置响应内容
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

//获取某一个document
router.get('/findOne/:name', function (req, res, next) {
    var uName = req.params.name;
    if (!uName) {
        sendJSONresponse(res, 404, {
            "message": "Not found, bookid is required"
        });
        return;
    }
    //如果有相同的则返回第一个
    UserModel.findOne({name: uName}, function (err, user) {
        if (!user) {
            sendJSONresponse(res, 404, {
                "message": "bookid not found"
            });
            return;
        } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
        }
        console.log(user);
        sendJSONresponse(res, 200, user);
    });

});
//根据name查询
router.post('/findByName/:name', function (req, res, next) {
    var uName = req.params.name;
    if (!uName) {
        sendJSONresponse(res, 404, {
            "message": "Not found, bookid is required"
        });
        return;
    }
    //如果有相同的则返回第一个
    UserModel.find({name: uName}, function (err, user) {
        if (!user) {
            sendJSONresponse(res, 404, {
                "message": "bookid not found"
            });
            return;
        } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
        }
        console.log(user);
        sendJSONresponse(res, 200, user);
    });

});
//router.use(bodyParser.urlencoded({extended: true}));
var jsonParser = bodyParser.json();
//var urlencoded= bodyParser.urlencoded({extended: false});
//post表单提交形式的参数
router.post('/findByName',jsonParser, function (req, res, next) {
    var uName = req.body.name;
    if (!uName) {
        sendJSONresponse(res, 404, {
            "message": "Not found, bookid is required"
        });
        return;
    }
    //如果有相同的则返回第一个
    UserModel.find({name: uName}, function (err, user) {
        if (!user) {
            sendJSONresponse(res, 404, {
                "message": "bookid not found"
            });
            return;
        } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
        }
        sendJSONresponse(res, 200, user);
    });

});


//复杂请求的处理，比如put请求
function checkIfOption(req, res, next) {
    console.log(req.method);
    if (req.method === 'OPTIONS') {
        console.log('!OPTIONS');
        var headers = {};
        // IE8 does not allow domains to be specified, just the *
        // headers["Access-Control-Allow-Origin"] = req.headers.origin;
        headers["Access-Control-Allow-Origin"] = "*";
        headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
        headers["Access-Control-Allow-Credentials"] = false;
        headers["Access-Control-Max-Age"] = '86400'; // 24 hours
        headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
        res.writeHead(200, headers);
        res.end();
    } else {
        //...other requests

        if (req.method === 'PUT') {
            console.log("put....");
            add(req, res, next);
        }
        // next();
    }
}

//新增方法

function add(req, res, next) {
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
    } catch (err) {
        console.error(err);
        res.locals.message = err.message;
        res.locals.error = err;
        // render the error page
        res.status(err.status || 500);
        res.render('error');
        res.end();
    }
}

//新增
router.get('/create/:name/:age', function (req, res, next) {
    console.log("create....");
    add(req, res, next);
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
//delete请求
router.delete('/deleteByName/:name', function (req, res, next) {

    UserModel.remove({name: req.params.name}, function (err, node) {
        if (err) {
            res.send({'success': false, 'err': err});
        } else {
            console.log("deleteByName: " + node);
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
            res.end();
        }
    });

});
module.exports = router;
