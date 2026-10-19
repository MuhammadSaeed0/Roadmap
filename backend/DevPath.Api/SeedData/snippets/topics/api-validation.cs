public record CreateProductRequest(
    [Required, MaxLength(100)] string? Name,
    [Range(0.01, 1_000_000)] decimal Price,
    [Range(0, int.MaxValue)] int Stock,
    decimal? DiscountPrice) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (DiscountPrice >= Price)
            yield return new ValidationResult("Discount price must be lower than price.", [nameof(DiscountPrice)]);
    }
}

// With [ApiController], an invalid body never reaches your action:
// 400 { "title": "One or more validation errors occurred.",
//       "errors": { "Name": ["The Name field is required."] } }
