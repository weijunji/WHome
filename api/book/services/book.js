'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    delete(params) {
        const ObjectId = require('mongoose').Types.ObjectId;
        strapi.query('file', 'upload').model.findOneAndUpdate({
                'related.ref': {
                    '$in': [
                        new ObjectId(params.id)
                    ]
                }
            }, 
            { $pull: { 'related' : { ref: new ObjectId(params.id) } } },
            (err) => { if (!err) console.log(err); }
        );
        return strapi.query('book').delete(params);
    }
};
