'use strict';
const { sanitizeEntity } = require('strapi-utils');
/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    let query = ctx.query;
    if (query._q) {
      entities = await strapi.services['blog-category'].search(query);
    } else {
      entities = await strapi.services['blog-category'].find(query);
    }

    return entities.map(entity => {
      const result = sanitizeEntity(entity, { model: strapi.models['blog-category'] })
      delete result.blogs
      return result
    });
  },
  async findOne(ctx) {
    if (ctx.params['0']) {
      delete ctx.params['0']
    }
    let entity = await strapi.services['blog-category'].findOne(ctx.params);
    if (!ctx.state.user || ctx.state.user.blocked) {
      const blogs = entity.blogs;
      entity.blogs = blogs.filter(blog => !blog.private);
    }
    return sanitizeEntity(entity, { model: strapi.models['blog-category'] });
  }
};
