const newsService = require('./news-service');
var Promise = require('promise');
exports.getNews = function(){
  return new Promise((resolve, reject)=>{
    newsService.getNews().then((news)=>{
      resolve(news);
    },(err)=>{
      reject(err);
    });
  });
};

exports.addNews = function(newsObj){
  return new Promise((resolve, reject)=>{
    newsService.addNews(newsObj).then((news)=>{
      resolve(news);
    },(err)=>{
      reject(err);
    });
  });
};

exports.deleteNews = function(_id, _rev){
  return new Promise((resolve, reject)=>{
    newsService.deleteNews(_id, _rev).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
}

exports.updateNews = function(newsObj){
  return new Promise((resolve, reject)=>{
    newsService.updateNews(newsObj).then((newsUpdated)=>{
      resolve(newsUpdated);
    },(err)=>{
      reject(err);
    });
  });
}
