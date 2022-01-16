const fs = require('fs');
const path = require('path');
const storageFilePath = path.join(__dirname,'..','storage.json');

exports.storage = {}

function load() {
    if (!fs.existsSync(storageFilePath)) return save();
    exports.storage = JSON.parse(fs.readFileSync(storageFilePath).toString());
    save();
}

function save() {
    fs.writeFileSync(storageFilePath, JSON.stringify(exports.storage));
}

function deleteFromArray(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
}

exports.load = load
exports.save = save
exports.deleteFromArray = deleteFromArray
