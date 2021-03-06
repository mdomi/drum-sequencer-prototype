(function (window, $) {

    var document = window.document,
        MS_PER_S = 1000,
        S_PER_MIN = 60,
        slice = Array.prototype.slice,
        STATES = {
            INACTIVE : 0,
            ACTIVE : 1
        };

    var Square = (function () {

        function Square() {
            this.$el = $(document.createElement('span'));
            this.$el.addClass('sequencer-square');
            this._isToggled = false;
        }

        Square.prototype.clear = function () {
            this.loadPattern(0);
        };

        Square.prototype.toggle = function () {
            this.$el.toggleClass('sequencer-square-toggle');
            this._isToggled = !this._isToggled;
        };

        Square.prototype.toggled = function () {
            return this._isToggled;
        };

        Square.prototype.bindEvents = function () {
            this.$el.on('click', this.toggle.bind(this));
        };

        Square.prototype.getPattern = function () {
            return {
                state : this._isToggled ? STATES.ACTIVE : STATES.INACTIVE
            };
        };

        Square.prototype.loadPattern = function (pattern) {
            this._isToggled = pattern.state === STATES.ACTIVE ? true : false;
            if (this._isToggled) {
                this.$el.addClass('sequencer-square-toggle');
            } else {
                this.$el.removeClass('sequencer-square-toggle');
            }
        };

        Square.prototype.activate = function () {
            this.$el.addClass('sequencer-square-active');
        };

        Square.prototype.deactivate = function () {
            this.$el.removeClass('sequencer-square-active');
        };

        Square.create = function () {
            return new Square();
        };

        return Square;
    }());

    function createVolumeInput(min, max) {
        var input = document.createElement('input');
        input.type = 'range';
        input.classList.add('js-volume');
        input.min = min;
        input.max = max;
        input.value = min + ((max - min) / 2);
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

        var resourceSelector = document.createElement('select'),
            squares = [],
            active,
            volumeControl = createVolumeInput(0, 90),
            source;

        updateResourceSelectorOptions(resourceSelector);

        this.output = context.createGainNode();
        this.output.gain.value = volumeControl.value / 100.0;

        squares = times(width, Square.create);

        this.$el.append(resourceSelector);
        this.$el.append(volumeControl);
        squares.forEach(function (square) {
            this.$el.append(square.$el);
        }.bind(this));

        function play() {
            var resource = window.resources.get(resourceSelector.value);
            if (resource) {
                if (source) {
                    source.noteOff(0);
                }
                source = context.createBufferSource();
                source.buffer = resource.buffer;
                source.connect(this.output);
                source.noteOn(0);
            }
        }

        this.bindEvents = function () {
            invoke(squares, 'bindEvents');
            volumeControl.addEventListener('change', function () {
                this.output.gain.value = volumeControl.value / 100.0;
            }.bind(this));
        };

        this.setActive = function (index) {
            if (active) {
                active.deactivate();
            }
            active = squares[index];
            if (active) {
                active.activate();
                if (active.toggled()) {
                    play.call(this);
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

        this.getPattern = function () {
            return {
                sample : resourceSelector.value,
                pattern : invoke(squares, 'getPattern')
            };
        };

        this.loadPattern = function (pattern) {
            resourceSelector.value = pattern.sample;
            pattern.pattern.forEach(function (setting, i) {
                squares[i].loadPattern(setting);
            });
        };

        this.clear = function () {
            invoke(squares, 'clear');
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


    window.controllers.Sequencer = (function () {

        function Sequencer(height, context) {
            var $controls = $(document.createElement('div'));

            this.$el = $(document.createElement('div'));
            this._display = document.createElement('span');
            this._tempo = 108;
            this._currentBeat = 0;
            this.context = context;   
            this.length = 16;
            this.$rows = $(document.createElement('div'));
            this._bound = false;
            this._rows = [];
            this.output = context.createGainNode();
            this._destinations = [];

            this.$el.append(this._display);

            this.$el.append(this.$rows);
            this.$el.append($controls);

            times(height, this.addRow.bind(this));

            $('<button class="js-add-row btn btn-default">Add row</button>').appendTo($controls);

        }

        Sequencer.prototype._schedule = function () {
            var now = timestamp(),
                next = timePerBeat(this._tempo * 4);
            this._step();
            this._timeout = window.setTimeout(this._schedule.bind(this), Math.floor(next - (timestamp() - now)));
        };

        Sequencer.prototype.bindEvents = function () {
            this._bound = true;
            invoke(this._rows, 'bindEvents');
            $(document).on('resource:add', this.updateResources.bind(this));
            this.$el.on('click', '.js-add-row', this.addRow.bind(this));
        };

        Sequencer.prototype.updateResources = function () {
            invoke(this._rows, 'updateResources');
        };

        Sequencer.prototype._setup = function () {
            this._currentBeat = 0;
            invoke(this._rows, 'setActive');
            this._updateDisplay();
        };

        Sequencer.prototype._updateDisplay = function () {
            this._display.innerHTML = pad(Math.floor(this._currentBeat / 4) + 1) + ' - ' + pad(this._currentBeat % 4 + 1);
        };

        Sequencer.prototype._step = function () {
            invoke(this._rows, 'setActive', this._currentBeat);
            this._updateDisplay(this);
            this._currentBeat = (this._currentBeat + 1) % this.length;
        };

        Sequencer.prototype.setTempo = function (newTempo) {
            this._tempo = newTempo;
        };

        Sequencer.prototype.start = function () {
            this.stop();
            this._schedule();
        };

        Sequencer.prototype.stop = function () {
            this._setup();
            if (this._timeout) {
                window.clearTimeout(this._timeout);
            }
        };

        Sequencer.prototype.getPattern = function () {
            return invoke(this._rows, 'getPattern');
        };

        Sequencer.prototype.loadPattern = function (pattern) {
            pattern.forEach(function (row, i) {
                this._rows[i].loadPattern(row);
            }.bind(this));
        };

        Sequencer.prototype.addRow = function () {
            var row = SequencerRow.create(this.length, this.context);

            row.output.connect(this.output);
            this._rows.push(row);
            this.$rows.append(row.$el);
            if (this._bound) {
                row.bindEvents();
            }
        };

        Sequencer.prototype.clear = function () {
            invoke(this._rows, 'clear');
        };

        return Sequencer;
        
    }());


    window.controllers.SequencerControls = (function () {

        function SequencerControls(el, sequencer) {
            this.$el = $(el);
            this.sequencer = sequencer;

            this.$el.find('.js-name').val(sequencer.name);
        }

        SequencerControls.prototype.bindEvents = function () {
            this.$el.on('click', '.js-play', this.sequencer.start.bind(this.sequencer));
            this.$el.on('click', '.js-stop', this.sequencer.stop.bind(this.sequencer));
            this.$el.on('change', '.js-tempo', this._handleTempoInputUpdate.bind(this));
            this.$el.on('click', '.js-clear', this._clear.bind(this));
            this.$el.on('click', '.js-save', this._save.bind(this));
            this.$el.on('change', '.js-name', this._handleNameUpdate.bind(this));
        };

        SequencerControls.prototype._clear = function () {
            this.sequencer.clear();
        };

        SequencerControls.prototype._save = function () {
            window.patterns.save(this.sequencer.name, this.sequencer.getPattern());
        };

        SequencerControls.prototype._handleTempoInputUpdate = function (event) {
            this.sequencer.setTempo(parseInt(event.target.value, 10));    
        };

        SequencerControls.prototype._handleNameUpdate = function (event) {
            this.sequencer.name = event.target.value;
        };

        SequencerControls.prototype.loadInitialPattern = function () {
            var recent = window.patterns.mostRecent();
            if (recent)  {
                this.sequencer.name = recent.name;
                this.sequencer.loadPattern(recent.pattern);
            } else {
                this.sequencer.name = 'Pattern ' + window.patterns.currentId();
            }
            this.$el.find('.js-name').val(this.sequencer.name);
        };

        return SequencerControls;
        
    }());

}(this, this.jQuery));