(function (window) {

    function writeIndex(index) {
        window.localStorage.setItem('sequence_index', JSON.stringify(index));
    }

    function getIndex() {
        var index = window.localStorage.getItem('sequence_index');
        if (!index) {
            index = {
                files : {},
                nextId : 0
            };
            writeIndex(index);
        }
        return index;
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
        add : function (name, sequence) {
            var index = getIndex(),
                newEntry = {
                    name : name, 
                    id : index.nextId++
                };
            index.files[name] = newEntry;
            writeIndex(index);
        }
    };

}(this));