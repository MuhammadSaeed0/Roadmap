using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTopicObjectivesAndMarketDemand : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "Topics",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObjectivesAr",
                table: "Topics",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ObjectivesEn",
                table: "Topics",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "TopicDemand",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Technology = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Postings = table.Column<int>(type: "int", nullable: false),
                    Required = table.Column<int>(type: "int", nullable: false),
                    Share = table.Column<double>(type: "float", nullable: false),
                    TotalPostings = table.Column<int>(type: "int", nullable: false),
                    Run = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PeriodFrom = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PeriodTo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicDemand", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TopicDemand_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TopicDemand_TopicId",
                table: "TopicDemand",
                column: "TopicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TopicDemand");

            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "Topics");

            migrationBuilder.DropColumn(
                name: "ObjectivesAr",
                table: "Topics");

            migrationBuilder.DropColumn(
                name: "ObjectivesEn",
                table: "Topics");
        }
    }
}
