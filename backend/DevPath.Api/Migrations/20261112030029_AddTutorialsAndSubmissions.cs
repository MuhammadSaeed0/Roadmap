using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTutorialsAndSubmissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PracticeSubmissions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    Passed = table.Column<int>(type: "int", nullable: false),
                    Total = table.Column<int>(type: "int", nullable: false),
                    Files = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PracticeSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PracticeSubmissions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PracticeSubmissions_PracticeExercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "PracticeExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TopicLessons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    BodyEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CodeLanguage = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Output = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicLessons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TopicLessons_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSubmissions_ExerciseId",
                table: "PracticeSubmissions",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeSubmissions_UserId_ExerciseId_CreatedAt",
                table: "PracticeSubmissions",
                columns: new[] { "UserId", "ExerciseId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TopicLessons_Key",
                table: "TopicLessons",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TopicLessons_TopicId_Order",
                table: "TopicLessons",
                columns: new[] { "TopicId", "Order" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PracticeSubmissions");

            migrationBuilder.DropTable(
                name: "TopicLessons");
        }
    }
}
