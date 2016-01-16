if (Meteor.isServer) {
    Meteor.startup(function() {
        if (!Meteor.settings.cloudinary.cloud_name) throw new Error('Missing config');

        Cloudinary.config({
            cloud_name: Meteor.settings.cloudinary.cloud_name,
            api_key: Meteor.settings.cloudinary.api_key,
            api_secret: Meteor.settings.cloudinary.api_secret
        });
    });
}

if (Meteor.isClient) {

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

    Template.listImages.helpers({
        "images": function() {
            return Cloudinary.collection.find({}, {sort: {"response.created_at": -1}});
        }
    });

    Template.listItem.helpers({
        "uploading": function() {
            if(this.percent_uploaded < 100) return true;
            return false;
        }
    });

    Template.createForm.events({
        'change input[type=file]': function(e) {
            var fileName = '',
                label = e.target.nextElementSibling,
                fileName = e.target.value.split('\\').pop();

            if (!fileName) fileName = 'Choose an image again';

            label.querySelector('span').innerHTML = fileName;
        },
        'submit form': function(e) {
            e.preventDefault();

            var file = document.querySelector('input[type=file]').files[0];
            if (!file) return alert('u haz no image');

            var text = document.querySelector('input[type=text]').value.trim();
            if (!text) return alert('u haz no text');

            Session.set('uploading', true);

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

                console.log(res);
                Session.set('imgUrl', res.url);
            });
        }
    });
}
