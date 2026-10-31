using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeLabPlaygroundAndVideoLanguages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BestScore",
                table: "PracticeProgress",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CheckedCriteria",
                table: "PracticeProgress",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LastScore",
                table: "PracticeProgress",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSubmittedAt",
                table: "PracticeProgress",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SavedFiles",
                table: "PracticeProgress",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Submissions",
                table: "PracticeProgress",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AcceptanceAr",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AcceptanceEn",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BonusAr",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BonusEn",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Dataset",
                table: "PracticeExercises",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequirementsAr",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RequirementsEn",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Runner",
                table: "PracticeExercises",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.AddColumn<string>(
                name: "ScenarioAr",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ScenarioEn",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SolutionFiles",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StarterFiles",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Technologies",
                table: "PracticeExercises",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tests",
                table: "PracticeExercises",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "CuratedVideos",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DurationSeconds",
                table: "CuratedVideos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "CuratedVideos",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "English");

            migrationBuilder.CreateTable(
                name: "PlaygroundProjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Kind = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Template = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    Files = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileCount = table.Column<int>(type: "int", nullable: false),
                    SizeBytes = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaygroundProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlaygroundProjects_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_PracticeProgress_Scores",
                table: "PracticeProgress",
                sql: "(LastScore IS NULL OR LastScore BETWEEN 0 AND 100) AND (BestScore IS NULL OR BestScore BETWEEN 0 AND 100)");

            migrationBuilder.CreateIndex(
                name: "IX_PlaygroundProjects_UserId_UpdatedAt",
                table: "PlaygroundProjects",
                columns: new[] { "UserId", "UpdatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlaygroundProjects");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PracticeProgress_Scores",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "BestScore",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "CheckedCriteria",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "LastScore",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "LastSubmittedAt",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "SavedFiles",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "Submissions",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "AcceptanceAr",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "AcceptanceEn",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "BonusAr",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "BonusEn",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "Dataset",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "RequirementsAr",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "RequirementsEn",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "Runner",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "ScenarioAr",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "ScenarioEn",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "SolutionFiles",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "StarterFiles",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "Technologies",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "Tests",
                table: "PracticeExercises");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "CuratedVideos");

            migrationBuilder.DropColumn(
                name: "DurationSeconds",
                table: "CuratedVideos");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "CuratedVideos");
        }
    }
}
