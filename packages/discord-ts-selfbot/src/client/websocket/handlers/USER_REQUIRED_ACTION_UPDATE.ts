import type { Client } from '../../Client';

export interface UserRequiredActionData {
  required_action?: string | null;
}

async function acceptAgreements(client: Client): Promise<void> {
  try {
    await client.api.users('@me').agreements.patch({
      data: {
        privacy: true,
        terms: true,
      },
    });
    client.emit(
      'debug',
      '[USER_REQUIRED_ACTION] Successfully accepted the new Terms of Service and Privacy Policy.'
    );
  } catch (error: unknown) {
    client.emit(
      'debug',
      `[USER_REQUIRED_ACTION] Failed to accept the new Terms of Service and Privacy Policy: ${String(error)}`
    );
  }
}

export default function handleUserRequiredActionUpdate(
  client: Client,
  { d: data }: { d: UserRequiredActionData }
) {
  let msg: string;
  switch (data.required_action) {
    case undefined:
    case null: {
      msg = 'All required actions have been completed.';
      break;
    }
    case 'AGREEMENTS': {
      msg = 'You need to accept the new Terms of Service and Privacy Policy.';
      // https://discord.com/api/v9/users/@me/agreements
      void acceptAgreements(client);
      break;
    }
    case 'REQUIRE_CAPTCHA': {
      msg = 'You need to complete a captcha.';
      break;
    }
    case 'REQUIRE_VERIFIED_EMAIL': {
      msg = 'You need to verify your email.';
      break;
    }
    case 'REQUIRE_REVERIFIED_EMAIL': {
      msg = 'You need to reverify your email.';
      break;
    }
    case 'REQUIRE_VERIFIED_PHONE': {
      msg = 'You need to verify your phone number.';
      break;
    }
    case 'REQUIRE_REVERIFIED_PHONE': {
      msg = 'You need to reverify your phone number.';
      break;
    }
    case 'REQUIRE_VERIFIED_EMAIL_OR_VERIFIED_PHONE': {
      msg = 'You need to verify your email or verify your phone number.';
      break;
    }
    case 'REQUIRE_REVERIFIED_EMAIL_OR_VERIFIED_PHONE': {
      msg = 'You need to reverify your email or verify your phone number.';
      break;
    }
    case 'REQUIRE_VERIFIED_EMAIL_OR_REVERIFIED_PHONE': {
      msg = 'You need to verify your email or reverify your phone number.';
      break;
    }
    case 'REQUIRE_REVERIFIED_EMAIL_OR_REVERIFIED_PHONE': {
      msg = 'You need to reverify your email or reverify your phone number.';
      break;
    }
    default: {
      msg = `Unknown required action: ${data.required_action}`;
      break;
    }
  }
  client.emit('debug', `[USER_REQUIRED_ACTION] ${msg}`);
}
