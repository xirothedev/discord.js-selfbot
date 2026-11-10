import type { RawUserData } from '../../../typings/rawDataTypes';

/**
 * Fields that the user-account API returns but `discord-api-types` does not model.
 *
 * These fields are tagged `selfbot` in `EntitySchema`; they are not part of the
 * public bot API contract.
 */
export interface SelfbotUserFields {
  banner_color?: string | null;
  phone?: string | null;
  bio?: string;
  pronouns?: string;
  nsfw_allowed?: boolean;
  purchased_flags?: number;
  premium_usage_flags?: number;
  private_flags?: number;
  about_me?: string | null;
}

export type SelfbotUserData = RawUserData & SelfbotUserFields;

export type SelfbotClientUserData = SelfbotUserData & {
  token?: string | null;
};
