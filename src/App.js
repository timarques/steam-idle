const SteamUser = require('steam-user');
const Inquirer = require('inquirer');
const RequestModule = require('request');

const Log = require('./Log');
const GamesController = require('./GamesController');

const rJar = RequestModule.jar();
const request = RequestModule.defaults({ 'jar': rJar });
const user = new SteamUser({
    enablePicsCache: true,
    promptSteamGuardCode: false,
    autoRelogin: true
});
var controller = new GamesController(user);

Inquirer.prompt([
    { type: 'input', name: 'account_name', message: 'Account Name:' },
    { type: 'password', name: 'password', message: 'Password:', mask: '*' },
    { type: 'input', name: 'steam_guard', message: 'Steam Guard:' }
]).then(answers => {
    user.logOn({
        accountName: answers['account_name'],
        password: answers['password'],
        twoFactorCode: answers['steam_guard'],
        rememberPassword: true
    });
});

user.once('loggedOn', () => {
    user.setPersona(SteamUser.EPersonaState.Online);
    Log.send('success', 'Logged')
});

user.once('appOwnershipCached', () => user.webLogOn());

user.once('webSession', (sessionID, cookies) => {
    cookies.forEach(cookie => {
        rJar.setCookie(cookie, 'https://steamcommunity.com');
    });
    controller.find(request).then((count)=>
        controller.next().play(user)
    ).catch(error => Log.send('error', error));
});

user.on('newItems', ()=> controller.drop(user));

user.on('error', error => Log.send('error', error));
