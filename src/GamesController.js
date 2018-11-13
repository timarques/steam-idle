const JSDOM = require('jsdom').JSDOM;
const Game = require('./Game');
const Log = require('./Log');

module.exports = class {

    constructor()
    {
        this.active = null;
        this.elements = [];
        this.drops = 0;
    }

    next()
    {
        if(this.elements.length === 0){
            Log.send('success', 'All done');
            Log.send('info', `Total of ${this.drops} cards dropped`);
            process.exit(0);
        }
        this.elements.filter((value, index, arr) => value !== this.active);
        this.active = this.elements[Math.floor(Math.random()*this.elements.length)];
        return this.active;
    }

    find(request)
    {
        return new Promise((resolve, reject) => {
            request("https://steamcommunity.com/my/badges/", (error, response, body) => {
                if(error || response.statusCode !== 200)
                    return reject('Can\'t extract badges page');
                const dom = new JSDOM(body);
                const badges = dom.window.document.querySelectorAll('.badge_row');
                if(badges.length === 0) return reject(`Cookies expired`);
                badges.forEach((badge)=>this._handleBadges(badge));
                resolve();
            });
        });
    }

    drop(user)
    {
        if(!this.active) return;
        this.drops ++;
        if(this.active.drop() === 0){
            this.next().play(user);
        }
    }

    _handleBadges(badge)
    {
        const gameId = Number(badge.querySelector('.badge_row_overlay').href.split('/').slice(-2)[0]);
        //if(!user.picsCache.apps.hasOwnProperty(gameId)) return;
        const gameTitleElement = badge.querySelector('.badge_title');
        const gameTitleDetailsElement = gameTitleElement.querySelector('.badge_view_details');
        gameTitleElement.removeChild(gameTitleDetailsElement);
        const gameTitle = gameTitleElement
            .textContent
            .replace(/\n/g, '')
            .replace(/\r/g, '')
            .replace(/\t/g, '')
            .trim();
        const progressInfoElement = badge.querySelector('.progress_info_bold');
        if(!progressInfoElement) return;
        let gameDrops = progressInfoElement
            .textContent
            .match(/(\d+) card drops? remaining/);
        if(!gameDrops) return;
        gameDrops = gameDrops[1];
        this.elements.push(new Game({
            id: gameId,
            title: gameTitle,
            drops: gameDrops
        }));
    }

}
