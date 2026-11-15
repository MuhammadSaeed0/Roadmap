using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GuidedProjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Skill = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Level = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    EstimatedHours = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SummaryEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummaryAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStack = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    GoalsEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GoalsAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequirementsEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequirementsAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AcceptanceEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AcceptanceAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StretchEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StretchAr = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuidedProjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GuidedProjectSteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    BodyEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CodeLanguage = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    HintsEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HintsAr = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuidedProjectSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuidedProjectSteps_GuidedProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "GuidedProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GuidedStepProgress",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuidedStepProgress", x => new { x.UserId, x.StepId });
                    table.ForeignKey(
                        name: "FK_GuidedStepProgress_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GuidedStepProgress_GuidedProjectSteps_StepId",
                        column: x => x.StepId,
                        principalTable: "GuidedProjectSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GuidedProjects_Key",
                table: "GuidedProjects",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GuidedProjects_Skill_Level_Order",
                table: "GuidedProjects",
                columns: new[] { "Skill", "Level", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_GuidedProjectSteps_Key",
                table: "GuidedProjectSteps",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GuidedProjectSteps_ProjectId_Order",
                table: "GuidedProjectSteps",
                columns: new[] { "ProjectId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_GuidedStepProgress_StepId",
                table: "GuidedStepProgress",
                column: "StepId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GuidedStepProgress");

            migrationBuilder.DropTable(
                name: "GuidedProjectSteps");

            migrationBuilder.DropTable(
                name: "GuidedProjects");
        }
    }
}
