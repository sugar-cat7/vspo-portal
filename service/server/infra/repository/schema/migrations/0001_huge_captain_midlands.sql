--> statement-breakpoint
-- Manually set up the trigger https://github.com/drizzle-team/drizzle-orm/issues/843#issuecomment-1885771513
CREATE OR REPLACE FUNCTION create_creator_translation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO creator_translation (id, creator_id, lang_code, name, updated_at)
    VALUES (gen_random_uuid(), NEW.id, 'default', '', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--> statement-breakpoint
CREATE TRIGGER creator_after_insert
AFTER INSERT ON creator
FOR EACH ROW
EXECUTE FUNCTION create_creator_translation();
