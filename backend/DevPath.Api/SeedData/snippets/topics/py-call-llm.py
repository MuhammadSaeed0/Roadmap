import os
from openai import OpenAI        # pip install openai

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])   # never put the key in the code

messages = [
    {"role": "system", "content": "You are a patient tutor for first-year students."},
    {"role": "user", "content": "Explain a foreign key in two sentences."},
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    temperature=0.2,
    max_tokens=200,
    timeout=30,
)

print(response.choices[0].message.content)
print("tokens:", response.usage.prompt_tokens, "in,", response.usage.completion_tokens, "out")
