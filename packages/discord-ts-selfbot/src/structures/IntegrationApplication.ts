import Application from "./interfaces/Application";
import { patchValue } from "./Base";
import type { APIUser } from "discord-api-types/v10";

class IntegrationApplication extends Application {
  declare summary: string | null;
  _patch(
    data: Parameters<typeof Application.prototype._patch>[0] & {
      bot?: APIUser;
    }
  ) {
    super._patch(data);

    if ("bot" in data) {
      this.bot = this.client.users._add(data.bot);
    } else {
      this.bot ??= null;
    }

    this.termsOfServiceURL = patchValue(
      data.terms_of_service_url,
      this.termsOfServiceURL
    );
    this.privacyPolicyURL = patchValue(
      data.privacy_policy_url,
      this.privacyPolicyURL
    );
    this.rpcOrigins = patchValue(data.rpc_origins, this.rpcOrigins, []);
    this.summary = patchValue(data.summary, this.summary);
    this.hook = patchValue(data.hook, this.hook);
  }
}

export default IntegrationApplication;
export { IntegrationApplication };
