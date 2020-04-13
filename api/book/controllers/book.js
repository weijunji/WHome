'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
module.exports = {
    async create(ctx) {
        let entity;
        try{
            if (ctx.is('multipart')) {
                const { data, files } = parseMultipartData(ctx);
                entity = await strapi.services.book.create(data, { files });
            } else {
                entity = await strapi.services.book.create(ctx.request.body);
            }
        } catch (err) {
            if(err.code === 11000) {
                return ctx.throw(409, 'book already exist');
            }
            return ctx.throw(500, err);
        }
        return sanitizeEntity(entity, { model: strapi.models.book });
    },
}
