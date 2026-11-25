from chat import build_request, read_reply

def test_body():
    """The body has the model, the settings and the messages in order"""
    body = build_request("What is a token?")
    assert body["model"] == "small-model" and body["temperature"] == 0.2 and body["max_tokens"] == 200
    assert [m["role"] for m in body["messages"]] == ["system", "user"]
    assert body["messages"][-1]["content"] == "What is a token?"

def test_history():
    """History goes between the system message and the new question"""
    history = [{"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hello!"}]
    body = build_request("Next?", history=history, temperature=0)
    assert [m["role"] for m in body["messages"]] == ["system", "user", "assistant", "user"]
    assert body["temperature"] == 0

def test_reply():
    """read_reply returns the text and the total tokens"""
    response = {"choices": [{"message": {"content": "A piece of a word."}}], "usage": {"prompt_tokens": 24, "completion_tokens": 9}}
    assert read_reply(response) == ("A piece of a word.", 33)

def test_empty():
    """No choices raises ValueError"""
    try:
        read_reply({"choices": []})
    except ValueError:
        return
    assert False, "an empty reply should raise ValueError"
