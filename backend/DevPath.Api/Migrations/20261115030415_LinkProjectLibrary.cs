using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkProjectLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GuidedProjectRepositories",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuidedProjectRepositories", x => new { x.UserId, x.ProjectId });
                    table.ForeignKey(
                        name: "FK_GuidedProjectRepositories_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GuidedProjectRepositories_GuidedProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "GuidedProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GuidedProjectTopics",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuidedProjectTopics", x => new { x.ProjectId, x.TopicId });
                    table.ForeignKey(
                        name: "FK_GuidedProjectTopics_GuidedProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "GuidedProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GuidedProjectTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GuidedProjectRepositories_ProjectId",
                table: "GuidedProjectRepositories",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_GuidedProjectTopics_TopicId",
                table: "GuidedProjectTopics",
                column: "TopicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GuidedProjectRepositories");

            migrationBuilder.DropTable(
                name: "GuidedProjectTopics");
        }
    }
}
