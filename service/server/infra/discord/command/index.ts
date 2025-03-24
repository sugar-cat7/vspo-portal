import { OpenFeature } from "@openfeature/server-sdk";
import {
  Button,
  type CommandHandler,
  type ComponentHandler,
  Components,
  Select,
} from "discord-hono";
import type { ApplicationService } from "../../../cmd/server/internal/application";
import { LangCodeLabelMapping } from "../../../domain/translate";
import { AppLogger } from "../../../pkg/logging";

const MESSAGES = {
  // spoduleSettingCommand
  SPODULE_SETTING_LABEL: "Spodule settings / すぽじゅーるの設定",
  BOT_ADD_BUTTON_LABEL: "Add Spodule Bot / すぽじゅーるBotを追加する",
  BOT_REMOVE_BUTTON_LABEL: "Stop Streaming Information / 配信情報の停止",
  LANG_SETTING_BUTTON_LABEL: "Language Settings / 言語設定",
  MEMBER_TYPE_SETTING_BUTTON_LABEL: "Member Type Settings / メンバータイプ設定",

  // memberTypeSettingComponent
  MEMBER_TYPE_SETTING_LABEL:
    "Select member type to display / 表示するメンバータイプを選択",
  MEMBER_TYPE_SELECT_SUCCESS: (type: string) =>
    `Member type set to ${type} / メンバータイプを${type}に設定しました`,
  MEMBER_TYPE_SELECT_ERROR:
    "An error occurred. Please try again later. / エラーが発生しました。時間をおいて再度試してください。",

  // botAddComponent
  BOT_ADD_ERROR:
    "An error occurred. Please try again later. / エラーが発生しました。時間をおいて再度試してください。",

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

  // bot
  BOT_ADD_SUCCESS:
    "すぽじゅーるは、ぶいすぽっ!メンバーの配信(Youtube/Twitch/ツイキャス/ニコニコ)や切り抜きを一覧で確認できる非公式サイトです。\nSpodule aggregates schedules for Japan's Vtuber group, Vspo.\n\nWeb版はこちら：https://www.vspo-schedule.com/schedule/all",
} as const;

const MemberTypeLabelMapping = {
  vspo_jp: "VSPO JP Members / ぶいすぽっ！JPメンバー",
  vspo_en: "VSPO EN Members / ぶいすぽっ！ENメンバー",
  // vspo_ch: "VSPO CH Members / ぶいすぽっ！CHメンバー",
  vspo_all: "All VSPO Members / すべてのぶいすぽっ！メンバー",
  // general: "General / 一般",
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
      AppLogger.info("Spodule setting command", {
        server_id: c.interaction.guild_id || c.interaction.guild?.id || "",
        channel_id: c.interaction.channel.id,
      });
      const u = await c.env.APP_WORKER.newDiscordUsecase();
      const r = await u.existsChannel(c.interaction.channel.id);
      if (r.err || !r.val) {
        return c.res({
          content: MESSAGES.SPODULE_SETTING_LABEL,
          components: new Components().row(
            new Button(
              botAddComponent.name,
              MESSAGES.BOT_ADD_BUTTON_LABEL,
              "Success",
            ),
          ),
        });
      }

      const client = OpenFeature.getClient();
      const enabled = await client.getBooleanValue(
        "discord-translation-setting",
        false,
      );

      const components = new Components();
      const buttons: Button<"Success" | "Danger" | "Primary">[] = [
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
      ];

      if (enabled) {
        buttons.push(
          new Button(
            langSettingComponent.name,
            MESSAGES.LANG_SETTING_BUTTON_LABEL,
            "Primary",
          ),
        );
      }

      buttons.push(
        new Button(
          memberTypeSettingComponent.name,
          MESSAGES.MEMBER_TYPE_SETTING_BUTTON_LABEL,
          "Primary",
        ),
      );

      return c.res({
        content: MESSAGES.SPODULE_SETTING_LABEL,
        components: components.row(...buttons),
      });
    },
  };

/**
 * botAddComponent - Allows users to add the bot to a channel.
 */
export const botAddComponent: IDiscordComponentDefinition<DiscordCommandEnv> = {
  name: "bot-add-setting",
  handler: async (c) => {
    AppLogger.info("Bot add component", {
      server_id: c.interaction.guild_id || c.interaction.guild?.id || "",
      channel_id: c.interaction.channel.id,
    });
    const u = await c.env.APP_WORKER.newDiscordUsecase();
    const r = await u.adjustBotChannel({
      type: "add",
      serverId: c.interaction.guild_id || c.interaction.guild?.id || "",
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
      content: MESSAGES.BOT_ADD_SUCCESS,
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
      let response: { content: string; components: [] };

      const r = await u.batchDeleteChannelsByRowChannelIds([
        c.interaction.channel.id,
      ]);

      if (r.err) {
        response = {
          content: MESSAGES.YES_BOT_REMOVE_ERROR,
          components: [],
        };
      } else {
        response = {
          content: MESSAGES.YES_BOT_REMOVE_SUCCESS(
            c.interaction.channel.name ?? "",
          ),
          components: [],
        };
      }

      return c.resUpdate(response);
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
      AppLogger.info("Lang select component", {
        server_id: c.interaction.guild_id || c.interaction.guild?.id || "",
        channel_id: c.interaction.channel.id,
        selected_value: c.interaction.data,
      });
      // Check if user has selected a language
      if ("values" in c.interaction.data) {
        const selectedValue = c.interaction.data.values.at(
          0,
        ) as keyof typeof LangCodeLabelMapping;
        const u = await c.env.APP_WORKER.newDiscordUsecase();

        // Adjust the bot channel with the newly selected language
        const r = await u.adjustBotChannel({
          type: "add",
          serverId: c.interaction.guild_id || c.interaction.guild?.id || "",
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
        await u.deleteMessageInChannelEnqueue(c.interaction.channel.id);
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
 * memberTypeSettingComponent - Allows users to set the member type.
 */
export const memberTypeSettingComponent: IDiscordComponentDefinition<DiscordCommandEnv> =
  {
    name: "member-type-setting",
    handler: async (c) => {
      return c.resUpdate({
        content: MESSAGES.MEMBER_TYPE_SETTING_LABEL,
        components: new Components().row(
          new Select(memberTypeSelectComponent.name, "String").options(
            ...Object.entries(MemberTypeLabelMapping).map(([value, label]) => ({
              value,
              label,
            })),
          ),
        ),
      });
    },
  };

/**
 * memberTypeSelectComponent - Allows users to select the member type.
 */
export const memberTypeSelectComponent: IDiscordComponentDefinition<DiscordCommandEnv> =
  {
    name: "member-type-select",
    handler: async (c) => {
      AppLogger.info("Member type select component", {
        server_id: c.interaction.guild_id || c.interaction.guild?.id || "",
        channel_id: c.interaction.channel.id,
        selected_value: c.interaction.data,
      });

      if ("values" in c.interaction.data) {
        const selectedValue = c.interaction.data.values.at(
          0,
        ) as keyof typeof MemberTypeLabelMapping;
        const u = await c.env.APP_WORKER.newDiscordUsecase();

        // Adjust the bot channel with the newly selected member type
        const r = await u.adjustBotChannel({
          type: "add",
          serverId: c.interaction.guild_id || c.interaction.guild?.id || "",
          targetChannelId: c.interaction.channel.id,
          memberType: selectedValue,
        });

        if (r.err) {
          return c.resUpdate({
            content: MESSAGES.MEMBER_TYPE_SELECT_ERROR,
            components: [],
          });
        }

        await u.batchUpsertEnqueue([r.val]);
        await u.deleteMessageInChannelEnqueue(c.interaction.channel.id);
        return c.resUpdate({
          content: MESSAGES.MEMBER_TYPE_SELECT_SUCCESS(
            MemberTypeLabelMapping[selectedValue],
          ),
          components: [],
        });
      }
      return c.resUpdate({
        content: MESSAGES.MEMBER_TYPE_SELECT_ERROR,
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
