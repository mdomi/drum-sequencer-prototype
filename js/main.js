(function (window) {


    var document = window.document,
        MS_PER_S = 1000,
        S_PER_MIN = 60,
        slice = Array.prototype.slice;

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

    function getStorageBoolean(key) {
        return window.localStorage[key] === 'true';
    }

    function setStorageBoolean(key, value) {
        window.localStorage[key] = value; // will get converted into a string
    }

    function Square() {
        this.el = document.createElement('span');
        this.el.classList.add('sequencer-square');

        var isToggled = false;

        this.activate = function () {
            this.el.classList.add('sequencer-square-active');
        };

        this.deactivate = function () {
            this.el.classList.remove('sequencer-square-active');  
        };

        this.toggle = function () {
            this.el.classList.toggle('sequencer-square-toggle');
            isToggled = !isToggled;
        }.bind(this);

        this.toggled = function () {
            return isToggled;
        };

        this.bindEvents = function () {
            this.el.addEventListener('click', this.toggle, false);
        };

    }

    Square.create = function () {
        return new Square();
    };

    function pad(value) {
        if (value < 10) {
            return '0' + String(value);
        }
        return String(value);
    }

    function timestamp() {
        return new Date().getTime();
    }

    function SequencerRow(width, context) {
        this.el = document.createElement('div');

        var squares = [],
            active,
            input = document.createElement('input'),
            buffer;

        input.type = 'file';

        squares = times(width, Square.create);

        squares.forEach(function (square) {
            this.el.appendChild(square.el);
        }.bind(this));

        this.el.appendChild(input);

        function play() {
            if (buffer) {
                var source = context.createBufferSource();
                source.buffer = buffer;
                source.connect(context.destination);
                source.noteOn(0);
            }
        }

        this.bindEvents = function () {
            invoke(squares, 'bindEvents');
            input.addEventListener('change', function () {
                readAudioFile(input.files[0], context, function (audioBuffer) {
                    buffer = audioBuffer;
                });
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

    }

    SequencerRow.create = function (width, context) {
        return new SequencerRow(width, context);
    };

    function SequencerController(height) {

        this.el = document.createElement('div');

        var display = document.createElement('span'),
            tempo = 108,
            context = new webkitAudioContext(),
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

        this.el.appendChild(display);
        rows.forEach(function (row) {
            this.el.appendChild(row.el);
        }.bind(this));

        this.bindEvents = function () {
            invoke(rows, 'bindEvents');
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
    }

    function targetMatchesClass(event, className) {
        return event.target.classList.contains(className);
    }

    function readFile(file, cb) {
        var reader = new FileReader();

        reader.onload = function () {
            cb(reader.result);
        };

        reader.readAsArrayBuffer(file);
    }

    function readAudioFile(file, context, cb) {
        readFile(file, function (arrayBuffer) {
            context.decodeAudioData(arrayBuffer, cb);
        });
    }

    function ControlsController(el, sequencer) {
        this.el = el;

        this.bindEvents = function () {
            this.el.addEventListener('click', function (event) {
                if (targetMatchesClass(event, 'js-play')) {
                    sequencer.start();
                } else if (targetMatchesClass(event, 'js-stop')) {
                    sequencer.stop();
                }
            });
            this.el.addEventListener('change', function (event) {
                if (targetMatchesClass(event, 'js-tempo')) {
                    sequencer.setTempo(parseInt(event.target.value, 10));
                }
            });
        };
    }


    var controller = new SequencerController(3),
        controls = new ControlsController(
            document.getElementById('controls'), controller);

    document.getElementById('main').appendChild(controller.el);
    controller.bindEvents();
    controls.bindEvents();

}(this));
