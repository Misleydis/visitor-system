/*
 * Runs an Express controller handler and returns its JSON response as a Promise.
 * Used by GraphQL resolvers to reuse existing controller logic.
 */
function runController(handler, req) {
  return new Promise((resolve, reject) => {
    let statusCode = 200;
    let settled = false;

    const res = {
      status(code) {
        statusCode = code;
        return res;
      },
      json(body) {
        if (settled) return res;
        settled = true;
        if (statusCode >= 400) {
          const error = new Error(body?.msg || 'Request failed');
          error.statusCode = statusCode;
          error.body = body;
          reject(error);
        } else {
          resolve(body);
        }
        return res;
      }
    };

    Promise.resolve(handler(req, res)).catch((err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
  });
}

function buildReq(context, { body = {}, params = {}, query = {} } = {}) {
  return {
    body,
    params,
    query,
    user: context.user,
    app: context.app,
    ip: context.req?.ip,
    header(name) {
      if (name === 'x-auth-token' && context.token) return context.token;
      return context.req?.headers?.[name.toLowerCase()];
    }
  };
}

module.exports = { runController, buildReq };
