var flow = require('../../lib/async-flow');
var async = require('async');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
chai.use(sinonChai);
chai.should();
var expect = chai.expect;

describe('serial', function() {
    it('should do calc in correct order', function(done) {
        var x = 2;
        flow.serial([
            (next) => {
                next(null, x * 3);
            },
            (x, next) => {
                next(null, x + 1);
            }
        ], (err, result) => {
            result.should.equal(7);
            done();
        })
    });
    it('should call final cb on error', function (done) {
        var x = 3;
        flow.serial([
            (next) => {
                next(5, x * 3);
            },
            (x, next) => {
                next(null, x + 1);
            }
        ], (err, result) => {
            err.should.equal(5);
            result.should.equal(9);
            done();
        })
    });
    it('should call final cb at once', function () {
        var callback = sinon.spy();
        flow.serial([], callback);
        callback.should.have.been.called;
    });
    it('should call final cb once', function (done) {
        var callback = sinon.spy((err, result) => {
            callback.should.have.been.calledOnce;
            done();
        });
        var func1 = sinon.spy((next) => {
            next(null, 1);
        });
        var func2 = sinon.spy((arg, next) => {
            next(null, arg);
        });
        flow.serial([func1, func2], callback);
    });
});

describe('parallel', function() {
    it('should run parallel', function (done) {
        var longRunFunc = function (timeToRun) {
            return (callback) => {
                setTimeout(() => {
                    callback(null, new Date());
                }, timeToRun);
            };
        };
        async.parallel([
            longRunFunc(200),
            longRunFunc(100)
        ], (err, results) => {
            results[0].should.be.above(results[1]);
            done();
        }
        );
    });
    it('should output an array', function (done) {
        async.parallel([], (err, result) => {
            result.should.be.an('array');
            done();
        })
    });
    it('should run all functions once', function () {
        var finalCb = sinon.spy();
        var func1 = sinon.spy((next) => {
            next(null, 1);
        });
        var func2 = sinon.spy((next) => {
            next(null, 2);
        });
        async.parallel([func1, func2], finalCb);
        finalCb.should.be.calledOnce;
        func1.should.be.calledOnce;
        func2.should.be.calledOnce;
    });
    it('should put func result in the correct order', function (done) {
        var longRunFunc = function (timeToRun) {
            return (callback) => {
                setTimeout(() => {
                    callback(null, new Date());
                }, timeToRun);
            };
        };
        async.parallel([
                (callback) => {
                    setTimeout(() => {
                        callback(null, 1);
                    }, 200);
                },
                (callback) => {
                    setTimeout(() => {
                        callback(null, 2);
                    }, 100);
                }
            ],
            (err, results) => {
                results[0].should.be.eql(1);
                results[0].should.be.eql(1);
                done();
            }
        );
    });
    it('should all func finished before final cb', function () {
        var finalCb = sinon.spy();
        var func1 = sinon.spy((next) => {
            next(null, 1);
        });
        var func2 = sinon.spy((next) => {
            next(null, 2);
        });
        async.parallel([func1, func2], finalCb);
        finalCb.should.have.been.calledAfter(func1);
        finalCb.should.have.been.calledAfter(func2);
    });
});

describe('map', function() {
    it('should do correct calc', function (done) {
        var values = [1, 2];
        var func = (val, cb) => {
            cb(null, val * 2);
        };
        var finalCb = (err, results) => {
            results[0].should.be.eql(2);
            results[1].should.be.eql(4);
            done();
        };
        flow.map(values, func, finalCb);
    });
    it('should run parallel', function (done) {
        var values = [2, 1];
        var func = (val, cb) => {
            setTimeout(() => {
                cb(null, new Date());
            }, 200 * val);
        };
        var finalCb = (err, results) => {
            results[0].should.be.above(results[1]);
            done();
        };
        flow.map(values, func, finalCb);
    });
    it('should output an array', function (done) {
        var values = [];
        var func = (val, cb) => {
            cb(null, val);
        };
        var finalCb = (err, results) => {
            results.should.be.an('array');
            done();
        };
        flow.map(values, func, finalCb);
    });
    it('should run final cb once', function () {
        var finalCb = sinon.spy();
        var values = [];
        var func = (val, cb) => {
            cb(null, val);
        };
        flow.map(values, func, finalCb);
        finalCb.should.be.calledOnce;
    });
});

describe('makeAsync', function () {
    it('should return function', function () {
        var syncFunction = function (x) {
            return x + 1;
        };
        var asyncFunction = flow.makeAsync(syncFunction);
        asyncFunction.should.be.a('function');
    });
    it('should call callback', function () {
        var syncFunction = function (x) {
            return x + 1;
        };
        var asyncFunction = flow.makeAsync(syncFunction);
        var callback = sinon.spy((err, result) => {});
        asyncFunction(1, callback);
        callback.should.be.called;
    });
    it('should put error in callback', function () {
        var syncFunction = function (x) {
            throw new Error('5');
        };
        var asyncFunction = flow.makeAsync(syncFunction);
        var callback = sinon.spy((err, result) => {});
        asyncFunction(1, callback);
        callback.should.be.calledWith(new Error('5'));
    });
});

describe('parallelLimit', function() {
    it('should run parallel', function (done) {
        var longRunFunc = function (timeToRun) {
            return (callback) => {
                setTimeout(() => {
                    callback(null, new Date());
                }, timeToRun);
            };
        };
        async.parallelLimit([
                longRunFunc(200),
                longRunFunc(100)
            ],
            2,
            (err, results) => {
                results[0].should.be.above(results[1]);
                done();
            }
        );
    });
    it('should respect the limit', function (done) {
        var longRunFunc = function (timeToRun) {
            return (callback) => {
                setTimeout(() => {
                    callback(null, new Date());
                }, timeToRun);
            };
        };
        async.parallelLimit([
            longRunFunc(500),
            longRunFunc(100)
        ],
            1,
            (err, result) => {
                // Отработают последовательно
                result[1].should.be.above(result[0]);
                done();
            }
        )
    });
});
