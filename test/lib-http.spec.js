const mockExpress = require('mock-express');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const assert = require('chai').assert;

var sandbox;

describe('Http Library', () => {
    before(() => {
      chai.use(sinonChai);
      chai.should();
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.http = require('../src/libs/http.js');
        sandbox.response = {
            statusCode: 0,
            setHeader: () => {},
            end: () => {}
        }
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('isClientRequest', () => {
        it('should return true if meta request is defined', () => {
            const context = {request : {meta : {request : 'request'}}};
            const result = sandbox.http.isClientRequest(context);
            assert.isTrue(result);
        });

        it('should return false if meta request is undefined', () => {
            const context = {request : {meta : {}}};
            const result = sandbox.http.isClientRequest(context);
            assert.isFalse(result);
        });
    });

    describe('sendAPIError', () => {
        it('should call response end', () => {
            const responseEndStub = sinon.stub(sandbox.response, 'end');
            sandbox.http.sendAPIError(sandbox.response);
            responseEndStub.should.have.been.calledOnce;
        });

    });

    describe('sendAPIData', () => {
        it('should call response end', () => {
            const responseEndStub = sinon.stub(sandbox.response, 'end');
            sandbox.http.sendAPIData(sandbox.response);
            responseEndStub.should.have.been.calledOnce;
        });
    });

    describe('checkRequestParams', () => {
        it('should not thow error if params are ok', () => {
            const record = {param1 : 'foo', param2: 'bar'};
            const params = ['param1', 'param2'];
            try {
                sandbox.http.checkRequestParams(params, record, 'en');
                assert(true, 'no error throw');
            } catch (Error) {
                assert(false, 'error throw');
            }
        });

        it('should throw BadRequestError if params are not ok', () => {
            const record = {param1 : 'foo', param2: 'bar'};
            const params = ['param1', 'param3'];
            try {
                sandbox.http.checkRequestParams(params, record, 'en');
                assert(false, 'no error throw');
            } catch (error) {
                assert.equal(error.name, "BadRequestError");
            }
        });
    });
});
