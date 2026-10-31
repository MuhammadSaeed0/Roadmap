type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "square"; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.width * shape.height;
    case "square": return shape.side ** 2;
    default: {
      const unreachable: never = shape;
      throw new Error("Unknown shape " + JSON.stringify(unreachable));
    }
  }
}

function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle": return `circle with radius ${shape.radius}`;
    case "rect": return `rectangle ${shape.width}×${shape.height}`;
    case "square": return `square with side ${shape.side}`;
  }
}
