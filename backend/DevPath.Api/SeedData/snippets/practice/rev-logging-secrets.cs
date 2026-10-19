public async Task<IActionResult> Login(LoginRequest r)
{
    logger.LogError($"Login attempt {r.Email} / {r.Password}");
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == r.Email);
    if (user is null) { logger.LogInformation("no user"); return BadRequest("Email not registered"); }
    if (!hasher.Verify(user.PasswordHash, r.Password)) return BadRequest("Wrong password");
    var token = tokens.Create(user);
    logger.LogInformation($"Issued token {token} for {user.Email}");
    return Ok(new { token });
}
