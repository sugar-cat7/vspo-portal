import type { CommandHandler, DiscordHono, Rest } from "discord-hono";
import { DiscordHono as DHono, Rest as DRest, _channels_$_messages } from "discord-hono";
import { APIEmbed } from "discord-api-types/v10";
import { AppError, ErrorCodeSchema, type Result, wrap } from "../../pkg/errors";
import { DiscordEnv } from "../../config/env/discord";

export type ISlashCommandDefinition = {
  name: string;
  handler: CommandHandler<{
    Bindings?: Record<string, unknown>;
    Variables?: Record<string, unknown>;
}>
}

type SendMessageParams ={
  channelId: string;
  content: string;
  embeds?: APIEmbed[];
}


export interface IDiscordService {
  sendMessage(params: SendMessageParams): Promise<Result<void, AppError>>;
}

export class DiscordService implements IDiscordService {
  private app: DiscordHono;
  private rest: Rest;

  constructor(env: DiscordEnv) {
    this.app = new DHono({
      discordEnv: () => ({ TOKEN: env.DISCORD_BOT_TOKEN }),
    });
    this.rest = new DRest(env.DISCORD_BOT_TOKEN);
  }

  /**
   * Register commands from outside this class.
   */
  public registerCommands(commands: ISlashCommandDefinition[]): void {
    commands.forEach(({ name, handler }) => {
      this.app.command(name, handler);
    });

    this.app.command("", (c) => c.res("Unknown command."));
  }

  /**
   * Send a message to a channel outside of an interaction context.
   */
  public async sendMessage(params: SendMessageParams): Promise<Result<void, AppError>> {
    const { channelId, content, embeds } = params;

    return wrap(
      (async () => {
        await this.rest.post(_channels_$_messages, [channelId], {
          content,
          embeds,
        });
      })(),
      (err) =>
        new AppError({
          message: `Failed to send message: ${err.message}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        })
    );
  }
}
