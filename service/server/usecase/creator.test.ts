import { beforeEach, describe, expect, it } from "vitest";
import type { Creators } from "../domain/creator";
import type { IAppContext } from "../infra/dependency";
import { setupTxManager } from "../test/setup";
import { CreatorInteractor } from "./creator";

describe.concurrent("CreatorInteractor", () => {
  let context: IAppContext;
  let interactor: CreatorInteractor;

  beforeEach(async () => {
    context = await setupTxManager();
    interactor = new CreatorInteractor(context);
  });

  describe.concurrent("searchByChannelIds", () => {
    interface TestCase {
      name: string;
      input: {
        channel: {
          id: string;
          memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
        }[];
      };
      expectedError?: string;
    }

    const testCases: TestCase[] = [
      {
        name: "should search creators by channel ids successfully",
        input: {
          channel: [{ id: "channel-1", memberType: "vspo_jp" }],
        },
      },
      {
        name: "should handle empty channel list",
        input: {
          channel: [],
        },
      },
    ];

    for (const tc of testCases) {
      it.concurrent(tc.name, async () => {
        const result = await interactor.searchByChannelIds(tc.input);

        if (tc.expectedError) {
          expect(result.err).toBeTruthy();
          if (result.err) {
            expect(result.err.message).toContain(tc.expectedError);
          }
        } else {
          expect(result.err).toBeFalsy();
          if (!result.err) {
            expect(Array.isArray(result.val)).toBeTruthy();
          }
        }
      });
    }
  });

  describe.concurrent("searchByMemberType", () => {
    interface TestCase {
      name: string;
      input: {
        memberType: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
      };
      expectedError?: string;
      expectedLength?: number;
    }

    const testCases: TestCase[] = [
      {
        name: "should search creators by vspo_jp member type",
        input: { memberType: "vspo_jp" },
        expectedLength: 0,
      },
      {
        name: "should search creators by vspo_en member type",
        input: { memberType: "vspo_en" },
        expectedLength: 0,
      },
      {
        name: "should search creators by vspo_ch member type",
        input: { memberType: "vspo_ch" },
        expectedLength: 0,
      },
      {
        name: "should search creators by general member type",
        input: { memberType: "general" },
        expectedLength: 0,
      },
    ];

    for (const tc of testCases) {
      it.concurrent(tc.name, async () => {
        const result = await interactor.searchByMemberType(tc.input);

        if (tc.expectedError) {
          expect(result.err).toBeTruthy();
          if (result.err) {
            expect(result.err.message).toContain(tc.expectedError);
          }
        } else {
          expect(result.err).toBeFalsy();
          if (!result.err) {
            expect(Array.isArray(result.val)).toBeTruthy();
            if (tc.expectedLength !== undefined) {
              expect(result.val).toHaveLength(tc.expectedLength);
            }
          }
        }
      });
    }
  });

  describe.concurrent("list", () => {
    interface TestCase {
      name: string;
      input: {
        limit: number;
        page: number;
        memberType?: "vspo_jp" | "vspo_en" | "vspo_ch" | "general";
        languageCode?: string;
      };
      expectedError?: string;
      expectedResult?: {
        currentPage: number;
        totalCount?: number;
        creatorsLength?: number;
      };
    }

    const testCases: TestCase[] = [
      {
        name: "should list creators with basic pagination",
        input: {
          limit: 10,
          page: 1,
        },
        expectedResult: {
          currentPage: 1,
          creatorsLength: 6,
        },
      },
      {
        name: "should list creators with member type filter",
        input: {
          limit: 10,
          page: 1,
          memberType: "vspo_jp",
        },
        expectedResult: {
          currentPage: 1,
          creatorsLength: 10,
        },
      },
      {
        name: "should list creators with language code",
        input: {
          limit: 10,
          page: 1,
          languageCode: "en",
        },
        expectedResult: {
          currentPage: 1,
          creatorsLength: 0,
        },
      },
      {
        name: "should list creators with all filters",
        input: {
          limit: 10,
          page: 1,
          memberType: "vspo_jp",
          languageCode: "en",
        },
        expectedResult: {
          currentPage: 1,
          creatorsLength: 0,
        },
      },
    ];

    for (const tc of testCases) {
      it.concurrent(tc.name, async () => {
        const result = await interactor.list(tc.input);

        if (tc.expectedError) {
          expect(result.err).toBeTruthy();
          if (result.err) {
            expect(result.err.message).toContain(tc.expectedError);
          }
        } else {
          expect(result.err).toBeFalsy();
          if (!result.err) {
            expect(result.val.creators).toBeDefined();
            expect(result.val.pagination).toBeDefined();
            expect(result.val.pagination.currentPage).toBe(
              tc.expectedResult?.currentPage,
            );
            if (tc.expectedResult?.creatorsLength !== undefined) {
              expect(result.val.creators).toHaveLength(
                tc.expectedResult.creatorsLength,
              );
            }
          }
        }
      });
    }
  });

  describe.concurrent("translateCreator", () => {
    interface TestCase {
      name: string;
      input: {
        languageCode: string;
        creators: Creators;
      };
      expectedError?: string;
    }

    const testCases: TestCase[] = [
      {
        name: "should translate creators to English",
        input: {
          languageCode: "en",
          creators: [],
        },
      },
      {
        name: "should translate creators to Japanese",
        input: {
          languageCode: "ja",
          creators: [],
        },
      },
    ];

    for (const tc of testCases) {
      it.concurrent(tc.name, async () => {
        const result = await interactor.translateCreator(tc.input);

        if (tc.expectedError) {
          expect(result.err).toBeTruthy();
          if (result.err) {
            expect(result.err.message).toContain(tc.expectedError);
          }
        } else {
          expect(result.err).toBeFalsy();
          if (!result.err) {
            expect(Array.isArray(result.val)).toBeTruthy();
          }
        }
      });
    }
  });
});
