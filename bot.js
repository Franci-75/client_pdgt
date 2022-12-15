/**
 * TELEGRAM BOT CLIENT IMPLEMENTATION FOR "THE MOVIE DB"
 * BOT.
 * 
 * Controller of telegram bot.
 * 
 * Author: Francesco Ortolani
 */

const telegraf = require("telegraf"); 
const core = require("./core");
 






const API_TOKEN = process.env.API_TOKEN || '';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://client-pdgt.herokuapp.com/';

const bot = new telegraf.Telegraf(process.env.BOT_TOKEN);





 
/**
 * Execute the info action
 */
bot.command('info', ctx => {
    let text_received = ctx.update.message.text.split(' '); 
    let movie_title = text_received.slice(1, text_received.length).join(" ");

    core.getMovieInfo(movie_title, ctx); 
});

/**
 * Execute the populars action
 */
bot.command('populars', ctx => core.getPopulars(ctx));

/**
 * Execute login action 
 */
bot.command('login', ctx => {
    let text_received = ctx.update.message.text.split(' ');
    if(text_received.length != 3) {
        ctx.reply("Error! Provide correct login credentials!  /login username password")
    } 

    let username = text_received[1];
    let password = text_received[2]; 

    core.newSession(ctx.update.message.from.username, username, password, ctx);
}); 

/**
 * Execute logout action 
 */
bot.command('logout', ctx => {
    let text_received = ctx.update.message.text.split(' ');
    if(text_received.length != 1) {
        ctx.reply("Error! use logout without other params");
    } 

    core.deleteSession(ctx.update.message.from.username, ctx);
});


/**
 * Execute the rate action
 */
bot.command('rate', ctx => {
    let text_received = ctx.update.message.text.split(' ');
    let movie_title = text_received.slice(1, text_received.length-1).join(" ");
    let score = text_received[text_received.length - 1];

    core.rateMovie(ctx.update.message.from.username, movie_title, score, ctx);
});


bot.start(ctx => ctx.reply("Welcome to THE MOVIE DB bot! Login with the \"/login\" command for starting use the app"));
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);