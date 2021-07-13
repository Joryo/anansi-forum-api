let {methods} = require('fortune');
let httpLib = require('../../libs/http.js');

module.exports = {
    input: (context, record) => {
        let {request: {method}} = context;
        switch (method) {
            case methods.create:
                httpLib.checkRequestParams(['text', 'color'], record);
                let {text, color} = record;

                return Object.assign({text, color});
        }
    },
};
