setup:
# If no .env file exists create .env file from template.
ifeq (,$(wildcard ./.env))
	# Create .env file from template
	@cp .env.example .env
	@echo "??  Check if you need to fill in credentials to .env file.\n"
endif
	# Install dependencies.
	@npm install
	# Done.
	@echo ">>  \033[0;32m Setup complete. \033[0m"
	@echo ">>  Use 'make start' to start the local dev server."

start:
	@npm run dev
