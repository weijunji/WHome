module.exports = {
    resolver: {
        Mutation: {
            deleteFile: {
                description: 'Delete one file',
                resolver: 'plugins::upload.upload.destroy'
                /*
                async (obj, { file: upload, ...fields }) => {
                    const { id } = ctx.params;
                    const config = await strapi
                    .store({
                        environment: strapi.config.environment,
                        type: 'plugin',
                        name: 'upload',
                    })
                    .get({ key: 'provider' });

                    const file = await strapi.plugins['upload'].services.upload.fetch({ id });

                    if (!file) {
                    return ctx.notFound('file.notFound');
                    }

                    await strapi.plugins['upload'].services.upload.remove(file, config);

                    ctx.send(file);
                }
            }
            */
            }
        }
    }
}
