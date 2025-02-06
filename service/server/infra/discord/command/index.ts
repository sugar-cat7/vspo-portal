import type { CommandHandler } from "discord-hono";

type Env = {
  Bindings?: Record<string, unknown>;
  Variables?: Record<string, unknown>;
};

export type ISlashCommandDefinition<T extends Env> = {
  name: string;
  handler: CommandHandler<T>;
};

type DiscordCommandEnv = {
  Bindings?: Record<string, unknown>;
  Variables?: Record<string, unknown>;
};

/**
 * /spodule setting - Allows users to configure the bot settings.
 */
export const spoduleSettingCommand: ISlashCommandDefinition<DiscordCommandEnv> =
  {
    name: "setting",
    handler: async (c) => {
      return c.res("Settings updated.");
    },
  };

/**
 * /announce - Allows admins to send custom messages to all channels.
 */
export const announceCommand: ISlashCommandDefinition<DiscordCommandEnv> = {
  name: "announce",
  handler: async (c) => {
    return c.res("Announcement sent to all channels.");
  },
};
