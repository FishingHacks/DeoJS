import { Injectable } from "overnight";

@Injectable
export class TestService {
    logCat() {
        console.log('cat');
    }
}