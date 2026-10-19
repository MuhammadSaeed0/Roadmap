var a = new Point(1, 2);      // struct (value type)
var b = a;  b.X = 99;         // a.X is still 1

var c = new Customer("Sara"); // class (reference type)
var d = c;  d.Name = "Omar";  // c.Name is now "Omar" — same object

object boxed = 42;            // boxing: the int is copied into a heap object
