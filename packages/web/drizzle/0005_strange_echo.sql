CREATE TABLE "chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_key" text NOT NULL,
	"user_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "chat_sessions_session_key_unique" UNIQUE("session_key")
);
--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "allowed_tools" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;