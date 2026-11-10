import Action from './Action';
import type { GatewayGuildAuditLogEntryCreateDispatchData } from 'discord-api-types/v10';
import GuildAuditLogs from '../../structures/GuildAuditLogs';
import _ConstantsModule from '../../util/Constants';

const { Events } = _ConstantsModule;
const GuildAuditLogsEntry = GuildAuditLogs.Entry;

class GuildAuditLogEntryCreateAction extends Action {
  handle(data: GatewayGuildAuditLogEntryCreateDispatchData) {
    const { client } = this;
    const guild = client.guilds.cache.get(data.guild_id);
    let auditLogEntry;

    if (guild) {
      auditLogEntry = new GuildAuditLogsEntry(guild, data);

      client.emit(Events.GUILD_AUDIT_LOG_ENTRY_CREATE, auditLogEntry, guild);
    }

    return { auditLogEntry };
  }
}

export default GuildAuditLogEntryCreateAction;
export { GuildAuditLogEntryCreateAction };
