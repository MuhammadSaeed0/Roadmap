def build_request(question, *, model="small-model", temperature=0.2, max_tokens=200, history=None):
    """The JSON body of a chat call: model, messages, temperature and max_tokens.
    messages = a system message ("You are a helpful tutor."), then the history (if any), then the question as a user message."""
    messages = [{"role": "system", "content": "You are a helpful tutor."}]
    messages += history or []
    messages.append({"role": "user", "content": question})
    return {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens}


def read_reply(response):
    """(text, total_tokens) from a response shaped like
    {"choices": [{"message": {"content": "..."}}], "usage": {"prompt_tokens": 10, "completion_tokens": 5}}.
    Raise ValueError("empty reply") if there are no choices."""
    choices = response.get("choices") or []
    if not choices:
        raise ValueError("empty reply")
    usage = response.get("usage", {})
    return choices[0]["message"]["content"], usage.get("prompt_tokens", 0) + usage.get("completion_tokens", 0)
