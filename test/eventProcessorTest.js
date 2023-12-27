// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
const chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);

const assert = chai.assert;
const expect = chai.expect;

// Sinon is a library used for mocking or verifying function calls in JavaScript.
const sinon = require('sinon');

// we gonna stub some functions here
// const admin = require('firebase-admin');
// const functions = require('firebase-functions');
// const test = require('firebase-functions-test')();
// const {ReferenceMock, DatabaseMock, SnapshotMock} = require('fire-simple-mocks');
// const moment = require('moment');

// const theModule = require('../');
const EventProcessor = require('../src/js/event-processor.js');

describe('Event Processor', () => {
    let ep;

    beforeEach(()=>{
        ep = new EventProcessor();
    })
    describe("Threshold",()=>{        
        it("is calculated for positive values",()=>{
            const thresholds = "0,1,4,5"
            expect(ep.valueToThresholdId(thresholds, 0)).eq(0);
            expect(ep.valueToThresholdId(thresholds, 1)).eq(1);
            expect(ep.valueToThresholdId(thresholds, 2)).eq(1);
            expect(ep.valueToThresholdId(thresholds, 3)).eq(1);
            expect(ep.valueToThresholdId(thresholds, 4)).eq(2);
            expect(ep.valueToThresholdId(thresholds, 5)).eq(3);
            expect(ep.valueToThresholdId(thresholds, 6)).eq(3);
            expect(ep.valueToThresholdId(thresholds, 106)).eq(3);
        }),
        it("is throws an error when value is lower than threshold start",()=>{
            const thresholds = "0,1,2,3"
            expect(()=>{ep.valueToThresholdId(thresholds, -4)}).to.throw("Can't calculate threshold id for");  
            
        })
        it("is calculated for negative values",()=>{
            const thresholds = "-10,-3,2,5,8"
            expect(ep.valueToThresholdId(thresholds, -10)).eq(0);
            expect(ep.valueToThresholdId(thresholds, -5)).eq(0);
            expect(ep.valueToThresholdId(thresholds, -3)).eq(1);
            expect(ep.valueToThresholdId(thresholds, -2)).eq(1);
            expect(ep.valueToThresholdId(thresholds, 2)).eq(2);
            expect(ep.valueToThresholdId(thresholds, 3)).eq(2);
            expect(ep.valueToThresholdId(thresholds, 5)).eq(3);
            expect(ep.valueToThresholdId(thresholds, 6)).eq(3);
            expect(ep.valueToThresholdId(thresholds, 8)).eq(4);
        }),
        it("it is resistant for whitespaces in threshold array definition",()=>{            
            const thresholds = " 0 ,    1 ,    4 , 5  "
            expect(ep.valueToThresholdId(thresholds, 0)).eq(0);
            expect(ep.valueToThresholdId(thresholds, 1)).eq(1);
            expect(ep.valueToThresholdId(thresholds, 2)).eq(1);
            expect(ep.valueToThresholdId(thresholds, 3)).eq(1);
            expect(ep.valueToThresholdId(thresholds, 4)).eq(2);
            expect(ep.valueToThresholdId(thresholds, 5)).eq(3);
            expect(ep.valueToThresholdId(thresholds, 6)).eq(3);
            expect(ep.valueToThresholdId(thresholds, 106)).eq(3);

        })
        it("it handles multiple threshold sizes",()=>{
            const thresholds1 = "0,1,4,5"
            const thresholds2 = "0,1,4,5,9"
            expect(ep.valueToThresholdId(thresholds1, 0)).eq(0);
            expect(ep.valueToThresholdId(thresholds1, 5)).eq(3);
            expect(ep.valueToThresholdId(thresholds1, 7)).eq(3);
            expect(ep.valueToThresholdId(thresholds1, 9)).eq(3);
            expect(ep.valueToThresholdId(thresholds1, 119)).eq(3);

            expect(ep.valueToThresholdId(thresholds2, 0)).eq(0);
            expect(ep.valueToThresholdId(thresholds2, 5)).eq(3);
            expect(ep.valueToThresholdId(thresholds2, 7)).eq(3);
            expect(ep.valueToThresholdId(thresholds2, 9)).eq(4);
            expect(ep.valueToThresholdId(thresholds2, 119)).eq(4);
        })
    })
})
