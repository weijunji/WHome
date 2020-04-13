const _ = require('lodash');
const crypto = require('crypto');
const fetch = require('node-fetch');
const fileType = require('file-type');
const uuid = require('uuid/v4');

function niceHash(buffer) {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\//g, '-')
    .replace(/\+/, '_');
}

async function bufferizeURL (url) {
    const filename = _.last(url.split('/'));
    const res = await fetch(url);
    const buffer = await res.buffer();
    const { ext, mime } = await fileType.fromBuffer(buffer);
    return {
        name: filename,
        sha256: niceHash(buffer),
        hash: uuid().replace(/-/g, ''),
        ext: '.' + ext,
        buffer,
        mime,
        size: (buffer.length / 1000).toFixed(2),
    };
}

module.exports = {
  async upload(ctx) {
    const uploadService = strapi.plugins.upload.services.upload;

    // Retrieve provider configuration.
    const config = await uploadService.getConfig();

    // Verify if the file upload is enable.
    if (config.enabled === false) {
      return ctx.badRequest(
        null,
        [{
          messages: [{
            id: 'Upload.status.disabled',
            message: 'File upload is disabled',
          }, ],
        }, ]
      );
    }
    // Extract optional relational data.
    const {
      refId,
      ref,
      source,
      field,
      path
    } = ctx.request.body || {};
    const {
      files = {}
    } = ctx.request.files || {};

    let buffers = []

    if (_.isEmpty(files)) {
        const url = ctx.request.body.url;
        if (url) {
            const buffer = await bufferizeURL(url);
            buffers.push(buffer);
        } else {
            return ctx.badRequest(null, [{
                messages: [{
                id: 'Upload.status.empty',
                message: 'Files are empty'
                }],
            }, ]);
        }
    } else {
        // Transform stream files to buffer
        buffers = await uploadService.bufferize(files);
    }

    const enhancedFiles = buffers.map(file => {
      if (file.size > config.sizeLimit) {
        return ctx.badRequest(null, [{
          messages: [{
            id: 'Upload.status.sizeLimit',
            message: `${file.name} file is bigger than limit size!`,
            values: {
              file: file.name
            },
          }, ],
        }, ]);
      }

      // Add details to the file to be able to create the relationships.
      if (refId && ref && field) {
        Object.assign(file, {
          related: [{
            refId,
            ref,
            source,
            field,
          }, ],
        });
      }

      // Update uploading folder path for the file.
      if (path) {
        Object.assign(file, {
          path,
        });
      }

      return file;
    });

    // Something is wrong (size limit)...
    if (ctx.status === 400) {
      return;
    }

    const uploadedFiles = await uploadService.upload(enhancedFiles, config);

    // Send 200 `ok`
    ctx.send(uploadedFiles);
  },
}
