/**
 * fileName:dbconnect.js
 * author:gamehu
 * date:2017/3/2 9:52
 * desc:数据库连接相关实现
*/

var connectionString,mongoose,db,options;
mongoose = require('mongoose');
connectionString="mongodb://192.168.1.165:27017/cars";
options = {
    db: {
        native_parser: true//启动本地解析use c++
    },
    server: {
        auto_reconnect: true,//是否自动重连接
        poolSize: 5//连接池大小
    }
};
//打开连接
mongoose.connect(connectionString, options, function(err, res) {
    if(err) {
        console.log('[mongoose log] Error connecting to: ' + connectionString + '. ' + err);
    } else {
        console.log('[mongoose log] Successfully connected to: ' + connectionString);
    }
});
//获取连接
var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'mongoose connection error:'));等同下面
db.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});

db.on('connected',function () {
 //   console.log("mongoose connected to"+connectionString);
})
//断开连接事件
db.on('disconnected',function () {
    console.log("mongoose disconnected to"+connectionString);
})
//监听进程退出
process.on('SIGINT',function () {
    db.close(function () {
        console.log("disconnected ..");
    })
    process.exit(0);
})
/*
db.once('open', function callback () {
    console.log('mongoose open success');
});*/
