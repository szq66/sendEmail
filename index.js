const fetch = require('node-fetch');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

const sendEmail = require('./sendEmail');
const emailHtml = require('./emailHtml');

// 给dayjs添加时区选项
dayjs.extend(utc);
dayjs.extend(timezone);

const {
  fromDisplayText,
  fromDisplaySubText,
  // user,
  // to,
  weatherKey,
  location,
  type,
  tianXingKey,
  startDay,
} = require('./config');

var args = process.argv.splice(2);
user = args[0];
pass = args[1];
to  = args[0];

async function init() {
  try {
    // 获取天气信息
    const weatherRes = await fetch(
      `https://devapi.qweather.com/v7/weather/3d?key=${weatherKey}&location=${location}`
    );
    const weatherData = await weatherRes.json();

    // 获取天气生活指数
    const lifeRes = await fetch(
      `https://devapi.qweather.com/v7/indices/1d?key=${weatherKey}&location=${location}&type=${type}`
    );
    const lifeData = await lifeRes.json();

    // 获取one一个文案及图片
    // const oneRes = await fetch(
    //   `http://api.tianapi.com/txapi/one/index?key=${tianXingKey}`
    // );
    const oneRes = await fetch(
      `https://apier.youngam.cn/essay/one`
    );

    const oneData = await oneRes.json();
    // const { word, imgurl } = oneData.newslist[0];
    const { text: word } = oneData.dataList[0];
    const imgurl = 'https://api.kdcc.cn/img/bingimg/' + new Date().format('yyyy/MM/dd') + '.jpg';

    // 计算日期
    const lovingDays = dayjs(dayjs().tz('Asia/Shanghai')).diff(
      startDay,
      'days'
    );

    // 用邮件模版生成字符串
    const htmlStr = emailHtml(weatherData, lifeData, word, imgurl, lovingDays);

    // 发送邮件;
    sendEmail({
      from: fromDisplayText,
      to,
      subject: fromDisplaySubText,
      html: htmlStr,
    }, user, pass);
  } catch (e) {
    // 发送邮件给自己提示
    sendEmail({
      from: '报错啦',
      to: user,
      subject: '定时邮件-报错提醒',
      html: '请查看github actions',
    }, user, pass);
  }
}

init();

Date.prototype.format = function(fmt) { 
  var o = { 
    "M+" : this.getMonth()+1,                 //月份 
    "d+" : this.getDate(),                    //日 
    "h+" : this.getHours(),                   //小时 
    "m+" : this.getMinutes(),                 //分 
    "s+" : this.getSeconds(),                 //秒 
    "q+" : Math.floor((this.getMonth()+3)/3), //季度 
    "S"  : this.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  }
  for(var k in o) {
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
  return fmt; 
}        