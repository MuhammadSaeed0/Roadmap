public class ProductsApiTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Get_unknown_product_returns_404()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/products/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_without_name_returns_validation_error()
    {
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/products", new { price = 10 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();
        Assert.Contains("Name", problem!.Errors.Keys);
    }
}
