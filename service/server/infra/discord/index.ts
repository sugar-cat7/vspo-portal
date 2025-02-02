import type { APIEmbed } from "discord-api-types/v10";
import type { CommandHandler, DiscordHono, Rest } from "discord-hono";
import {
  DiscordHono as DHono,
  Rest as DRest,
  _channels_$_messages,
} from "discord-hono";
import type { DiscordEnv } from "../../config/env/discord";
import {
  AppError,
  Err,
  ErrorCodeSchema,
  Ok,
  type Result,
  wrap,
} from "../../pkg/errors";

export type ISlashCommandDefinition = {
  name: string;
  handler: CommandHandler<{
    Bindings?: Record<string, unknown>;
    Variables?: Record<string, unknown>;
  }>;
};

type SendMessageParams = {
  channelId: string;
  content: string;
  embeds?: APIEmbed[];
};

export interface IDiscordClinet {
  sendMessage(params: SendMessageParams): Promise<Result<void, AppError>>;
}

export class DiscordClinet implements IDiscordClinet {
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
  registerCommands(commands: ISlashCommandDefinition[]): void {
    for (const { name, handler } of commands) {
      this.app.command(name, handler);
    }

    this.app.command("", (c) => c.res("Unknown command."));
  }

  /**
   * Send a message to a channel outside of an interaction context.
   */
  async sendMessage(
    params: SendMessageParams,
  ): Promise<Result<void, AppError>> {
    const { channelId, content, embeds } = params;

    const response = await this.rest.post(_channels_$_messages, [channelId], {
      content,
      embeds,
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const rateLimit = response.headers.get("X-RateLimit-Limit");
        const remaining = response.headers.get("X-RateLimit-Remaining");
        const reset = response.headers.get("X-RateLimit-Reset");
        return Err(
          new AppError({
            message: `Rate limited: ${retryAfter}ms, ${rateLimit} requests, ${remaining} remaining, ${reset} reset`,
            code: ErrorCodeSchema.Enum.RATE_LIMITED,
          }),
        );
      }
      return Err(
        new AppError({
          message: `Failed to send message to channel ${channelId}`,
          code: ErrorCodeSchema.Enum.INTERNAL_SERVER_ERROR,
        }),
      );
    }

    return Ok();
  }
}
