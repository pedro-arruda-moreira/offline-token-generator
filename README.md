# Offline Token Generator
## What is it?
This is an offline **[one time token](https://en.wikipedia.org/wiki/One-time_password#Proprietary_tokens)** generator and validator, where you can put content (like JSON or string) on the token for user identification, for instance.
## How to use it?
Just instantiate the **OfflineTokenGenerator** class and use the method **generate** to create a new token and **read** to read a previously generated token.
```javascript
// TTL Tolerance (optional, default 0) -------------V
// TTL in seconds (optional, default 5) ---------V  |
//      Generated AES hash will change           |  |
//      Every [TTL] seconds for                  |  |
//      the same content being hashed.           |  |
// AES Bits (128 / 192 / 256) ---------------V   |  |
// AES password -----------------------V     |   |  |
//                                     |     |   |  |
var otg = new  OfflineTokenGenerator("key", 128, 8, 1);
var token = otg.generate({"test": 1, "hello": ["world"]});
// (example, not real hash)
// token==492f3f38d6b5d3ca859514e250e25ba65935bcdd9f4f40c124b773fe536fee7d
// Because it works in time frames (like token key fobs), the token will
// still be valid up to 16 seconds after it was created
// (TTL * (TTL Tolerance + 1))

// a few seconds later... (even on another computer!)
// both system clocks must be synchronized
// and the configuration must match because
// it is used in AES key generation! ---|-----|---|--|
var otg2 = new  OfflineTokenGenerator("key", 128, 8, 1);
var data = otg2.read(receivedToken);
// data == {"test": 1, "hello": ["world"]}
```

## Pretty cool, Can I use it on my proprietary project?
Sure! This is MIT-licenced :)
## Can I contribute?
Of course! PRs are always welcome!
## What about other languages?
For TypeScript, this lib is made on TypeScript :)
Maybe for Java you could use [Nashorn Require](https://github.com/provegard/nashorn-require).