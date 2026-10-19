public async Task<IActionResult> Login(LoginRequest r, CancellationToken ct)
{
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == r.Email, ct);
    if (user is null || !hasher.Verify(user.PasswordHash, r.Password))
    {
        logger.LogWarning("Failed login for {EmailHash}", Hash(r.Email));   // no password, no raw email
        return Unauthorized(new { code = "invalid_credentials" });           // same answer for both cases
    }

    logger.LogInformation("User {UserId} signed in", user.Id);               // never log the token
    return Ok(new { token = tokens.Create(user) });
}
