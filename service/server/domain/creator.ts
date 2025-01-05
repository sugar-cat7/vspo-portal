import { z } from "zod";
import { ChannelSchema } from "./channel";
import { ThumbnailURLSchema } from "./thumbnail";

const MemberTypeSchema = z.enum(["vspo_jp", "vspo_en", "vspo_ch", "general"]);

const CreatorSchema = z.object({
    id: z.string(),
    name: z.string(),
    memberType: MemberTypeSchema,
    thumbnailURL: ThumbnailURLSchema,
    channel: ChannelSchema.nullable(),
  });
  

  const CreatorsSchema = z.array(CreatorSchema);

    type Creator = z.infer<typeof CreatorSchema>;
    type Creators = z.infer<typeof CreatorsSchema>;

    const createCreator = (creator: Creator): Creator => {
        return CreatorSchema.parse(creator);
    }

    const createCreators = (creators: Creators): Creators => {
        return CreatorsSchema.parse(creators);
    }
    

    export { MemberTypeSchema, CreatorSchema, CreatorsSchema, Creator, Creators, createCreator, createCreators };