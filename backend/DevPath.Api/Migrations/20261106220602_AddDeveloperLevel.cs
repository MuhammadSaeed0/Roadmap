using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDeveloperLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LevelChanges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Level = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    PreviousLevel = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Xp = table.Column<int>(type: "int", nullable: false),
                    Overall = table.Column<double>(type: "float", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LevelChanges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LevelChanges_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectAssessments",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Scores = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    Verification = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectAssessments", x => new { x.UserId, x.ProjectId });
                    table.ForeignKey(
                        name: "FK_ProjectAssessments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectAssessments_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAnswers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    AttemptId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    Choice = table.Column<int>(type: "int", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAnswers_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_QuizAnswers_QuizAttempts_AttemptId",
                        column: x => x.AttemptId,
                        principalTable: "QuizAttempts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "XpTransactions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    SourceKey = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Seq = table.Column<int>(type: "int", nullable: false),
                    Activity = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Evidence = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Verification = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Balance = table.Column<int>(type: "int", nullable: false),
                    Categories = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_XpTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_XpTransactions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LevelChanges_UserId_ChangedAt",
                table: "LevelChanges",
                columns: new[] { "UserId", "ChangedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAssessments_ProjectId",
                table: "ProjectAssessments",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAnswers_AttemptId",
                table: "QuizAnswers",
                column: "AttemptId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAnswers_UserId_QuestionId",
                table: "QuizAnswers",
                columns: new[] { "UserId", "QuestionId" });

            migrationBuilder.CreateIndex(
                name: "IX_XpTransactions_UserId_CreatedAt",
                table: "XpTransactions",
                columns: new[] { "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_XpTransactions_UserId_SourceKey_Seq",
                table: "XpTransactions",
                columns: new[] { "UserId", "SourceKey", "Seq" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LevelChanges");

            migrationBuilder.DropTable(
                name: "ProjectAssessments");

            migrationBuilder.DropTable(
                name: "QuizAnswers");

            migrationBuilder.DropTable(
                name: "XpTransactions");
        }
    }
}
