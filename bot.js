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
 
 const bot = new telegraf.Telegraf(BOT_TOKEN);


 
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



bot.start(ctx => ctx.reply("Welcome to THE MOVIE DB bot! Login with the \"/login\" command for starting use the app"));
bot.launch();