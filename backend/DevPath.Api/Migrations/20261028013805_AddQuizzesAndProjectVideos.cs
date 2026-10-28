using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizzesAndProjectVideos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectTaskVideos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectTaskId = table.Column<int>(type: "int", nullable: false),
                    VideoId = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    ChannelTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTaskVideos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectTaskVideos_ProjectTasks_ProjectTaskId",
                        column: x => x.ProjectTaskId,
                        principalTable: "ProjectTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    Total = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizAttempts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizAttempts_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    QuestionEn = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    QuestionAr = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    OptionsEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionsAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnswerIndex = table.Column<int>(type: "int", nullable: false),
                    ExplanationEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExplanationAr = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestions_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTaskVideos_ProjectTaskId_VideoId",
                table: "ProjectTaskVideos",
                columns: new[] { "ProjectTaskId", "VideoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_TopicId",
                table: "QuizAttempts",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_QuizAttempts_UserId_TopicId_Level",
                table: "QuizAttempts",
                columns: new[] { "UserId", "TopicId", "Level" });

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_Key",
                table: "QuizQuestions",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestions_TopicId",
                table: "QuizQuestions",
                column: "TopicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectTaskVideos");

            migrationBuilder.DropTable(
                name: "QuizAttempts");

            migrationBuilder.DropTable(
                name: "QuizQuestions");
        }
    }
}
