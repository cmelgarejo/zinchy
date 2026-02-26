CREATE TABLE "invites" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"email" text,
	"role" text DEFAULT 'user' NOT NULL,
	"type" text DEFAULT 'invite' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"claimed_at" timestamp,
	"claimed_by_user_id" text,
	CONSTRAINT "invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "agent_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "agent_roles" CASCADE;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "is_personal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_claimed_by_user_id_user_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Backfill: make the first agent (Smithers) personal to the admin
UPDATE "agents"
SET "owner_id" = (SELECT "id" FROM "user" WHERE "role" = 'admin' ORDER BY "id" LIMIT 1),
    "is_personal" = true
WHERE "id" = (SELECT "id" FROM "agents" ORDER BY "created_at" ASC LIMIT 1)
  AND (SELECT COUNT(*) FROM "user") > 0;