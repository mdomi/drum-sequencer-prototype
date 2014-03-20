(function (window, $) {

    var document = window.document;

    function writeIndex(index) {
        window.localStorage.setItem('sequence_index', JSON.stringify(index));
        return index;
    }

    function getIndex() {
        var index = window.localStorage.getItem('sequence_index');
        if (!index) {
            index = {
                files : {},
                nextId : 1
            };
            return writeIndex(index);
        }
        return JSON.parse(index);
    }

    window.patterns = {
        get : function (name) {
            var index = getIndex();
            if (index.files.hasOwnProperty(name)) {
                return index.files[name];
            }
        },
        list : function () {
            var index = getIndex();
            return index.files;
        },
        save : function (name, pattern) {
            var index = getIndex(),
                newEntry = {
                    name : name,
                    pattern : pattern,
                    id : ++index.nextId,
                    saved : new Date().getTime()
                };
            if (index.files.hasOwnProperty(name)) {
                newEntry.id = index.files[name].id;
            }
            index.files[name] = newEntry;
            writeIndex(index);
            $(document).trigger('pattern:add');
        },
        currentId : function () {
            return getIndex().nextId;
        },
        mostRecent : function () {
            var index = getIndex();
            return Object.keys(index.files).reduce(function (result, pattern) {
                var current = index.files[pattern];
                if (!result) {
                    return current;
                }

                if (current.saved > result.saved) {
                    return current;
                }
                return result;
            }, null);
        },
    };

}(this, this.jQuery));