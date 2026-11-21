using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkNotesAndDiscussionsToLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Note_SingleLink",
                table: "Notes");

            migrationBuilder.AddColumn<int>(
                name: "GuidedProjectId",
                table: "Notes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GuidedStepOrder",
                table: "Notes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GuidedProjectId",
                table: "Discussions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GuidedStepOrder",
                table: "Discussions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notes_GuidedProjectId",
                table: "Notes",
                column: "GuidedProjectId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Note_SingleLink",
                table: "Notes",
                sql: "(CASE WHEN TopicId IS NULL THEN 0 ELSE 1 END + CASE WHEN ProjectId IS NULL THEN 0 ELSE 1 END + CASE WHEN ProjectTaskId IS NULL THEN 0 ELSE 1 END + CASE WHEN InterviewQuestionId IS NULL THEN 0 ELSE 1 END + CASE WHEN GuidedProjectId IS NULL THEN 0 ELSE 1 END) <= 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Note_StepNeedsProject",
                table: "Notes",
                sql: "GuidedStepOrder IS NULL OR GuidedProjectId IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Discussions_GuidedProjectId",
                table: "Discussions",
                column: "GuidedProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_Discussions_GuidedProjects_GuidedProjectId",
                table: "Discussions",
                column: "GuidedProjectId",
                principalTable: "GuidedProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_GuidedProjects_GuidedProjectId",
                table: "Notes",
                column: "GuidedProjectId",
                principalTable: "GuidedProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Discussions_GuidedProjects_GuidedProjectId",
                table: "Discussions");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_GuidedProjects_GuidedProjectId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_GuidedProjectId",
                table: "Notes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Note_SingleLink",
                table: "Notes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Note_StepNeedsProject",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Discussions_GuidedProjectId",
                table: "Discussions");

            migrationBuilder.DropColumn(
                name: "GuidedProjectId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "GuidedStepOrder",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "GuidedProjectId",
                table: "Discussions");

            migrationBuilder.DropColumn(
                name: "GuidedStepOrder",
                table: "Discussions");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Note_SingleLink",
                table: "Notes",
                sql: "(CASE WHEN TopicId IS NULL THEN 0 ELSE 1 END + CASE WHEN ProjectId IS NULL THEN 0 ELSE 1 END + CASE WHEN ProjectTaskId IS NULL THEN 0 ELSE 1 END + CASE WHEN InterviewQuestionId IS NULL THEN 0 ELSE 1 END) <= 1");
        }
    }
}
