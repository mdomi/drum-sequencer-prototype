(function (window, $, async) {

    var context = new window.webkitAudioContext(),
        document = window.document;

    $(function () {
        var sequencer = new window.controllers.Sequencer(3, context),
            controls = new window.controllers.SequencerControls(
                document.getElementById('controls'), sequencer);

        sequencer.$el.appendTo('#main');
        sequencer.bindEvents();
        sequencer.connect(context.destination);
        controls.bindEvents();

        window.sequencer = sequencer;

        new window.controllers.Resources('#resources', context);

        $.ajax({
            url : 'wav/index.json'
        }).then(function (index) {
            async.map(index.files, function (file, cb) {
                window.resources.read(file.path, context, cb);
            }, function (error) {
                if (error) {
                    throw error;
                }
                controls.loadInitialPattern();
            });
        });
    });


}(this, this.jQuery, this.async));
