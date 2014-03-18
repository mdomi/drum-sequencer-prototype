(function (window, $) {

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
                    if (cb) {
                        cb({
                            name : resource.name,
                            buffer : resource.buffer
                        });
                    }
                });
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

    function playResource(key, context) {
        var resource = resources.get(key),
            source = context.createBufferSource();
        source.buffer = resource.buffer;
        source.connect(context.destination);
        source.noteOn(0);
    }

    function ResourcesController(el, context) {
        this.$el = $(el);
        this.context = context;

        function renderList() {
            var rows = resources.list().map(function (key) {
                return createTableRow(resources.get(key));
            });

            this.$el.find('tbody').html(rows);
        }

        $(document).on('resource:add', renderList.bind(this));

        this.$el.on('change', '[type="file"]', function () {
            var input = this;
            resources.load(input.files[0], context, function () {
                input.value = null;
                $(input).trigger('resource:add');
            });
        }).on('click', '.btn', function () {
            playResource(this.dataset.resourceKey, context);
        });

        renderList.call(this);

    }

    window.controllers = window.controllers || {};
    window.controllers.Resources = ResourcesController;

}(this, this.jQuery));