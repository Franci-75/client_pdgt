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
    },

    newSession: function(telegramUser, username, password, ctx)  {
        newSession(telegramUser, username, password, ctx); 
    },

    deleteSession: function(telegramUser, ctx) {
        deleteSession(telegramUser, ctx);
    },

    rateMovie: function(telegramUser, movieTitle, score, ctx) {
        rateMovie(telegramUser, movieTitle, score, ctx);
    },
}

function saveSession(telegramUser, username, sessionId) {
    let saveObj = JSON.stringify({ username: username, session_id: sessionId});
    storage.setItem(telegramUser, saveObj);
};

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
        ctx.reply(`1: ${data.data.pop_1}\n2: ${data.data.pop_2}\n3: ${data.data.pop_3}\n4: ${data.data.pop_4}\n5: ${data.data.pop_5}`);
    }).catch(error => {
        console.log(error);
        ctx.reply("An error occurred while fetchin popular movies");
    });
}


/**
 * Create a new session for the user
 * @param {String} telegramUser 
 * @param {String} username 
 * @param {String} password 
 * @param {*} ctx 
 */
function newSession(telegramUser, username, password, ctx) {
    let userSession = storage.getItem(telegramUser);
    if(userSession) {
        ctx.reply("This user have a currently active session!");
        return;
    }
    axios.post(`${serverUrl}/request-token`, {
        username: username,
        password: password
    }).then(data => {
        if(data.data.success) {
            axios.post(`${serverUrl}/create-session`, {
                request_token: data.data.request_token,
                username: username
            }).then(data => {
                saveSession(telegramUser, username, data.data.session_id);
                ctx.reply("Successful login!");
            }).catch(error => {
                if (error.response) {
                    // Heroku 'not implemented' failure point.
                    // Check request response
                    if(error.response.status == 501 && error.response.data.success) {
                        saveSession(telegramUser, username, error.response.data.session_id);
                        ctx.reply("Successful login!");
                    } else {
                        // Generic error
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);

                        ctx.reply("Error while creating session");
                    }   
                }
            });
        } else {
            ctx.reply("Error! invalid login credentials");
            console.log("Invalid login credentials");
        }
    }).catch(error => {
        ctx.reply("An error occurred during the initialization of the session");
        console.log(`Error: ${error}`);
    });
}


/**
 * Execute the logout of the user
 * @param {String} telegramUser 
 * @param {*} ctx 
 */
function  deleteSession(telegramUser, ctx) {
    let userSession = storage.getItem(telegramUser);
    if(!userSession) {
        ctx.reply("This user haven't any active sessions!");
        return;
    }
    let obj = JSON.parse(userSession);
    axios.delete(`${serverUrl}/delete-session/${obj.session_id}`)
        .then(data => {
            if (data.data.success) {
                storage.removeItem(telegramUser);
                ctx.reply("User logged out!");
            } else {
                ctx.reply("An error occurred while destroying the session");
            }
        }).catch(error => {
            ctx.reply("An error occurred during the destruction of the session");
            console.log(`Error: ${error}`);
        });
}

/**
 * Rate a movie
 * @param {String} telegramUser 
 * @param {String} movieTitle 
 * @param {String} score 
 * @param {*} ctx 
 */
function rateMovie(telegramUser, movieTitle, score, ctx) {
    let userSession = storage.getItem(telegramUser);
    if(!userSession) {
        ctx.reply("This user haven't any active sessions!");
        return;
    }

    let obj = JSON.parse(userSession);
    axios.post(`${serverUrl}/rate/${movieTitle}`, {
        score: score,
        session_id: obj.session_id
    }).then(data => {
        if (data.data.success) {
            ctx.reply(`You've submitted a score of ${score} for the movie ${movieTitle}`);
        } else {
            ctx.reply(`Error while submitting the score for the movie ${movieTitle}`);
        }
    }).catch(error => {
        ctx.reply(`An error occurred while submitting the rating for the movie ${movieTitle}`);
        console.log(`Error: ${error}`);
    });
}



