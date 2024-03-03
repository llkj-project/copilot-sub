const express = require('express');
const router = express();
const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');

function getGithubUserInfo(token) {
  return new Promise((resolve, reject) => {
    const octokit = new Octokit({
      auth: token,
      request: {
        fetch: fetch,
      },
    });

    octokit.rest.users.getAuthenticated()
      .then(({ data }) => {
        // console.log(data, 'getGithubUserInfo');
        resolve(data.login)
      })
      .catch((error) => {
        // console.error(error, 'getGithubUserInfo error');
        const errorString = {
          time: new Date(),
          message: error.toString()
        }
        // fs.appendFileSync('err.log', errorString);
        reject({
          ...error,
          errorString
        });
      });
  })
}

function getCopilotInfo(token) {
  return new Promise((resolve, reject) => {
    fetch('https://api.github.com/copilot_internal/v2/token', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data, 'getCopilotInfo');
        resolve(data?.sku || '无有效订阅')
      })
      .catch((error) => {
        // console.error(error, 'getCopilotInfo error');
      });
  })
}


router.get('/sub', async (req, res) => {
  const { token } = req.query;



  // token格式为ghu_xxx
  if (!token || token.indexOf('ghu_') === -1) {
    res.json({
      code: 0,
      data: {
        message: 'token格式错误'
      }
    });
    return;
  }


  try {
    const username = await getGithubUserInfo(token);
    const sku = await getCopilotInfo(token);

    console.log(username, sku, 'username, sku');
    if (username) {
      console.log('获取信息成功');
      res.json({
        code: 1,
        data: {
          username,
          status: '账号正常',
          sku,
          token
        }
      });
      // console.log(`获取信息成功\n* 您的token：${token}\n* 用户名：${username}\n* Copilot订阅状态：${sku}`);
    }
  } catch (error) {
    // console.log(error, 'error');
    if (error.status == 403) {
      // console.log('错误日志已保存到err.log文件，请查看');
      // console.log(`* 您的token：${token}\n* 当前状态：已被封禁`);
      res.json({
        code: 0,
        data: {
          status: '已封禁',
          token,
          error: error.errorString
        }
      });
    }
  }

})



module.exports = router;