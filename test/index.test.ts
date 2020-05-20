import * as Mocha from "mocha";
import { OfflineTokenGenerator, TimeGenerator } from "../index";
import chai from "chai"

let otg : OfflineTokenGenerator;
let time: number[] = [0];

let mockTimeGenerator: TimeGenerator = {
    getTime: () => {
        return time[0];
    }
}
Mocha.describe("OfflineTokenGenerator", () => {
    beforeEach(() => {
        time[0] = 24000;
        otg = new OfflineTokenGenerator("key", 128, 8, 1, mockTimeGenerator);
    });
    it("generates and reads a token", () => {
        let crypto = otg.generate("test");
        chai.assert.equal(otg.read(crypto), "test", "wrong token")
    });
    it("refuses an expired token", () => {
        let crypto = otg.generate("test");
        time[0] = 1000000;
        try {
            otg.read(crypto);
        } catch(e) {
            return;
        }
        chai.assert.fail("expired token was accepted");
    });
    it("accepts a token with tolerance", () => {
        let crypto = otg.generate("test");
        time[0] = 32500;
        chai.assert.equal(otg.read(crypto), "test", "wrong token")
    });
    it("refuses a token with different key", () => {
        let crypto = otg.generate("test");
        let otg2 = new OfflineTokenGenerator("this is not the key", 128,
            8, 1, mockTimeGenerator);
        try {
            otg2.read(crypto);
        } catch(e) {
            return;
        }
        chai.assert.fail("token with different key was accepted");
    });
    it("refuses a token with different config", () => {
        let crypto = otg.generate("test");
        let otg2 = new OfflineTokenGenerator("key", 128, 999, 5,
            mockTimeGenerator);
        try {
            otg2.read(crypto);
        } catch(e) {
            return;
        }
        chai.assert.fail("token with different config was accepted");
    });
});