CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"surname" varchar(100),
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"age" integer,
	"date_of_birth" timestamp with time zone,
	"photo" text,
	"refresh_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_name_check" CHECK (char_length("users"."name") >= 2),
	CONSTRAINT "users_surname_check" CHECK ("users"."surname" IS NULL OR char_length("users"."surname") >= 2),
	CONSTRAINT "users_age_check" CHECK ("users"."age" IS NULL OR ("users"."age" >= 0 AND "users"."age" <= 150))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at" DESC NULLS LAST);