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
            return Cloudinary.collection.find();
        }
    });

    Template.createForm.events({
        'submit form': function(e) {
            e.preventDefault();

            var file = document.querySelector('input[type=file]').files[0];
            if (!file) return alert('u haz no image');

            var text = document.querySelector('input[type=text]').value.trim();
            if (!text) return alert('u haz no text');

            console.log('uploading', text, file);

            Session.set('uploading', true);

            Cloudinary.upload([file], {
                transformation: [{
                    crop:"fill",
                    width: 400,
                    height: 600,
                },
                    {
                    crop:"fit",
                    width: 350,
                    height: 550,
                    overlay: "text:impact_50_bold_stroke:" + text,
                    color: "white",
                    border: "4px_solid_black"
                }]
            }, function(err, res) {
                Session.set('uploading', false);

                if(err) {
                    alert('ARRRRRR! ' + err.error.message);
                    return console.error(err);
                }

                console.log(res);
                Session.set('imgUrl', res.url);
            });
        }
    });
}
