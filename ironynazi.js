Ironies = new Meteor.Collection("ironies");

if (Meteor.isServer) {
    Meteor.startup(function() {
        if (!Meteor.settings.cloudinary.cloud_name) throw new Error('Missing config');

        Cloudinary.config({
            cloud_name: Meteor.settings.cloudinary.cloud_name,
            api_key: Meteor.settings.cloudinary.api_key,
            api_secret: Meteor.settings.cloudinary.api_secret
        });
    });

    Meteor.methods({
        addIrony: function(irony) {
            console.log('add irony');
            irony.date = new Date();

            Ironies.insert(irony);
        }
    });

    Meteor.publish("latestIronies", function() {
        return Ironies.find({}, {
            sort: {
                date: -1
            }
        });
    });
}

if (Meteor.isClient) {

    Meteor.subscribe("latestIronies");

    Template.registerHelper('imgUrl', function(input) {
        return Session.get('imgUrl');
    });

    Session.setDefault('imgUrl', false);
    Session.setDefault('uploading', false);

    Template.layout.helpers({
        "uploading": function() {
            Session.get('uploading');
        }
    });

    Template.uploadedList.helpers({
        "items": function() {
            return Cloudinary.collection.find({}, {
                sort: {
                    "response.created_at": -1
                }
            });
        }
    });

    Template.uploadedListItem.helpers({
        "uploading": function() {
            if (this.percent_uploaded < 100) return true;
            return false;
        }
    });

    Template.ironyList.helpers({
        "latest": function() {
            return Ironies.find({}, {
                sort: {
                    date: -1
                }
            });
        }
    });

    Template.createForm.events({
        'change input[type=file]': function(e) {
            var fileName = '',
                label = e.target.nextElementSibling,
                fileName = e.target.value.split('\\').pop();

            if (!fileName) fileName = '1. Choose an image again';

            label.innerHTML = fileName;
        },
        'submit form': function(e) {
            e.preventDefault();

            var file = document.querySelector('.createForm__fileInput').files[0];
            if (!file) return alert('u haz no image');

            var text = document.querySelector('.createForm__textInput').value.trim();
            if (!text) return alert('u haz no text');

            Session.set('uploading', true);

            // reset
            document.querySelector('.createForm__fileInput').value = null;
            document.querySelector('.createForm__fileLabel').innerHTML = '1. Choose an image again';
            document.querySelector('.createForm__textInput').value = null;

            Cloudinary.upload([file], {
                transformation: [{
                    // crop: "fill",
                    width: 400,
                    // height: 600,
                }, {
                    crop: "fit",
                    width: 350,
                    height: 550,
                    overlay: "text:impact_50_bold_stroke:" + text,
                    color: "white",
                    border: "4px_solid_black"
                }]
            }, function(err, res) {
                Session.set('uploading', false);

                if (err) {
                    alert('ARRRRRR! ' + err.error.message);
                    return console.error(err);
                }

                Meteor.call("addIrony", {
                    text: text,
                    cloudinary: {
                        id: res.public_id,
                        url: res.url,
                    }
                });

                console.log('finished', res);
                Session.set('imgUrl', res.url);
            });
        }
    });
}
