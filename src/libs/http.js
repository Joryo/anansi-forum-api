'use strict';

let {errors: {BadRequestError}, message} = require('fortune');

/**
 * Http library
 */
class Http {
    /**
     * Indicates if the request come from external client
     * @param {Object} context - Context fortune.
     * @return {Bool}
     */
    isClientRequest(context) {
        if (typeof (context.request.meta.request) == 'undefined') {
            return false;
        }
        return true;
    }
    /**
     * Send JsonApi formatted error
     * @param {Object} response - HTTP Response.
     * @param {Number} code - HTTP Error code.
     * @param {String} error - Error message.
     * @return {Object} Response
     */
    sendAPIError(response, code, error) {
        if (typeof (code) == 'undefined') {
            if (typeof (error) == 'undefined' || typeof (error.httpCode) == 'undefined') {
                code = 500;
            } else {
                code = error.httpCode;
                delete error.httpCode;
            }
        }
        response.statusCode = code;
        response.setHeader('content-type', 'application/vnd.api+json');
        return response.end(JSON.stringify({
            jsonapi: {
                'version': '1.0',
            },
            errors: [
                {
                    title: 'Error',
                    detail: error,
                },
            ],
        }));
    }
    /**
     * Send JsonApi formatted data
     * @param {Object} response - HTTP Response.
     * @param {Number} code - HTTP code.
     * @param {Object} data - Data.
     * @return {Object} Response
     */
    sendAPIData(response, code, data) {
        response.statusCode = code;
        response.setHeader('content-type', 'application/vnd.api+json');
        return response.end(JSON.stringify({
            jsonapi: {
                'version': '1.0',
            },
            data: data,
        }));
    }
    /**
     * Check POST parameters on a request
     * @param  {array} params - Parameters list
     * @param  {array} record - Request parameters (fortune)
     * @param  {string} language - User language
     * @throw {BadRequestError} Missing POST parameters
     */
    checkRequestParams(params, record, language) {
        for (let field of params) {
            if (!(field in record)) {
                throw new BadRequestError(message('MissingField', language, {field}));
            }
        }
    }
}

module.exports = new Http();
