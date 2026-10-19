git log --oneline          # find the bad commit, e.g. a1b2c3d
git revert a1b2c3d         # new commit that undoes it — safe on shared branches
git push
