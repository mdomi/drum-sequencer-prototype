(function (window, $) {

    var context = new window.webkitAudioContext(),
        document = window.document;

    $(function () {
        var sequencer = new window.controllers.Sequencer(3, context),
            controls = new window.controllers.SequencerControls(
                document.getElementById('controls'), sequencer);

        sequencer.$el.appendTo('#main');
        sequencer.bindEvents();
        controls.bindEvents();

        window.sequencer = sequencer;

        new window.controllers.Resources('#resources', context);

        $.ajax({
            url : 'wav/index.json'
        }).then(function (index) {
            index.files.forEach(function (file) {
                window.resources.read(file.path, context);
            });
        });
    });


}(this, this.jQuery));
