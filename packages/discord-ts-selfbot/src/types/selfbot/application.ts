import type { APIApplication } from 'discord-api-types/v10';
import type { ApplicationType } from '../../../typings/enums';

export interface ApplicationPatch extends Partial<APIApplication> {
  type?: ApplicationType | null;
  splash?: string | null;
  eula_id?: string | null;
  name_localized?: string | null;
  description_localized?: string | null;
  aliases?: string[];
  executables?: { os: string; name: string; is_launcher: boolean }[] | null;
  third_party_skus?:
    | { id: string | null; sku: string | null; distributor: string }[]
    | null;
  hook?: boolean | null;
  overlay?: boolean | null;
  overlay_methods?: number | null;
  overlay_warn?: boolean | null;
  overlay_compatibility_hook?: boolean | null;
  developers?: { id: string; name: string }[] | null;
  publishers?: { id: string; name: string }[] | null;
  deeplink_uri?: string | null;
  integration_public?: boolean | null;
  integration_require_code_grant?: boolean | null;
  bot_disabled?: boolean | null;
  bot_quarantined?: boolean | null;
  internal_guild_restriction?: number | null;
  interactions_version?: number | null;
  interactions_event_types?: string[] | null;
  explicit_content_filter?: number | null;
  is_verified?: boolean | null;
  verification_state?: number | null;
  store_application_state?: number | null;
  rpc_application_state?: number | null;
  creator_monetization_state?: number | null;
  is_discoverable?: boolean | null;
  discoverability_state?: number | null;
  discovery_eligibility_flags?: number | null;
  is_monetized?: boolean | null;
  storefront_available?: boolean | null;
  monetization_state?: number | null;
  monetization_eligibility_flags?: number | null;
  max_participants?: number | null;
}
