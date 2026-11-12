var stack = new MinStack();
stack.Push(5);
stack.Push(2);
stack.Push(8);
Console.WriteLine(stack.Min);
stack.Pop();
stack.Pop();
Console.WriteLine(stack.Min);
