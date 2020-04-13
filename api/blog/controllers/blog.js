'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  async create(ctx) {
    const data = ctx.request.body
    const tags = []
    for (const tag of data.tags) {
      if (tag.type === 'exist') {
        tags.push(tag.id)
      } else {
        const newTag = await strapi.services['blog-tag'].create({ name: tag.name })
        tags.push(newTag.id)
      }
    }
    ctx.request.body.tags = tags

    let entity
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx)
      entity = await strapi.services.blog.create(data, { files })
    } else {
      entity = await strapi.services.blog.create(ctx.request.body)
    }
    return sanitizeEntity(entity, { model: strapi.models.blog })
  },
  async update(ctx) {
    const data = ctx.request.body
    const tags = []
    for (const tag of data.tags) {
      if (tag.type === 'exist') {
        tags.push(tag.id)
      } else {
        const newTag = await strapi.services['blog-tag'].create({ name: tag.name })
        tags.push(newTag.id)
      }
    }
    ctx.request.body.tags = tags

    let entity
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.blog.update(ctx.params, data, {
        files,
      })
    } else {
      entity = await strapi.services.blog.update(
        ctx.params,
        ctx.request.body
      )
    }
    return sanitizeEntity(entity, { model: strapi.models.blog });
  },
  async find(ctx) {
    let entities;
    let query = ctx.query;
    if (!ctx.state.user || ctx.state.user.blocked) {
      query['private'] = 'false';
    }
    if (query._q) {
      entities = await strapi.services.blog.search(query);
    } else {
      entities = await strapi.services.blog.find(query);
    }

    return entities.map(entity => {
      const result = sanitizeEntity(entity, { model: strapi.models.blog })
      delete result.content
      return result
    });
  },
  async findOne(ctx) {
    if (ctx.params['0']) {
      delete ctx.params['0']
    }
    let entity = await strapi.services.blog.findOne(ctx.params);
    if (!ctx.state.user || ctx.state.user.blocked) {
      if (entity && entity.private) {
        entity = null
      }
    }
    return sanitizeEntity(entity, { model: strapi.models.blog });
  },
  count(ctx) {
    let query = ctx.query;
    if (!ctx.state.user || ctx.state.user.blocked) {
      query['private'] = 'false';
    }
    if (query._q) {
      return strapi.services.blog.countSearch(query);
    }
    return strapi.services.blog.count(query);
  }
};
