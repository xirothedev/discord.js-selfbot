import { test, describe } from "bun:test";

import * as discord from "../../src/index";
import { skip, makeClient, login, makeStepRecorder } from "./_helpers";

describe.skipIf(skip)("manual: full-coverage (all exports)", () => {
  test("touch every export", async () => {
    const client = makeClient();
    const { step, summary, writeArtifact } = makeStepRecorder();
    try {
      await login(client);

      const keys = Object.keys(discord).toSorted();
      for (const key of keys) {
        await step(`export: ${key}`, async () => {
          const val = (discord as any)[key];
          if (val === undefined || val === null) {
            throw new Error("undefined export");
          }

          // Builders: construct + toJSON (best-effort)
          if (key.endsWith("Builder")) {
            let instance: any;
            try {
              instance = new val();
            } catch {
              try {
                instance = new val({});
              } catch {
                return;
              }
            }
            if (instance && typeof instance.toJSON === "function") {
              try {
                instance.toJSON();
              } catch {
                /* may require fields */
              }
            }
            return;
          }

          // BitFields / Flags: construct
          if (key.endsWith("BitField") || key.endsWith("Flags")) {
            try {
              new val(0);
            } catch {
              new val();
            }
            return;
          }

          // Errors: construct
          if (key.endsWith("Error")) {
            try {
              new val("msg");
            } catch {
              try {
                new val();
              } catch {
                /* requires args */
              }
            }
            return;
          }

          // Collections
          if (key === "Collection" || key === "LimitedCollection") {
            const c = new val();
            if (typeof c.set === "function") {
              c.set("a", 1);
            }
            return;
          }

          // Pure utility classes: try a known static method
          if (key === "Util") {
            (discord as any).Util.resolveColor(0xff_00_00);
            (discord as any).Util.flatten({ a: { b: 1 } });
            return;
          }
          if (key === "SnowflakeUtil") {
            (discord as any).SnowflakeUtil.generate();
            return;
          }
          if (key === "DataResolver") {
            (discord as any).DataResolver.resolveBase64("x");
            return;
          }
          if (key === "Formatters") {
            if (typeof (discord as any).Formatters.bold === "function") {
              (discord as any).Formatters.bold("x");
            }
            return;
          }

          // Client / managers: obtain from client and verify defined
          if (key === "Client") {
            if (!client.user) {
              throw new Error("no user");
            }
            return;
          }

          // Constants / Events / Options / Partials / Status: verify object
          if (
            ["Constants", "Events", "Options", "Partials", "Status"].includes(
              key
            )
          ) {
            if (typeof val !== "object" && typeof val !== "function") {
              throw new TypeError("not object/function");
            }
            return;
          }

          // Structures that can be fetched from client
          if (key === "Guild" || key === "User") {
            // just ensure class exists
            if (typeof val !== "function") {
              throw new TypeError("not a class");
            }
            return;
          }

          // Default: ensure it's defined (already checked) and callable/constructible if function
          if (typeof val === "function") {
            try {
              new val();
            } catch {
              /* may require args; defined is enough */
            }
          }
        });
      }
    } finally {
      client.destroy();
    }
    summary("manual: full-coverage");
    await writeArtifact("manual-full-coverage-results");
  }, 600_000);
});
