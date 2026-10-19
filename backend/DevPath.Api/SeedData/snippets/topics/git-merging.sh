# Bring main into your feature branch (keeps history as it happened)
git switch feature/product-search
git merge main

# Or replay your commits on top of main (linear history; only for unshared branches)
git fetch origin
git rebase origin/main
git push --force-with-lease               # needed after rebasing a pushed branch

# See what happened
git log --oneline --graph --all
