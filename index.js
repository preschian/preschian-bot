const _         = require('lodash');
const twitter   = require('twitter');
const icloud    = require('find-my-iphone').findmyphone;
const config    = require('./config');

// setup twitter
const client    = new twitter(config.twitter);

// setup icloud
icloud.apple_id = config.icloud.username;
icloud.password = config.icloud.password;

const getLocation = (cb) => {
    icloud.getDevices((error, device) => {
        const getSearch = _.find(device, { 'modelDisplayName': config.icloud.device });
        const latitude  = getSearch.location.latitude;
        const longitude = getSearch.location.longitude;
        const gmaps     = `http://maps.google.com/maps?q=${latitude},${longitude}`;

        icloud.getLocationOfDevice(getSearch, function(error, location) {
            cb(`${location} ${gmaps}`);
        });
    });
};

client.stream('statuses/filter', { track: '@preschian di mana' }, (stream) => {
    stream.on('data', (event) => {
        // get username and status id
        const username = `@${event.user.screen_name}`;
        const statusid = event.id_str;

        if (event.user.screen_name === 'imawrr') {
            getLocation((data) => {
                client.post('direct_messages/new', {
                    screen_name: event.user.screen_name,
                    text: data
                }, (error, tweet, response) => {
                    if(error) throw error;
                });

                client.post('statuses/update', {
                    status: `${username} check dm~`,
                    in_reply_to_status_id: statusid
                }, (error, tweet, response) => {
                    if(error) throw error;
                });
            });
        } else {
            console.log('will tweet/dm if got mention from @imawrr');
        }
    });
});
