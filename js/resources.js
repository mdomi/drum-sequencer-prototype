(function (window) {

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
        var tdNode = document.createElement('td');
        tdNode.appendChild(document.createTextNode(String(text)));
        return tdNode;
    }

    function createButton(text) {
        var button = document.createElement('button');
        button.appendChild(document.createTextNode(String(text)));
        button.classList.add('btn');
        button.classList.add('btn-default');
        return button;
    }

    function createPlayButton(resource) {
        var button = createButton('Play');
        button.dataset.resourceKey = resource.name;
        return button;
    }

    function createTableRow(resource) {
        var trNode = document.createElement('tr');
        trNode.appendChild(createPlayButton(resource));
        trNode.appendChild(createTableCell(resource.name));
        trNode.appendChild(createTableCell(resource.buffer.duration));
        trNode.appendChild(createTableCell(resource.buffer.sampleRate));
        trNode.appendChild(createTableCell(resource.buffer.numberOfChannels));
        return trNode;
    }

    function playResource(key, context) {
        var resource = resources.get(key),
            source = context.createBufferSource();
        source.buffer = resource.buffer;
        source.connect(context.destination);
        source.noteOn(0);
    }

    function ResourcesController(el, context) {
        this.el = el;
        this.context = context;

        function renderList() {
            var tbody = el.querySelector('tbody');
            tbody.innerHTML = '';
            resources.list().forEach(function (key) {
                tbody.appendChild(createTableRow(resources.get(key)));
            });
        }

        this.el.addEventListener('change', function (event) {
            var input = event.target;
            resources.load(input.files[0], context, function () {
                input.value = null;
                renderList();
            });
        });

        this.el.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                playResource(event.target.dataset.resourceKey, context);
            }
        });

        renderList();

    }

    window.controllers = window.controllers || {};
    window.controllers.Resources = ResourcesController;

}(this));