public partial class AddBarcode : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Step 1: add as nullable so existing rows are valid
        migrationBuilder.AddColumn<string>("Barcode", "Products", maxLength: 20, nullable: true);

        // Step 2: backfill existing data
        migrationBuilder.Sql("UPDATE Products SET Barcode = CONCAT('LEGACY-', Id) WHERE Barcode IS NULL;");

        // Step 3: now make it required
        migrationBuilder.AlterColumn<string>("Barcode", "Products", maxLength: 20, nullable: false,
            oldClrType: typeof(string), oldMaxLength: 20, oldNullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropColumn("Barcode", "Products");
}
