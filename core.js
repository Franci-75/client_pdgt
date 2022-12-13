/**
 * TELEGRAM BOT CLIENT IMPLEMENTATION FOR "THE MOVIE DB"
 * BOT.
 * 
 * Model of telegram bot.
 * 
 * Author: Francesco Ortolani
 */

 const axios = require('axios');
 const {LocalStorage} = require("node-localstorage");

 var storage = new LocalStorage("./store");

// Define the server production url and port
const serverUrl = process.env.SERVER_URL || 'https://server-pdgt.herokuapp.com';

module.exports = {
    getMovieInfo: function(movieTitle, ctx) {
        getMovieInfo(movieTitle, ctx);
    },

    getPopulars: function(ctx) {
        getPopulars(ctx);
    }
}

/**
 * Get the informations for a movie
 * @param {String} movieTitle 
 * @param {*} ctx 
 */
function getMovieInfo(movieTitle, ctx) { 
    axios.get(`${serverUrl}/info/${movieTitle}`)
    .then(data => {
        if(data.data.success) {
            let message = `Title: ${data.data.title},\n\nOverview: ${data.data.overview},\n\nVote average: ${data.data.vote_average}`;
            // Reply with photo
            // This doesn't work (Telegram API fail)
            // ctx.sendPhoto(`https://image.tmdb.org/t/p/w200${data.data.poster_path}`, {caption: message});
            ctx.reply(message);
        } else {
            ctx.reply("Can't fetch informations");
        }
        
    }).catch(error => {
        console.log(error); 
        ctx.reply("An error occurred while accessing the movie info");
    })
 }


 /**
 * Return a list of the 5 most popular fils right now.
 * @param {*} ctx 
 */
  function getPopulars(ctx) {
    axios.get(`${serverUrl}/get-populars`)
    .then(data => {
        ctx.reply(`1: ${data.data.pop_1}`);
        ctx.reply(`2: ${data.data.pop_2}`);
        ctx.reply(`3: ${data.data.pop_3}`);
        ctx.reply(`4: ${data.data.pop_4}`);
        ctx.reply(`5: ${data.data.pop_5}`);
    }).catch(error => {
        console.log(error); 
        ctx.reply("An error occurred while fetchin popular movies");
    });
 }
