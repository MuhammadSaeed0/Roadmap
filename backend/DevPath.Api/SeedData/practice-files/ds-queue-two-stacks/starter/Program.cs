var queue = new TwoStackQueue<int>();
queue.Enqueue(1);
queue.Enqueue(2);
queue.Enqueue(3);
Console.WriteLine(queue.Dequeue());
Console.WriteLine(queue.Dequeue());
