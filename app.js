const express = require('express');
const morgan = require('morgan');
const copilot = require('./routes/copilot');

const app = express();
app.use(morgan('tiny')); // 日志中间件
app.set('view engine', 'ejs'); // 设置默认的模板引擎
app.use(express.urlencoded({ extended: true })); // 解析表单数据
app.use(express.json());  // 解析json数据
// 跨域
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.get('/', (req, res) => {
  res.send('hello copilot');
})



app.use('/copilot', copilot);


// 中间件 的执行 一定是在req 和 res 之间
// 中间件 一定是有一定的作用
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
})

const PORT = process.env.PORT || 8555;

app.listen(PORT, () => {
  console.log(`server is running on port http://127.0.0.1:${PORT}`);
})


// Export the Express API
module.exports = app;