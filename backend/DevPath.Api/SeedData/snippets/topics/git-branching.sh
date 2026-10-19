git switch main
git pull                                  # start from the latest main
git switch -c feature/product-search      # create + switch

# ... work, commit ...
git push -u origin feature/product-search

# Need to switch with unfinished work?
git stash push -m "half-done search"
git switch fix/negative-stock
git switch feature/product-search
git stash pop
