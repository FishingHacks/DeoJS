import { Injectable } from "../../../src";

@Injectable
export class TestService {
    logCat() {
        console.log('cat');
    }
}