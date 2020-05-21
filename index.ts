import { ModeOfOperation, utils as AESUtil } from "aes-js";
import { sha384 } from "js-sha512";

export interface TimeGenerator {
    getTime(): number;
}

export class OfflineTokenGenerator<T = string> {
    
    constructor(
        private key: string,
        private aesBits: number,
        private ttl: number = 5,
        private tolerance: number = 0,
        private timeGen: TimeGenerator = {
            getTime: () => {
                return new Date().getTime();
            }
        }
    ) {
        if(tolerance < 0) {
            throw new Error("tolerance must be >= 0");
        }
        if(ttl < 1) {
            throw new Error("ttl must be >= 1");
        }
        if(aesBits != 128
        && aesBits != 192
        && aesBits != 256) {
            throw new Error("aesBits must be 128 or 192 or 256");
        }
    }

    private getCurrentTime(tol: number): number {
        if(tol > this.tolerance) {
            return -1;
        }
        let t = Math.floor(this.timeGen.getTime() / 1000);
        t -= (t % this.ttl);
        while(tol > 0) {
            t -= this.ttl;
            tol--;
        }
        return t;
    }

    private getKey(tol: number): number[][] | null {
        let t = this.getCurrentTime(tol);
        if(t == -1) {
            return null;
        }
        let hash = sha384.digest(`${t}//${this.key}//${this.aesBits}//${this.ttl}//${this.tolerance}`);
        return [hash.slice(0, this.aesBits / 8), hash.slice(32, 48)];
    }

    generate(value: T): string {
        let envelope: any[] = [
            Math.random(),
            value
        ];
        let hash = this.getKey(0) as number[][];
        let aesPass = hash[0];
        let aesIV = hash[1];
        let content = JSON.stringify(envelope);
        let padding = '';
        while((content.length + padding.length) % 16 > 0) {
            padding += ' ';
        }
        content = content + padding;
        return AESUtil.hex.fromBytes(new ModeOfOperation.cbc(aesPass, aesIV).encrypt(
            AESUtil.utf8.toBytes(content)
        ));
    }

    private doRead(tol: number, crypto: string): any {
        let hash = this.getKey(tol);
        if(hash == null) {
            return null;
        }
        let aesPass = hash[0];
        let aesIV = hash[1];
        try {
            return JSON.parse(AESUtil.utf8.fromBytes(new ModeOfOperation.cbc(aesPass, aesIV).decrypt(
                AESUtil.hex.toBytes(crypto)
            )));
        } catch(e) {
            return this.doRead(tol + 1, crypto);
        }
    }

    read(crypto: string): T {
        let json = this.doRead(0, crypto);
        if(json == null) {
            throw new Error("Expired token!");
        }
        return (json as any[])[1] as T;
    }
}