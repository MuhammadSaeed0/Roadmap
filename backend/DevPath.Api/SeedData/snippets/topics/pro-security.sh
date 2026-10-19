# Find known-vulnerable packages
dotnet list package --vulnerable --include-transitive
npm audit

# Keep secrets out of source control
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<a long random value>"

# Checklist
#  - every endpoint: who may call it? enforced on the SERVER
#  - every query: parameterised (no string concatenation)
#  - every input: validated (length, range, format)
#  - Angular: never use bypassSecurityTrustHtml with user content
#  - errors: no stack traces or SQL in responses
