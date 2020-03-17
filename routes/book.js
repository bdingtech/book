var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { getBookList, getSearchList, getQuot } = require('../conrtoller/book')

router.get('/', (req, res, next) => {
    res.send({
        "msg": "sucess"
    })
});
//图书搜索列表
router.get('/getSearchList', (req, res, next) => {
    let { key, page } = req.query
    getSearchList(key, page).then(data => {
        //没有找到任何结果
        if (!data && page == 1) {
            res.json(
                new ErrorModel('正则没有匹配到数据')
            )
            return
        }
        //找到结果
        if (data) {
            res.json(
                new SuccessModel(data)
            )
            return
        }
        if(!data && page != 1 ){
            res.json(
                new SuccessModel('noMore')
            )
        }
    })
})
//图书借阅列表
router.get('/getBookList', (req, res, next) => {
    let id = req.query.id
    getBookList(id, (data) => {
        if (!data) {
            new ErrorModel('更新博客失败')
            return
        }
        res.json(data)
    })
})
//一言
router.get('/getQuot', function (req, res, next) {
    getQuot().then(data => {
        if (!data) {
            new ErrorModel('获取一言失败')
            return
        }
        res.send(data)
    })
});
module.exports = router;
