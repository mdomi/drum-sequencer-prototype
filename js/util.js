(function (window) {

    var util = window.util = window.util || {};

    util.toDB = function (value) {
        return 20 * Math.log(Math.max(value, Math.pow(10, -72/20))) / Math.LN10;
    };

    util.clear = function (buffer) {
        var length = buffer.length;
        for (var i = 0; i < length; i++) {
            buffer[i] = 0;
        }
    };

    util.max = function (input) {
        var length = input.length,
            max = 0;

        for (var i = 0; i < length; i++) {
            max = input[i] > max ? input[i] : max;
        }
        return max;
    };

    util.average = function (input) {
        var length = input.length;
        var sum = 0;

        for (var i = 0; i < length; i++) {
            sum = input[i] > sum ? input[i] : sum;
        }
        return util.toDB(sum);
    };

}(this));