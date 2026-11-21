using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLibraryPeerReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "ProjectReviewRequests",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "GuidedProjectId",
                table: "ProjectReviewRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GuidedProjectId",
                table: "Notifications",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectReviewRequests_GuidedProjectId",
                table: "ProjectReviewRequests",
                column: "GuidedProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectReviewRequests_RequesterId_GuidedProjectId",
                table: "ProjectReviewRequests",
                columns: new[] { "RequesterId", "GuidedProjectId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectReviewRequests_Status_GuidedProjectId",
                table: "ProjectReviewRequests",
                columns: new[] { "Status", "GuidedProjectId" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_ProjectReviewRequests_OneProject",
                table: "ProjectReviewRequests",
                sql: "(ProjectId IS NULL AND GuidedProjectId IS NOT NULL) OR (ProjectId IS NOT NULL AND GuidedProjectId IS NULL)");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectReviewRequests_GuidedProjects_GuidedProjectId",
                table: "ProjectReviewRequests",
                column: "GuidedProjectId",
                principalTable: "GuidedProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectReviewRequests_GuidedProjects_GuidedProjectId",
                table: "ProjectReviewRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProjectReviewRequests_GuidedProjectId",
                table: "ProjectReviewRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProjectReviewRequests_RequesterId_GuidedProjectId",
                table: "ProjectReviewRequests");

            migrationBuilder.DropIndex(
                name: "IX_ProjectReviewRequests_Status_GuidedProjectId",
                table: "ProjectReviewRequests");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ProjectReviewRequests_OneProject",
                table: "ProjectReviewRequests");

            migrationBuilder.DropColumn(
                name: "GuidedProjectId",
                table: "ProjectReviewRequests");

            migrationBuilder.DropColumn(
                name: "GuidedProjectId",
                table: "Notifications");

            migrationBuilder.AlterColumn<int>(
                name: "ProjectId",
                table: "ProjectReviewRequests",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
