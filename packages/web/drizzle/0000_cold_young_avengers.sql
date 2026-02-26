CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Smithers' NOT NULL,
	"model" text NOT NULL,
	"system_prompt" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"encrypted" boolean DEFAULT false
);
