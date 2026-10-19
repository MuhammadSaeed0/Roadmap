public record CreateProductRequest(
    string? Name,
    decimal Price,
    int Stock,
    decimal? DiscountPrice);

// TODO: add validation so invalid requests return 400 with field errors
