import Application from "./interfaces/Application";
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

    if ("terms_of_service_url" in data) {
      this.termsOfServiceURL = data.terms_of_service_url ?? null;
    } else {
      this.termsOfServiceURL ??= null;
    }

    if ("privacy_policy_url" in data) {
      this.privacyPolicyURL = data.privacy_policy_url ?? null;
    } else {
      this.privacyPolicyURL ??= null;
    }

    if ("rpc_origins" in data) {
      this.rpcOrigins = data.rpc_origins ?? [];
    } else {
      this.rpcOrigins ??= [];
    }

    if ("summary" in data) {
      /**
       * The application's summary
       * @type {?string}
       * @deprecated This property is no longer being sent by the API.
       */
      this.summary = data.summary ?? null;
    } else {
      this.summary ??= null;
    }

    if ("hook" in data) {
      this.hook = data.hook ?? null;
    } else {
      this.hook ??= null;
    }

    if ("cover_image" in data) {
      this.cover = data.cover_image ?? null;
    } else {
      this.cover ??= null;
    }

    if ("verify_key" in data) {
      this.verifyKey = data.verify_key ?? null;
    } else {
      this.verifyKey ??= null;
    }
  }
}

export default IntegrationApplication;
export { IntegrationApplication };
