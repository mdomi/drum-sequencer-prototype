(function (window, $, util) {
    function LevelMeter(context, options) {
        options = options || {};

        this.el = document.createElement('canvas');
        this.el.width = options.width || 400;
        this.el.height = options.height || 20;
        this.orientation = options.orientation || LevelMeter.HORIZONTAL;
        this.context = this.el.getContext('2d');
        this.$el = $(this.el);
        this.processor = context.createScriptProcessor(options.bufferSize || 1024, 1, 1);
        this.processor.onaudioprocess = (function (e) {
            this.setLevel(util.max(e.inputBuffer.getChannelData(0)));
        }).bind(this);
    }

    LevelMeter.prototype._createGradient = function () {
        var gradient;
        if (this.orientation === LevelMeter.HORIZONTAL) {
            gradient = this.context.createLinearGradient(this.el.width, 0, 0, 0);
        } else if (this.orientation === LevelMeter.VERTICAL) {
            gradient = this.context.createLinearGradient(0, 0, 0, this.el.height);
        }
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.25, 'orange');
        gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'green');
        return gradient;
    };

    LevelMeter.prototype.fill = function (color) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.el.width, this.el.height);
    };

    LevelMeter.prototype.setLevel = function (level) {
        var db = util.toDB(level),
            gradient = this._createGradient();

        this.fill('#555');

        this.context.fillStyle = gradient;
        if (this.orientation === LevelMeter.HORIZONTAL) {
            this.context.fillRect(0, 0, this.el.width * (1 - (db/-72)), this.el.height);
        } else if (this.orientation === LevelMeter.VERTICAL) {
            this.context.fillRect(0, this.el.height * (db/-72), this.el.width, this.el.height * (1 - (db/-72)));
        }
    };

    LevelMeter.HORIZONTAL = 0;
    LevelMeter.VERTICAL = 1;

    window.controls = window.controls || {};
    window.controls.LevelMeter = LevelMeter;

}(this, this.jQuery, this.util));