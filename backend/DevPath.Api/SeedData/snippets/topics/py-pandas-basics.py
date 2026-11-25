import pandas as pd

df = pd.read_csv("results.csv")          # columns: question, language, prompt, score
print(df.shape)                           # (rows, columns)
print(df.head())

low = df[df["score"] < 3]                 # filter rows
print(len(low), "low scores")

df["long"] = df["question"].str.len() > 120
summary = df.groupby(["prompt", "language"])["score"].mean().round(2)
print(summary.sort_values(ascending=False))

print(df.isna().sum())                    # missing values per column
