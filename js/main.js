(function (window) {


    var document = window.document,
        MS_PER_S = 1000,
        S_PER_MIN = 60;

    function timePerBeat(bpm) {
        return MS_PER_S * S_PER_MIN / bpm;
    }

    function times(x, fn) {
        var results = [], i = 0, args = Array.prototype.slice.call(arguments, 2);
        for (i = 0; i < x; i++) {
            results.push(fn.apply(null, args));
        }
        return results;
    }

    function Square() {
        this.el = document.createElement('span');
        this.el.classList.add('sequencer-square');

        var toggled = false;

        this.activate = function () {
            this.el.classList.add('sequencer-square-active');
        };

        this.deactivate = function () {
            this.el.classList.remove('sequencer-square-active');  
        };

        this.toggle = function () {
            this.el.classList.toggle('sequencer-square-toggle');
            toggled = !toggled;
        }.bind(this);

        this.toggled = function () {
            return toggled;
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

    function SequencerRow(width) {
        this.el = document.createElement('div');

        var squares = [],
            active;

        squares = times(width, Square.create);

        squares.forEach(function (square) {
            this.el.appendChild(square.el);
        }.bind(this));

        this.bindEvents = function () {
            squares.forEach(function (square) {
                square.bindEvents();
            });
        };

        this.setActive = function (index) {
            if (active) {
                active.deactivate();
            }
            active = squares[index];
            active.activate();
        };

        this.clearActive = function () {
            if (active) {
                active.classList.remove('sequencer-square-active');
            }
            active = (void 0);
        };

    }

    SequencerRow.create = function (width) {
        return new SequencerRow(width);
    };

    function SequencerController(height) {

        this.el = document.createElement('div');

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
            rows = times(height, SequencerRow.create, length);

        this.el.appendChild(display);
        rows.forEach(function (row) {
            this.el.appendChild(row.el);
        }.bind(this));

        this.bindEvents = function () {
            rows.forEach(function (row) {
                row.bindEvents();
            });
        };

        function setup() {
            currentBeat = 0;
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
            setup();
            schedule();
        };

        this.stop = function () {
            if (timeout) {
                window.clearTimeout(timeout);
            }
        };
    }


    var controller = new SequencerController(3);

    document.getElementById('main').appendChild(controller.el);
    controller.bindEvents();

    controller.start();

}(this));
