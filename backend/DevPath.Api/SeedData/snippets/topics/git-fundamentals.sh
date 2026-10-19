git init
dotnet new gitignore            # ignores bin/, obj/, *.user ...
git status                      # what changed?
git add Program.cs Models/      # stage specific files
git commit -m "Add Employee model and console menu"
git log --oneline --graph       # history
git diff                        # unstaged changes
git restore Program.cs          # discard local changes to a file
git revert <commit-sha>         # undo a pushed commit with a new commit (safe)
git remote add origin https://github.com/<you>/employee-management.git
git push -u origin main
