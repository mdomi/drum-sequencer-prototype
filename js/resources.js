(function (window, $, async) {

    function last(path) {
        var parts = path.split('/');
        return parts[parts.length - 1];
    }

    var document = window.document,
        resources = window.resources = (function () {
        var files = {};

        function readFile(file, cb) {
            var reader = new window.FileReader();

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

        return {
            list : function () {
                return Object.keys(files).sort();
            },
            get : function (name) {
                if (files.hasOwnProperty(name)) {
                    return files[name];
                }
            },
            load : function (file, context, cb) {
                return readAudioFile(file, context, function (audioBuffer) {
                    var resource = files[file.name] = {
                        name : file.name,
                        buffer : audioBuffer
                    };

                    $(document).trigger('resource:add');
                    if (cb) {
                        cb({
                            name : resource.name,
                            buffer : resource.buffer
                        });
                    }
                });
            },
            read : function data(path, context, cb) {
                var request = new XMLHttpRequest();
                request.open('GET', path, true); // Path to Audio File
                request.responseType = 'arraybuffer'; // Read as Binary Data

                request.onload = function() {
                    context.decodeAudioData(request.response, function (buffer) {
                        var resource = {
                            name : last(path),
                            buffer : buffer
                        };

                        files[resource.name] = resource;
                        $(document).trigger('resource:add');

                        if (cb) {
                            cb({
                                name : resource.name,
                                buffer : resource.buffer
                            });
                        }
                    });
                };

                request.send();
            }
        };
    }());

    function createTableCell(text) {
        return wrap(document.createTextNode(String(text)), 'td');
    }

    function wrap(element, type) {
        var wrapper = document.createElement(type);
        wrapper.appendChild(element);
        return wrapper;
    }

    function createButton(text) {
        var button = document.createElement('button');
        button.appendChild(document.createTextNode(String(text)));
        button.classList.add('btn');
        button.classList.add('btn-default');
        button.classList.add('btn-sm');
        return button;
    }

    function createPlayButton(resource) {
        var button = createButton('Play');
        button.dataset.resourceKey = resource.name;
        return button;
    }

    function formatTime(time) {
        return (Math.floor(100 * time) / 100.0) + 's';
    }

    function createTableRow(resource) {
        return $(document.createElement('tr'))
            .append(wrap(createPlayButton(resource), 'td'))
            .append(createTableCell(resource.name))
            .append(createTableCell(formatTime(resource.buffer.duration)))
            .append(createTableCell(resource.buffer.sampleRate))
            .append(createTableCell(resource.buffer.numberOfChannels)).get(0);
    }

    function ResourcesController(el, context) {

        this.$el = $(el);
        this.context = context;
        this.gainNode = context.createGainNode();
        this.gainNode.gain.value = 0.5;
        this.gainNode.connect(this.context.destination);

        $(document).on('resource:add', this._renderList.bind(this));

        this.$el.on('change', '[type="file"]', this._triggerFileLoads.bind(this))
            .on('click', '.btn', this.playResource.bind(this));

        this._renderList();
    }

    function clearFileInput(input) {
        input.value = null;
        input.disabled = false;
    }

    ResourcesController.prototype._triggerFileLoads = function (event) {
        var input = event.target;
        input.disabled = true;
        async.forEach(input.files, this._loadFile.bind(this), clearFileInput.bind(this, input));
    };

    ResourcesController.prototype._loadFile = function (file, cb) {
        setTimeout(function () {
            resources.load(file, this.context, cb);    
        }.bind(this));
    };

    ResourcesController.prototype.playResource = function (event) {
        var resource = resources.get(event.target.dataset.resourceKey),
            source = this.context.createBufferSource();
        source.buffer = resource.buffer;
        source.connect(this.gainNode);
        source.noteOn(0);
    };

    ResourcesController.prototype._renderList = function () {
        var rows = resources.list().map(function (key) {
            return createTableRow(resources.get(key));
        });

        this.$el.find('tbody').html(rows);
    };

    window.controllers = window.controllers || {};
    window.controllers.Resources = ResourcesController;

}(this, this.jQuery, this.async));