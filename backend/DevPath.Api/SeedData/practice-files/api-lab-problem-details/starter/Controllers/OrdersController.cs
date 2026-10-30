using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    [HttpGet("{id:int}")]
    public IActionResult Get(int id) => id == 1 ? Ok(new { id, total = 81.97m }) : throw new NotFoundException($"Order {id} was not found.");

    [HttpPost]
    public IActionResult Create() => throw new ConflictException("An order with this reference already exists.");

    [HttpGet("crash")]
    public IActionResult Crash() => throw new InvalidOperationException("Connection string 'Server=prod;Password=...' is invalid");
}
