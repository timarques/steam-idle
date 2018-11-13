const Log = require('./Log');

module.exports = class {

    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.drops = data.drops;
    }

    play(user) {
        if(this.drops.length > 0){
            Log.send('success', `${this.title} | ${this.drops} drops`);
            user.gamesPlayed([this.id], true);
        }
    }

    drop() {
        this.drops --;
        Log.send('info', `Drop`);
        return this.drops;
    }
}
