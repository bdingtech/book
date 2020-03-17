const superagent = require('superagent')
let iconv = require('iconv-lite');
const charset = require('superagent-charset')

const model = require('../model');
const request = charset(superagent)

//获取借阅列表主函数
const getBookList = (id, callback) => {
    request.get('http://opac.hnust.cn:8080/opac/reader/login.jsp?str_kind=login').query({
        barcode: '',
        fangshi: '1',
        identification_id: id,
        password: '888888'
    }).then(data => {
        let cookie = data.header['set-cookie']
        return {
            data: data.text,
            cookie: cookie
        }
    }).then(data => {

        let text = data.data
        let cookie = data.cookie
        // console.log(text.search('infoList'))
        if (text.search('infoList.jsp') == -1) {
            console.log("登录失败")
            return
        }
        //继续操作
        getLoanList(cookie, data => {
            // console.log(data)
            callback(data)
        })
        // console.log("登录成功")
        // return getLoanList(cookie)
        // console.log(bookList)
    }).catch(err => {
        console.log(err)
    })
}

//获取借阅列表子函数，二步验证，使用cookies登录
const getLoanList = (cookie, callback) => {
    request.get('http://opac.hnust.cn:8080/opac/reader/infoList.jsp').charset('gbk').set("Cookie", cookie).then(data => {
        // let $ = cheerio.load(data.text);
        // $table = cheerio.load($('table').eq(4).html());
        let content = data.text
        //字符替换
        let a = content.replace(/ align=center/g, '')
        let b = a.replace(/&nbsp;/g, '')
        let c = b.replace(/<font color=#FF0000>/g, '')
        let d = c.replace(/<font>/g, '')
        let e = d.replace(/<\/font>/g, '')
        function iGetInnerText(testStr) {
            var resultStr = testStr.replace(/\ +/g, ""); //去掉空格
            resultStr = testStr.replace(/[ ]/g, "");    //去掉空格
            resultStr = testStr.replace(/[\r\n]/g, ""); //去掉回车换行
            return resultStr;
        }
        let f = iGetInnerText(e)
        //过滤换行--巨坑
        //正则匹配
        let regExp = /<td>(?:\d+)<\/td><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td><td>(.*?)<\/td>(?:.{80,120}Renew\('(?:.*?)','(.*?)','(.*?)'\))?/g
        let list = f.match(regExp)
        if (!list) {
            console.log("无借阅记录")
            callback(null)
            return
        }
        let bookList = []
        list.map((data) => {
            // console.log(data)
            let temp = data.replace(/<td>/g, '')
            // console.log(temp.split('</td>'))
            bookList.push(temp.split('</td>'))
        })
        // console.log(bookList)
        callback(bookList)
    }).catch(err => {
        console.log(err)
    })
}
//获取搜索结果列表
const getSearchList = (key, page) => {
    function toGBKurl(value) {
        let data = iconv.encode(value, 'gbk')
        let result = "";
        for (let i = 0; i < data.length; i++) {
            result += '%' + data[i].toString(16).toUpperCase();
        };
        return result;
    }
    //返回一个promise对象
    return new Promise((resolve, reject) => {
        request.get(`http://opac.hnust.cn:8080/opac/book/queryOut.jsp?kind=simple&type=title&word=${toGBKurl(key)}&curpage=${page}&match=mh&recordtype=all&library_id=all&orderby=pubdate_date&ordersc=desc&recordtype=01&size=15`).charset('gbk').buffer(true).end((err, data) => {
            if (err) {
                console.log("抓取错误" + err)
                return
            }
            // console.log(data.text)
            let content = data.text.replace(/&nbsp;/g, '')
            //构造正则
            let regExp = /<td><a href="javascript:popup\(\'detailBook.jsp\',\'(.*?)\'\)" class=opac_blue>(.*?)<\/a><\/td>(?:.*?)<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>(?:.*?)<\/tr>/g
            // content.replace(regExp, () => {
            //     console.log(arguments)
            // })
            function iGetInnerText(testStr) {
                var resultStr = testStr.replace(/\ +/g, ""); //去掉空格
                resultStr = testStr.replace(/[ ]/g, "");    //去掉空格
                resultStr = testStr.replace(/[\r\t\n]/g, ""); //去掉回车换行
                return resultStr;
            }
            content = iGetInnerText(content)
            //继续正则处理
            // console.log(content)
            // console.log(content.match(regExp))
            let regStr = content.match(regExp)
            if (!regStr) {
                console.log('正则没有匹配到数据')
                resolve(null)
                return
            }
            let finalList = []
            regStr.map((data) => {
                let temp = data.replace(/<\/td>|<\/tr>|<a href="javascript:popup\(\'detailBook.jsp\',\'(.*?)\'\)" class=opac_blue>|<\/a>|<!--<tdalign=center><INPUTTYPE="checkbox"value="(.*?)"NAME="choose">--><!--<tdalign=center><inputtype="checkbox"name="selected_marc"value="(.*?)">-->/g, '')
                finalList.push(temp.split('<td>').map((data) => {
                    return data.trim()
                }))
            })
            resolve(finalList)
        })
    })

}
//一言
const getQuot = () => {
    let soup = model.soup;
    soup.removeAttribute('id')
    //获取随机数
    var num = parseInt(Math.random() * (100 + 1), 10);

    return soup.findOne({
        limit: 1,
        offset: num
    })
}

module.exports = {
    getBookList,   //获取借阅列表
    getSearchList,  //获取搜索列表
    getQuot        //一言
}