import { AppLogger } from "@vspo-lab/logging";
import type { DiscordServer, Stream } from "../../../domain";
import { t } from "../../../domain/service/i18n";
import type { IDiscordInteractor } from "../../../usecase";
import { BaseHandler } from "./base";

type DiscordSend = Stream & { kind: "discord-send-message" };
type UpsertDiscordServer = DiscordServer & { kind: "upsert-discord-server" };
type DeleteMessageInChannel = {
  channelId: string;
  kind: "delete-message-in-channel";
};

export type DiscordMessage =
  | DiscordSend
  | UpsertDiscordServer
  | DeleteMessageInChannel;

export class DiscordHandler extends BaseHandler<DiscordMessage> {
  #discordInteractor: IDiscordInteractor;

  constructor(discordInteractor: IDiscordInteractor) {
    super();
    this.#discordInteractor = discordInteractor;
  }

  async processUpsertDiscordServer(
    messages: UpsertDiscordServer[],
  ): Promise<void> {
    AppLogger.info(
      `Processing ${messages.length} messages of kind: upsert-discord-server`,
    );

    AppLogger.info(`Upserting Discord servers: ${messages.length}`);
    AppLogger.debug("Discord servers", {
      servers: messages,
    });

    const sv = await this.#discordInteractor.batchUpsert(messages);
    if (sv.err) {
      AppLogger.error(`Failed to upsert discord servers: ${sv.err.message}`);
      throw sv.err;
    }

    // initial add channel
    const initialAddChannel = messages.flatMap((server) =>
      server.discordChannels.filter((ch) => ch.isInitialAdd),
    );

    if (initialAddChannel.length > 0) {
      AppLogger.info("Initial add channel", {
        channels: initialAddChannel,
      });

      await Promise.allSettled(
        initialAddChannel.map((ch) =>
          this.#discordInteractor.sendAdminMessage({
            channelId: ch.rawId,
            content: t("initialAddChannel.success"),
          }),
        ),
      );
    }
  }

  async processDeleteMessageInChannel(
    messages: DeleteMessageInChannel[],
  ): Promise<void> {
    AppLogger.info(
      `Processing ${messages.length} messages of kind: delete-message-in-channel`,
    );

    if (!messages.length) {
      AppLogger.error("Invalid delete message in channel");
      return;
    }

    AppLogger.info("Deleting messages in channels", {
      channelIds: messages,
    });

    await Promise.allSettled(
      messages.map((msg) =>
        this.#discordInteractor.deleteAllMessagesInChannel(msg.channelId),
      ),
    );
  }

  isUpsertDiscordServer(message: unknown): message is UpsertDiscordServer {
    return (
      typeof message === "object" &&
      message !== null &&
      "kind" in message &&
      message.kind === "upsert-discord-server"
    );
  }

  isDeleteMessageInChannel(
    message: unknown,
  ): message is DeleteMessageInChannel {
    return (
      typeof message === "object" &&
      message !== null &&
      "kind" in message &&
      message.kind === "delete-message-in-channel"
    );
  }

  async process(messages: unknown[]): Promise<void> {
    const upsertDiscordServers: UpsertDiscordServer[] = [];
    const deleteMessageInChannels: DeleteMessageInChannel[] = [];

    for (const message of messages) {
      if (this.isUpsertDiscordServer(message)) {
        upsertDiscordServers.push(message);
      } else if (this.isDeleteMessageInChannel(message)) {
        deleteMessageInChannels.push(message);
      }
    }

    if (upsertDiscordServers.length > 0) {
      await this.processUpsertDiscordServer(upsertDiscordServers);
    }

    if (deleteMessageInChannels.length > 0) {
      await this.processDeleteMessageInChannel(deleteMessageInChannels);
    }
  }
}
