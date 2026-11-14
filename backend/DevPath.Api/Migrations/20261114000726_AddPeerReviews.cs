using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPeerReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "Notifications",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProjectReviewRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    RequesterId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    RepositoryUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ReviewerId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Scores = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClaimedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectReviewRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectReviewRequests_AspNetUsers_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectReviewRequests_AspNetUsers_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProjectReviewRequests_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectReviewRequests_ProjectId",
                table: "ProjectReviewRequests",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectReviewRequests_RequesterId_ProjectId",
                table: "ProjectReviewRequests",
                columns: new[] { "RequesterId", "ProjectId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectReviewRequests_ReviewerId",
                table: "ProjectReviewRequests",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectReviewRequests_Status_ProjectId",
                table: "ProjectReviewRequests",
                columns: new[] { "Status", "ProjectId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectReviewRequests");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "Notifications");
        }
    }
}
