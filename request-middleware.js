const requestMiddleware = (request, response, next) => {
    const requestId = Math.random();
    request.id = requestId;

    next();
}

module.exports = {
    requestMiddleware: requestMiddleware
}