import process from "node:process";
import ApplicationFlags from "../../util/ApplicationFlags";
import _ConstantsModule from "../../util/Constants";

const { ClientApplicationAssetTypes, Endpoints } = _ConstantsModule;
import Permissions from "../../util/Permissions";
import SnowflakeUtil from "../../util/SnowflakeUtil";
import _ApplicationRoleConnectionMetadataModule from "../ApplicationRoleConnectionMetadata";

const { ApplicationRoleConnectionMetadata } =
  _ApplicationRoleConnectionMetadataModule;
import Base, { patchValue } from "../Base";
import Team from "../Team";
import ApplicationCommandManager from "../../managers/ApplicationCommandManager";
import type {
  RawApplicationData,
  RawUserData,
} from "../../../typings/rawDataTypes";
import type { StaticImageURLOptions } from "../../../typings";
import type { ApplicationEntity } from "../../types/entities/application";
import type { ApplicationPatch } from "../../types/selfbot/application";
import type Client from "../../client/Client";

const AssetTypes = Object.keys(ClientApplicationAssetTypes);

interface ApplicationAssetData {
  id: string;
  name: string;
  type: number;
}

function isApplicationAsset(value: unknown): value is ApplicationAssetData {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "type" in value &&
    typeof value.type === "number"
  );
}

let deprecationEmittedForFetchAssets = false;

class Application extends Base implements ApplicationEntity {
  declare commands: ApplicationCommandManager;
  declare description: ApplicationEntity["description"];
  declare icon: ApplicationEntity["icon"];
  declare id: ApplicationEntity["id"];
  declare name: ApplicationEntity["name"];
  declare termsOfServiceURL: ApplicationEntity["termsOfServiceURL"];
  declare privacyPolicyURL: ApplicationEntity["privacyPolicyURL"];
  declare verifyKey: ApplicationEntity["verifyKey"];
  declare roleConnectionsVerificationURL: ApplicationEntity["roleConnectionsVerificationURL"];
  declare approximateGuildCount: ApplicationEntity["approximateGuildCount"];
  declare botPublic: ApplicationEntity["botPublic"];
  declare botRequireCodeGrant: ApplicationEntity["botRequireCodeGrant"];
  declare cover: ApplicationEntity["cover"];
  declare flags: ApplicationEntity["flags"];
  declare guildId: ApplicationEntity["guildId"];
  declare tags: ApplicationEntity["tags"];
  declare installParams: ApplicationEntity["installParams"];
  declare customInstallURL: ApplicationEntity["customInstallURL"];
  declare owner: ApplicationEntity["owner"];
  declare rpcOrigins: ApplicationEntity["rpcOrigins"];
  declare splash: ApplicationEntity["splash"];
  declare type: ApplicationEntity["type"];
  declare primarySkuId: ApplicationEntity["primarySkuId"];
  declare eulaId: ApplicationEntity["eulaId"];
  declare slug: ApplicationEntity["slug"];
  declare aliases: ApplicationEntity["aliases"];
  declare executables: ApplicationEntity["executables"];
  declare thirdPartySkus: ApplicationEntity["thirdPartySkus"];
  declare hook: ApplicationEntity["hook"];
  declare overlay: ApplicationEntity["overlay"];
  declare overlayMethods: ApplicationEntity["overlayMethods"];
  declare overlayWarn: ApplicationEntity["overlayWarn"];
  declare overlayCompatibilityHook: ApplicationEntity["overlayCompatibilityHook"];
  declare bot: ApplicationEntity["bot"];
  declare developers: ApplicationEntity["developers"];
  declare publishers: ApplicationEntity["publishers"];
  declare redirectUris: ApplicationEntity["redirectUris"];
  declare deeplinkUri: ApplicationEntity["deeplinkUri"];
  declare integrationPublic: ApplicationEntity["integrationPublic"];
  declare integrationRequireCodeGrant: ApplicationEntity["integrationRequireCodeGrant"];
  declare botDisabled: ApplicationEntity["botDisabled"];
  declare botQuarantined: ApplicationEntity["botQuarantined"];
  declare approximateUserInstallCount: ApplicationEntity["approximateUserInstallCount"];
  declare approximateUserAuthorizationCount: ApplicationEntity["approximateUserAuthorizationCount"];
  declare internalGuildRestriction: ApplicationEntity["internalGuildRestriction"];
  declare interactionsEndpointUrl: ApplicationEntity["interactionsEndpointUrl"];
  declare interactionsVersion: ApplicationEntity["interactionsVersion"];
  declare interactionsEventTypes: ApplicationEntity["interactionsEventTypes"];
  declare eventWebhooksStatus: ApplicationEntity["eventWebhooksStatus"];
  declare eventWebhooksUrl: ApplicationEntity["eventWebhooksUrl"];
  declare eventWebhooksTypes: ApplicationEntity["eventWebhooksTypes"];
  declare explicitContentFilter: ApplicationEntity["explicitContentFilter"];
  declare integrationTypesConfig: ApplicationEntity["integrationTypesConfig"];
  declare isVerified: ApplicationEntity["isVerified"];
  declare verificationState: ApplicationEntity["verificationState"];
  declare storeApplicationState: ApplicationEntity["storeApplicationState"];
  declare rpcApplicationState: ApplicationEntity["rpcApplicationState"];
  declare creatorMonetizationState: ApplicationEntity["creatorMonetizationState"];
  declare isDiscoverable: ApplicationEntity["isDiscoverable"];
  declare discoverabilityState: ApplicationEntity["discoverabilityState"];
  declare discoveryEligibilityFlags: ApplicationEntity["discoveryEligibilityFlags"];
  declare isMonetized: ApplicationEntity["isMonetized"];
  declare storefrontAvailable: ApplicationEntity["storefrontAvailable"];
  declare monetizationState: ApplicationEntity["monetizationState"];
  declare monetizationEligibilityFlags: ApplicationEntity["monetizationEligibilityFlags"];
  declare maxParticipants: ApplicationEntity["maxParticipants"];
  constructor(client: Client, data: RawApplicationData) {
    super(client);
    this.commands = new ApplicationCommandManager(this.client);
    if (data) {
      this._patch(data);
    }
  }

  _patch(data: ApplicationPatch) {
    if (data.id !== undefined) {
      this.id = data.id;
    }

    this.name = patchValue(data.name, this.name);
    this.description = patchValue(data.description, this.description);
    this.icon = patchValue(data.icon, this.icon);
    this.termsOfServiceURL = patchValue(
      data.terms_of_service_url,
      this.termsOfServiceURL
    );
    this.privacyPolicyURL = patchValue(
      data.privacy_policy_url,
      this.privacyPolicyURL
    );
    this.verifyKey = patchValue(data.verify_key, this.verifyKey);
    this.roleConnectionsVerificationURL = patchValue(
      data.role_connections_verification_url,
      this.roleConnectionsVerificationURL
    );

    this.tags =
      data.tags?.filter((tag): tag is string => typeof tag === "string") ?? [];

    if ("install_params" in data && data.install_params) {
      this.installParams = {
        permissions: new Permissions(data.install_params.permissions).freeze(),
        scopes: data.install_params.scopes,
      };
    } else {
      this.installParams ??= null;
    }

    this.customInstallURL = data.custom_install_url ?? null;
    this.flags =
      "flags" in data ? new ApplicationFlags(data.flags).freeze() : this.flags;
    this.approximateGuildCount = patchValue(
      data.approximate_guild_count,
      this.approximateGuildCount
    );
    this.guildId = patchValue(data.guild_id, this.guildId);
    this.cover = patchValue(data.cover_image, this.cover);
    this.rpcOrigins = patchValue(data.rpc_origins, this.rpcOrigins, []);
    this.botRequireCodeGrant = patchValue(
      data.bot_require_code_grant,
      this.botRequireCodeGrant
    );
    this.botPublic = patchValue(data.bot_public, this.botPublic);

    if (data.team) {
      this.owner = new Team(this.client, data.team);
    } else if (data.owner) {
      this.owner = this.client.users._add(data.owner);
    } else {
      this.owner ??= null;
    }

    this.splash = patchValue(data.splash, this.splash);
    this.type = data.type ?? null;
    this.primarySkuId = data.primary_sku_id ?? null;
    this.eulaId = data.eula_id ?? null;
    this.slug = data.slug ?? null;
    this.aliases = data.aliases ?? [];
    this.executables = patchValue(data.executables, this.executables);
    this.thirdPartySkus = patchValue(
      data.third_party_skus,
      this.thirdPartySkus
    );
    this.hook = patchValue(data.hook, this.hook);
    this.overlay = patchValue(data.overlay, this.overlay);
    this.overlayMethods = patchValue(data.overlay_methods, this.overlayMethods);
    this.overlayWarn = patchValue(data.overlay_warn, this.overlayWarn);
    this.overlayCompatibilityHook = patchValue(
      data.overlay_compatibility_hook,
      this.overlayCompatibilityHook
    );

    if ("bot" in data) {
      this.bot = data.bot ? this.client.users._add(data.bot) : null;
    } else {
      this.bot ??= null;
    }

    this.developers = patchValue(data.developers, this.developers);
    this.publishers = patchValue(data.publishers, this.publishers);
    this.redirectUris = patchValue(data.redirect_uris, this.redirectUris);
    this.deeplinkUri = patchValue(data.deeplink_uri, this.deeplinkUri);
    this.integrationPublic = patchValue(
      data.integration_public,
      this.integrationPublic
    );
    this.integrationRequireCodeGrant = patchValue(
      data.integration_require_code_grant,
      this.integrationRequireCodeGrant
    );
    this.botDisabled = patchValue(data.bot_disabled, this.botDisabled);
    this.botQuarantined = patchValue(data.bot_quarantined, this.botQuarantined);
    this.approximateUserInstallCount = patchValue(
      data.approximate_user_install_count,
      this.approximateUserInstallCount
    );
    this.approximateUserAuthorizationCount = patchValue(
      data.approximate_user_authorization_count,
      this.approximateUserAuthorizationCount
    );
    this.internalGuildRestriction = patchValue(
      data.internal_guild_restriction,
      this.internalGuildRestriction
    );
    this.interactionsEndpointUrl = patchValue(
      data.interactions_endpoint_url,
      this.interactionsEndpointUrl
    );
    this.interactionsVersion = patchValue(
      data.interactions_version,
      this.interactionsVersion
    );
    this.interactionsEventTypes = patchValue(
      data.interactions_event_types,
      this.interactionsEventTypes
    );
    this.eventWebhooksStatus = patchValue(
      data.event_webhooks_status,
      this.eventWebhooksStatus
    );
    this.eventWebhooksUrl = patchValue(
      data.event_webhooks_url,
      this.eventWebhooksUrl
    );
    this.eventWebhooksTypes = patchValue(
      data.event_webhooks_types,
      this.eventWebhooksTypes
    );
    this.explicitContentFilter = patchValue(
      data.explicit_content_filter,
      this.explicitContentFilter
    );
    this.integrationTypesConfig = patchValue(
      data.integration_types_config,
      this.integrationTypesConfig
    );
    this.isVerified = patchValue(data.is_verified, this.isVerified);
    this.verificationState = patchValue(
      data.verification_state,
      this.verificationState
    );
    this.storeApplicationState = patchValue(
      data.store_application_state,
      this.storeApplicationState
    );
    this.rpcApplicationState = patchValue(
      data.rpc_application_state,
      this.rpcApplicationState
    );
    this.creatorMonetizationState = patchValue(
      data.creator_monetization_state,
      this.creatorMonetizationState
    );
    this.isDiscoverable = patchValue(data.is_discoverable, this.isDiscoverable);
    this.discoverabilityState = patchValue(
      data.discoverability_state,
      this.discoverabilityState
    );
    this.discoveryEligibilityFlags = patchValue(
      data.discovery_eligibility_flags,
      this.discoveryEligibilityFlags
    );
    this.isMonetized = patchValue(data.is_monetized, this.isMonetized);
    this.storefrontAvailable = patchValue(
      data.storefront_available,
      this.storefrontAvailable
    );
    this.monetizationState = patchValue(
      data.monetization_state,
      this.monetizationState
    );
    this.monetizationEligibilityFlags = patchValue(
      data.monetization_eligibility_flags,
      this.monetizationEligibilityFlags
    );
    this.maxParticipants = patchValue(
      data.max_participants,
      this.maxParticipants
    );
  }

  get guild() {
    return this.guildId
      ? (this.client.guilds.cache.get(this.guildId) ?? null)
      : null;
  }

  get partial() {
    return !this.name;
  }

  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  async fetch() {
    const app = await this.client.api.oauth2.authorize.get<{
      application: ApplicationPatch;
      bot: RawUserData;
    }>({
      query: {
        client_id: this.id,
        scope: "bot applications.commands",
      },
    });
    this.client.users._add(app.bot);
    this._patch(app.application);
    return this;
  }

  async fetchRoleConnectionMetadataRecords() {
    const metadata: unknown = await this.client.api
      .applications(this.id)("role-connections")
      .metadata.get();
    if (!Array.isArray(metadata)) {
      return [];
    }
    return metadata.map((data) => new ApplicationRoleConnectionMetadata(data));
  }

  iconURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.icon) {
      return null;
    }
    return this.client.rest.cdn.AppIcon(this.id, this.icon, { format, size });
  }

  coverURL({ format, size }: StaticImageURLOptions = {}) {
    if (!this.cover) {
      return null;
    }
    return Endpoints.CDN(this.client.options.http.cdn).AppIcon(
      this.id,
      this.cover,
      { format, size }
    );
  }

  /**
   * Gets the application's rich presence assets.
   * @returns {Promise<Array<ApplicationAsset>>}
   * @deprecated This will be removed in the next major as it is unsupported functionality.
   */
  async fetchAssets() {
    if (!deprecationEmittedForFetchAssets) {
      process.emitWarning(
        "Application#fetchAssets is deprecated as it is unsupported and will be removed in the next major version.",
        "DeprecationWarning"
      );

      deprecationEmittedForFetchAssets = true;
    }

    const assets: unknown = await this.client.api.oauth2
      .applications(this.id)
      .assets.get();
    if (!Array.isArray(assets)) {
      return [];
    }
    return assets.filter(isApplicationAsset).map((asset) => ({
      id: asset.id,
      name: asset.name,
      type: AssetTypes[asset.type - 1],
    }));
  }

  toString() {
    return this.name;
  }

  toJSON() {
    return super.toJSON({ createdTimestamp: true });
  }
}

export default Application;
export { Application };
