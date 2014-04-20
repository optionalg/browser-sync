"use strict";

var browserSync = require("../../../lib/index");

var assert      = require("chai").assert;
var sinon       = require("sinon");
var File        = require("vinyl");

describe("Reload method", function () {

    var emitterStub;
    before(function(){
        emitterStub = sinon.stub(browserSync.emitter, "emit");
    });
    afterEach(function () {
        emitterStub.reset();
    });
    after(function () {
        emitterStub.restore();
    });

    it("should be callable with no args & perform a reload", function () {
        browserSync.reload();
        sinon.assert.calledWithExactly(emitterStub, "browser:reload");
    });
    it("should accept a file path as a string", function () {
        browserSync.reload("css/core.css");
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {path: "css/core.css"});
    });
    it("should accept an array of filepaths", function () {
        browserSync.reload(["css/core.css", "index.html"]);
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {path: "css/core.css"});
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {path: "index.html"});
    });

    describe("Returning a stream", function () {
        it("should handle a sinlge file changed", function () {
            var stream = browserSync.reload({stream:true});
            stream.write(new File({path: "styles.css"}));
            stream.end();
            sinon.assert.calledWithExactly(emitterStub, "file:changed", {path: "styles.css"});
        });
        it("should accept multiple files in stream", function(){
            var stream = browserSync.reload({stream: true});
            stream.write(new File({path: "styles.css"}));
            stream.write(new File({path: "styles2.css"}));
            stream.end();
            sinon.assert.calledWithExactly(emitterStub, "file:changed", {path: "styles.css"});
            sinon.assert.calledWithExactly(emitterStub, "file:changed", {path: "styles2.css"});
        });
        it("should reload browser if true given as arg", function(){
            var stream = browserSync.reload({stream: true, once: true});
            stream.write(new File({path: "styles.css"}));
            stream.write(new File({path: "styles2.css"}));
            stream.write(new File({path: "styles3.css"}));
            stream.end();
            sinon.assert.calledOnce(emitterStub);
            sinon.assert.calledWithExactly(emitterStub, "browser:reload");
        });
        it("should be able to call .reload after a stream", function () {

            browserSync.reload();
            sinon.assert.calledWithExactly(emitterStub, "browser:reload");

            var stream = browserSync.reload({stream: true});
            stream.write(new File({path: "styles.css"}));
            stream.end();
            sinon.assert.calledWithExactly(emitterStub, "file:changed", {path: "styles.css"});

        });
    });
});