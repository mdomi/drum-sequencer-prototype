(function (window, AudioContext, $, async) {

    var context = new AudioContext(),
        document = window.document;

    $(function () {
        var sequencer = new window.controllers.Sequencer(3, context),
            meter = window.meter = new window.controls.LevelMeter(context, {
                width : 800,
                height: 10,
                bufferSize : 512,
                orientation : window.controls.LevelMeter.HORIZONTAL
            }),
            controls = new window.controllers.SequencerControls(
                document.getElementById('controls'), sequencer);

        sequencer.$el.appendTo('#main');
        meter.$el.appendTo('#main');

        sequencer.output.connect(context.destination);
        sequencer.output.connect(meter.processor);
        
        meter.processor.connect(context.destination);

        sequencer.bindEvents();
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


}(this, this.AudioContext || this.webkitAudioContext, this.jQuery, this.async));
