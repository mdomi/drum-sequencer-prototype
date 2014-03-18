(function (window, $) {

    var document = window.document,
        MS_PER_S = 1000,
        S_PER_MIN = 60,
        slice = Array.prototype.slice;

    function Square() {
        this.$el = $(document.createElement('span'));
        this.$el.addClass('sequencer-square');

        var isToggled = false;

        this.activate = function () {
            this.$el.addClass('sequencer-square-active');
        };

        this.deactivate = function () {
            this.$el.removeClass('sequencer-square-active');
        };

        this.toggle = function () {
            this.$el.toggleClass('sequencer-square-toggle');
            isToggled = !isToggled;
        }.bind(this);

        this.toggled = function () {
            return isToggled;
        };

        this.bindEvents = function () {
            this.$el.on('click', this.toggle.bind(this));
        };

    }

    Square.create = function () {
        return new Square();
    };

    function createVolumeInput() {
        var input = document.createElement('input');
        input.type = 'range';
        input.classList.add('js-volume');
        input.min = 0;
        input.max = 100;
        input.value = 50;
        return input;
    }

    function createOption(text) {
        var option = document.createElement('option');
        option.value = text;
        option.appendChild(document.createTextNode(text));
        return option;
    }

    function createEmptyOption() {
        var option = document.createElement('option');
        option.innerHTML = '---';
        return option;
    }

    function createResourceOptions() {
        return [createEmptyOption()].concat(window.resources.list().map(createOption));
    }

    function updateResourceSelectorOptions(resourceSelector) {
        var $el = $(resourceSelector),
            value = $el.val();
        $el.html(createResourceOptions()).val(value);
    }

    function SequencerRow(width, context) {
        this.$el = $(document.createElement('div')).addClass('form-inline');

        var node = context.createGainNode(),
            resourceSelector = document.createElement('select'),
            squares = [],
            active,
            volumeControl = createVolumeInput();

        updateResourceSelectorOptions(resourceSelector);

        node.connect(context.destination);
        node.gain.value = volumeControl.value / 100.0;

        squares = times(width, Square.create);

        this.$el.append(resourceSelector);
        this.$el.append(volumeControl);
        squares.forEach(function (square) {
            this.$el.append(square.$el);
        }.bind(this));

        function play() {
            var resource = window.resources.get(resourceSelector.value);
            if (resource) {
                var source = context.createBufferSource();
                source.buffer = resource.buffer;
                source.connect(node);
                source.noteOn(0);
            }
        }

        this.bindEvents = function () {
            invoke(squares, 'bindEvents');
            volumeControl.addEventListener('change', function () {
                node.gain.value = volumeControl.value / 100.0;
            });
        };

        this.setActive = function (index) {
            if (active) {
                active.deactivate();
            }
            active = squares[index];
            if (active) {
                active.activate();
                if (active.toggled()) {
                    play();
                }
            }
        };

        this.clearActive = function () {
            if (active) {
                active.classList.remove('sequencer-square-active');
            }
            active = (void 0);
        };

        this.updateResources = function () {
            updateResourceSelectorOptions(resourceSelector);
        };

    }

    SequencerRow.create = function (width, context) {
        return new SequencerRow(width, context);
    };

    function timePerBeat(bpm) {
        return MS_PER_S * S_PER_MIN / bpm;
    }

    function times(x, fn) {
        var results = [], i = 0, args = slice.call(arguments, 2);
        for (i = 0; i < x; i++) {
            results.push(fn.apply(null, args));
        }
        return results;
    }

    function invoke(arr, name) {
        var args = slice.call(arguments, 2);
        return arr.map(function (x) {
            return x[name].apply(x, args);
        });
    }

    function pad(value) {
        if (value < 10) {
            return '0' + String(value);
        }
        return String(value);
    }

    function timestamp() {
        return new Date().getTime();
    }

    window.controllers = window.controllers || {};

    window.controllers.Sequencer = function (height, context) {

        this.$el = $(document.createElement('div'));

        var display = document.createElement('span'),
            tempo = 108,
            timeout,
            currentBeat,
            length = 16,
            schedule = function () {
                var now = timestamp(),
                    next = timePerBeat(tempo * 4);
                step.call(this);
                timeout = window.setTimeout(schedule, Math.floor(next - (timestamp() - now)));
            }.bind(this),
            rows = times(height, SequencerRow.create, length, context);

        this.$el.append(display);
        rows.forEach(function (row) {
            this.$el.append(row.$el);
        }.bind(this));

        this.bindEvents = function () {
            invoke(rows, 'bindEvents');
            $(document).on('resource:add', this.updateResources.bind(this));
        };

        this.updateResources = function () {
            invoke(rows, 'updateResources');
        };

        function setup() {
            currentBeat = 0;
            invoke(rows, 'setActive');
            updateDisplay();
        }

        function updateDisplay() {
            display.innerHTML = pad(Math.floor(currentBeat / 4) + 1) + ' - ' + pad(currentBeat % 4 + 1);
        }

        function step() {
            rows.forEach(function (row) {
                row.setActive(currentBeat);
            });
            updateDisplay.call(this);
            currentBeat = (currentBeat + 1) % length;
        }


        this.setTempo = function (newTempo) {
            tempo = newTempo;
        };

        this.start = function () {
            this.stop();
            schedule();
        };

        this.stop = function () {
            setup();
            if (timeout) {
                window.clearTimeout(timeout);
            }
        };
    };

    window.controllers.SequencerControls = function (el, sequencer) {
        this.$el = $(el);

        this.bindEvents = function () {
            this.$el.on('click', '.js-play', sequencer.start.bind(sequencer));
            this.$el.on('click', '.js-stop', sequencer.stop.bind(sequencer));
            this.$el.on('click', '.js-tempo', function () {
                sequencer.setTempo(parseInt(this.value, 10));
            });
        };
    };

}(this, this.jQuery));