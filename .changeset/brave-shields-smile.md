---
'@discord-selfbot/core': patch
---

Fix a polynomial ReDoS in `Util.escapeMaskedLink`. The masked-link regex used two greedy `.+` groups, so crafted input could make escaping take seconds. Guard on `](` and use disjoint character classes so the match is unambiguous and runs in linear time. Add a regression test with the adversarial inputs from the CodeQL alert.
