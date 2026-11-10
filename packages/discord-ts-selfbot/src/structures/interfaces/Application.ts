import process from "node:process";
import ApplicationFlags from "../../util/ApplicationFlags";
import _ConstantsModule from "../../util/Constants";

const { ClientApplicationAssetTypes, Endpoints } = _ConstantsModule;
import Permissions from "../../util/Permissions";
import SnowflakeUtil from "../../util/SnowflakeUtil";
import _ApplicationRoleConnectionMetadataModule from "../ApplicationRoleConnectionMetadata";

const { ApplicationRoleConnectionMetadata } =
  _ApplicationRoleConnectionMetadataModule;
import Base from "../Base";
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
    this.id = data.id!;

    if ("name" in data) {
      this.name = data.name ?? null;
    } else {
      this.name ??= null;
    }

    if ("description" in data) {
      this.description = data.description ?? null;
    } else {
      this.description ??= null;
    }

    if ("icon" in data) {
      this.icon = data.icon ?? null;
    } else {
      this.icon ??= null;
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

    if ("verify_key" in data) {
      this.verifyKey = data.verify_key ?? null;
    } else {
      this.verifyKey ??= null;
    }

    if ("role_connections_verification_url" in data) {
      this.roleConnectionsVerificationURL =
        data.role_connections_verification_url ?? null;
    } else {
      this.roleConnectionsVerificationURL ??= null;
    }

    this.tags =
      data.tags?.filter((tag): tag is string => typeof tag === "string") ?? [];

    if ("install_params" in data && data.install_params) {
      const installParams: {
        scopes: string[];
        permissions: Readonly<Permissions>;
      } = {
        permissions: new Permissions(data.install_params.permissions).freeze(),
        scopes: data.install_params.scopes,
      };
      this.installParams = installParams;
    } else {
      this.installParams ??= null;
    }

    if ("custom_install_url" in data) {
      this.customInstallURL = data.custom_install_url ?? null;
    } else {
      this.customInstallURL = null;
    }

    if ("flags" in data) {
      this.flags = new ApplicationFlags(data.flags).freeze();
    }

    if ("approximate_guild_count" in data) {
      this.approximateGuildCount = data.approximate_guild_count ?? null;
    } else {
      this.approximateGuildCount ??= null;
    }

    if ("guild_id" in data) {
      this.guildId = data.guild_id ?? null;
    } else {
      this.guildId ??= null;
    }

    if ("cover_image" in data) {
      this.cover = data.cover_image ?? null;
    } else {
      this.cover ??= null;
    }

    if ("rpc_origins" in data) {
      this.rpcOrigins = data.rpc_origins ?? [];
    } else {
      this.rpcOrigins ??= [];
    }

    if ("bot_require_code_grant" in data) {
      /**
       * If this application's bot requires a code grant when using the OAuth2 flow
       * @deprecated
       * @type {?boolean}
       */
      this.botRequireCodeGrant = data.bot_require_code_grant ?? null;
    } else {
      this.botRequireCodeGrant ??= null;
    }

    if ("bot_public" in data) {
      /**
       * If this application's bot is public
       * @deprecated
       * @type {?boolean}
       */
      this.botPublic = data.bot_public ?? null;
    } else {
      this.botPublic ??= null;
    }

    this.owner = data.team
      ? new Team(this.client, data.team)
      : data.owner
        ? this.client.users._add(data.owner)
        : (this.owner ?? null);

    if ("splash" in data) {
      this.splash = data.splash ?? null;
    } else {
      this.splash ??= null;
    }

    if ("type" in data) {
      this.type = data.type ?? null;
    } else {
      this.type = null;
    }

    if ("primary_sku_id" in data) {
      this.primarySkuId = data.primary_sku_id ?? null;
    } else {
      this.primarySkuId = null;
    }

    if ("eula_id" in data) {
      this.eulaId = data.eula_id ?? null;
    } else {
      this.eulaId = null;
    }

    if ("slug" in data) {
      this.slug = data.slug ?? null;
    } else {
      this.slug = null;
    }

    if ("aliases" in data) {
      this.aliases = data.aliases ?? [];
    } else {
      this.aliases = [];
    }

    if ("executables" in data) {
      this.executables = data.executables ?? null;
    } else {
      this.executables ??= null;
    }

    if ("third_party_skus" in data) {
      this.thirdPartySkus = data.third_party_skus ?? null;
    } else {
      this.thirdPartySkus ??= null;
    }

    if ("hook" in data) {
      this.hook = data.hook ?? null;
    } else {
      this.hook ??= null;
    }

    if ("overlay" in data) {
      this.overlay = data.overlay ?? null;
    } else {
      this.overlay ??= null;
    }

    if ("overlay_methods" in data) {
      this.overlayMethods = data.overlay_methods ?? null;
    } else {
      this.overlayMethods ??= null;
    }

    if ("overlay_warn" in data) {
      this.overlayWarn = data.overlay_warn ?? null;
    } else {
      this.overlayWarn ??= null;
    }

    if ("overlay_compatibility_hook" in data) {
      this.overlayCompatibilityHook = data.overlay_compatibility_hook ?? null;
    } else {
      this.overlayCompatibilityHook ??= null;
    }

    if ("bot" in data) {
      this.bot = data.bot ? this.client.users._add(data.bot) : null;
    } else {
      this.bot ??= null;
    }

    if ("developers" in data) {
      this.developers = data.developers ?? null;
    } else {
      this.developers ??= null;
    }

    if ("publishers" in data) {
      this.publishers = data.publishers ?? null;
    } else {
      this.publishers ??= null;
    }

    if ("redirect_uris" in data) {
      this.redirectUris = data.redirect_uris ?? null;
    } else {
      this.redirectUris ??= null;
    }

    if ("deeplink_uri" in data) {
      this.deeplinkUri = data.deeplink_uri ?? null;
    } else {
      this.deeplinkUri ??= null;
    }

    if ("integration_public" in data) {
      this.integrationPublic = data.integration_public ?? null;
    } else {
      this.integrationPublic ??= null;
    }

    if ("integration_require_code_grant" in data) {
      this.integrationRequireCodeGrant =
        data.integration_require_code_grant ?? null;
    } else {
      this.integrationRequireCodeGrant ??= null;
    }

    if ("bot_disabled" in data) {
      this.botDisabled = data.bot_disabled ?? null;
    } else {
      this.botDisabled ??= null;
    }

    if ("bot_quarantined" in data) {
      this.botQuarantined = data.bot_quarantined ?? null;
    } else {
      this.botQuarantined ??= null;
    }

    if ("approximate_user_install_count" in data) {
      this.approximateUserInstallCount =
        data.approximate_user_install_count ?? null;
    } else {
      this.approximateUserInstallCount ??= null;
    }

    if ("approximate_user_authorization_count" in data) {
      this.approximateUserAuthorizationCount =
        data.approximate_user_authorization_count ?? null;
    } else {
      this.approximateUserAuthorizationCount ??= null;
    }

    if ("internal_guild_restriction" in data) {
      this.internalGuildRestriction = data.internal_guild_restriction ?? null;
    } else {
      this.internalGuildRestriction ??= null;
    }

    if ("interactions_endpoint_url" in data) {
      this.interactionsEndpointUrl = data.interactions_endpoint_url ?? null;
    } else {
      this.interactionsEndpointUrl ??= null;
    }

    if ("interactions_version" in data) {
      this.interactionsVersion = data.interactions_version ?? null;
    } else {
      this.interactionsVersion ??= null;
    }

    if ("interactions_event_types" in data) {
      this.interactionsEventTypes = data.interactions_event_types ?? null;
    } else {
      this.interactionsEventTypes ??= null;
    }

    if ("event_webhooks_status" in data) {
      this.eventWebhooksStatus = data.event_webhooks_status ?? null;
    } else {
      this.eventWebhooksStatus ??= null;
    }

    if ("event_webhooks_url" in data) {
      this.eventWebhooksUrl = data.event_webhooks_url ?? null;
    } else {
      this.eventWebhooksUrl ??= null;
    }

    if ("event_webhooks_types" in data) {
      this.eventWebhooksTypes = data.event_webhooks_types ?? null;
    } else {
      this.eventWebhooksTypes ??= null;
    }

    if ("explicit_content_filter" in data) {
      this.explicitContentFilter = data.explicit_content_filter ?? null;
    } else {
      this.explicitContentFilter ??= null;
    }

    if ("integration_types_config" in data) {
      this.integrationTypesConfig = data.integration_types_config ?? null;
    } else {
      this.integrationTypesConfig ??= null;
    }

    if ("is_verified" in data) {
      this.isVerified = data.is_verified ?? null;
    } else {
      this.isVerified ??= null;
    }

    if ("verification_state" in data) {
      this.verificationState = data.verification_state ?? null;
    } else {
      this.verificationState ??= null;
    }

    if ("store_application_state" in data) {
      this.storeApplicationState = data.store_application_state ?? null;
    } else {
      this.storeApplicationState ??= null;
    }

    if ("rpc_application_state" in data) {
      this.rpcApplicationState = data.rpc_application_state ?? null;
    } else {
      this.rpcApplicationState ??= null;
    }

    if ("creator_monetization_state" in data) {
      this.creatorMonetizationState = data.creator_monetization_state ?? null;
    } else {
      this.creatorMonetizationState ??= null;
    }

    if ("is_discoverable" in data) {
      this.isDiscoverable = data.is_discoverable ?? null;
    } else {
      this.isDiscoverable ??= null;
    }

    if ("discoverability_state" in data) {
      this.discoverabilityState = data.discoverability_state ?? null;
    } else {
      this.discoverabilityState ??= null;
    }

    if ("discovery_eligibility_flags" in data) {
      this.discoveryEligibilityFlags = data.discovery_eligibility_flags ?? null;
    } else {
      this.discoveryEligibilityFlags ??= null;
    }

    if ("is_monetized" in data) {
      this.isMonetized = data.is_monetized ?? null;
    } else {
      this.isMonetized ??= null;
    }

    if ("storefront_available" in data) {
      this.storefrontAvailable = data.storefront_available ?? null;
    } else {
      this.storefrontAvailable ??= null;
    }

    if ("monetization_state" in data) {
      this.monetizationState = data.monetization_state ?? null;
    } else {
      this.monetizationState ??= null;
    }

    if ("monetization_eligibility_flags" in data) {
      this.monetizationEligibilityFlags =
        data.monetization_eligibility_flags ?? null;
    } else {
      this.monetizationEligibilityFlags ??= null;
    }

    if ("max_participants" in data) {
      this.maxParticipants = data.max_participants ?? null;
    } else {
      this.maxParticipants ??= null;
    }
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
