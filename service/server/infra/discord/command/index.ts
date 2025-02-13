import {
  Button,
  type CommandHandler,
  type ComponentHandler,
  Components,
  Select,
} from "discord-hono";
import type { ApplicationService } from "../../../cmd/server/internal/application";
import { LangCodeLabelMapping } from "../../../domain/translate";

const MESSAGES = {
  // spoduleSettingCommand
  SPODULE_SETTING_LABEL: "Spodule settings / すぽじゅーるの設定",
  BOT_ADD_BUTTON_LABEL: "Add Spodule Bot / すぽじゅーるBotを追加する",
  BOT_REMOVE_BUTTON_LABEL: "Stop Streaming Information / 配信情報の停止",
  LANG_SETTING_BUTTON_LABEL: "Language Settings / 言語設定",

  // botAddComponent
  BOT_ADD_ERROR:
    "An error occurred. Please try again later. / エラーが発生しました。時間をおいて再度試してください。",
  BOT_ADD_SUCCESS: (channelName: string) =>
    `${channelName} has been added to Spodule bot / ${channelName}にすぽじゅーるbotが追加されました`,

  // botRemoveComponent
  BOT_REMOVE_LABEL:
    "This channel's streaming will be stopped / このチャンネルへの配信が停止されます",
  BOT_REMOVE_BUTTON_STOP: "Stop / 停止する",
  BOT_REMOVE_BUTTON_CANCEL: "Cancel / キャンセル",

  // yesBotRemoveComponent
  YES_BOT_REMOVE_ERROR:
    "An error occurred. Please try again later. / エラーが発生しました。時間をおいて再度試してください。",
  YES_BOT_REMOVE_SUCCESS: (channelName: string) =>
    `The Spodule bot's streaming has been stopped in this channel / ${channelName}のすぽじゅーるbotの配信が停止されました`,

  // cancelComponent
  CANCELLED: "Cancelled / キャンセルしました",

  // langSettingComponent
  LANG_SETTING_LABEL: "Channel Language settings / チャンネル言語設定",

  // langSelectComponent
  LANG_SELECT_ERROR:
    "An error occurred. Please try again later. / エラーが発生しました。時間をおいて再度試してください。",
  LANG_SELECT_SUCCESS: (langName: string) =>
    `Language set to ${langName} / 言語を${langName}に設定しました`,

  // announceCommand
  ANNOUNCE_SENT:
    "Announcement sent to all channels. / すべてのチャンネルにアナウンスが送信されました。",
} as const;

type Env = {
  Bindings?: Record<string, unknown>;
  Variables?: Record<string, unknown>;
};

export type IDiscordSlashDefinition<T extends Env> = {
  name: string;
  handler: CommandHandler<T>;
};

export type IDiscordComponentDefinition<T extends Env> = {
  name: string;
  handler: ComponentHandler<T, Button | Select>;
};

export type DiscordCommandEnv = {
  Bindings: {
    APP_WORKER: Service<ApplicationService>;
  };
};

/**
 * /spodule setting - Allows users to configure the bot settings.
 */
export const spoduleSettingCommand: IDiscordSlashDefinition<DiscordCommandEnv> =
  {
    name: "setting",
    handler: async (c) => {
      return c.res({
        content: MESSAGES.SPODULE_SETTING_LABEL,
        components: new Components().row(
          new Button(
            botAddComponent.name,
            MESSAGES.BOT_ADD_BUTTON_LABEL,
            "Success",
          ),
          new Button(
            botRemoveComponent.name,
            MESSAGES.BOT_REMOVE_BUTTON_LABEL,
            "Danger",
          ),
          new Button(
            langSettingComponent.name,
            MESSAGES.LANG_SETTING_BUTTON_LABEL,
            "Primary",
          ),
        ),
      });
    },
  };

/**
 * botAddComponent - Allows users to add the bot to a channel.
 */
export const botAddComponent: IDiscordComponentDefinition<DiscordCommandEnv> = {
  name: "bot-add-setting",
  handler: async (c) => {
    const u = await c.env.APP_WORKER.newDiscordUsecase();
    const r = await u.adjustBotChannel({
      type: "add",
      serverId: c.interaction.guild_id ?? "",
      targetChannelId: c.interaction.channel.id,
    });

    if (r.err) {
      return c.resUpdate({
        content: MESSAGES.BOT_ADD_ERROR,
        components: [],
      });
    }

    await u.batchUpsertEnqueue([r.val]);

    return c.resUpdate({
      content: MESSAGES.BOT_ADD_SUCCESS(c.interaction.channel.name ?? ""),
      components: [],
    });
  },
};

/**
 * botRemoveComponent - Allows users to remove the bot from a channel.
 */
export const botRemoveComponent: IDiscordComponentDefinition<DiscordCommandEnv> =
  {
    name: "bot-remove-setting",
    handler: async (c) => {
      return c.resUpdate({
        content: MESSAGES.BOT_REMOVE_LABEL,
        components: new Components().row(
          new Button(
            yesBotRemoveComponent.name,
            MESSAGES.BOT_REMOVE_BUTTON_STOP,
            "Danger",
          ),
          new Button(
            cancelComponent.name,
            MESSAGES.BOT_REMOVE_BUTTON_CANCEL,
            "Primary",
          ),
        ),
      });
    },
  };

/**
 * yesBotRemoveComponent - Allows users to confirm the bot removal.
 */
export const yesBotRemoveComponent: IDiscordComponentDefinition<DiscordCommandEnv> =
  {
    name: "yes-bot-remove-setting",
    handler: async (c) => {
      const u = await c.env.APP_WORKER.newDiscordUsecase();
      const r = await u.batchDeleteChannelsByRowChannelIds([
        c.interaction.channel.id,
      ]);

      if (r.err) {
        return c.resUpdate({
          content: MESSAGES.YES_BOT_REMOVE_ERROR,
          components: [],
        });
      }

      return c.resUpdate({
        content: MESSAGES.YES_BOT_REMOVE_SUCCESS(
          c.interaction.channel.name ?? "",
        ),
        components: [],
      });
    },
  };

/**
 * cancelComponent - Allows users to cancel an action.
 */
export const cancelComponent: IDiscordComponentDefinition<DiscordCommandEnv> = {
  name: "cancel",
  handler: async (c) => {
    return c.resUpdate({
      content: MESSAGES.CANCELLED,
      components: [],
    });
  },
};

/**
 * langSettingComponent - Allows users to set the language.
 */
export const langSettingComponent: IDiscordComponentDefinition<DiscordCommandEnv> =
  {
    name: "lang-setting",
    handler: async (c) => {
      return c.resUpdate({
        content: MESSAGES.LANG_SETTING_LABEL,
        components: new Components().row(
          new Select(langSelectComponent.name, "String").options(
            ...Object.entries(LangCodeLabelMapping).map(([value, label]) => ({
              value,
              label,
            })),
          ),
        ),
      });
    },
  };

/**
 * langSelectComponent - Allows users to select the language.
 */
export const langSelectComponent: IDiscordComponentDefinition<DiscordCommandEnv> =
  {
    name: "lang-select",
    handler: async (c) => {
      // Check if user has selected a language
      if ("values" in c.interaction.data) {
        const selectedValue = c.interaction.data.values.at(
          0,
        ) as keyof typeof LangCodeLabelMapping;
        const u = await c.env.APP_WORKER.newDiscordUsecase();

        // Adjust the bot channel with the newly selected language
        const r = await u.adjustBotChannel({
          type: "add",
          serverId: c.interaction.guild_id ?? "",
          targetChannelId: c.interaction.channel.id,
          channelLangaugeCode: selectedValue,
        });

        if (r.err) {
          return c.resUpdate({
            content: MESSAGES.LANG_SELECT_ERROR,
            components: [],
          });
        }

        await u.batchUpsertEnqueue([r.val]);
        return c.resUpdate({
          content: MESSAGES.LANG_SELECT_SUCCESS(
            LangCodeLabelMapping[selectedValue],
          ),
          components: [],
        });
      }
      return c.resUpdate({
        content: MESSAGES.LANG_SELECT_ERROR,
        components: [],
      });
    },
  };

/**
 * /announce - Allows admins to send custom messages to all channels.
 */
export const announceCommand: IDiscordSlashDefinition<DiscordCommandEnv> = {
  name: "announce",
  handler: async (c) => {
    return c.res(MESSAGES.ANNOUNCE_SENT);
  },
};
