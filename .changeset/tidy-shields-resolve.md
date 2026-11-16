---
'@discord-selfbot/core': patch
---

Finish the ReDoS hardening of `Util.escapeMaskedLink` (code scanning alert #2). The previous fix still let the text and URL groups consume the `\\[` prefix that starts the match, so each start position could rescan the rest of the input. Exclude `[` from both groups, making the match unambiguous and linear time. Extend the regression test with the new adversarial strings.
