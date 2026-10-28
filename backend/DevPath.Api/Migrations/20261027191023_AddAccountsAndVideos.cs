using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountsAndVideos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_TopicProgress",
                table: "TopicProgress");

            migrationBuilder.DropIndex(
                name: "IX_TopicProgress_Status",
                table: "TopicProgress");

            migrationBuilder.DropIndex(
                name: "IX_StudySessions_SessionDate",
                table: "StudySessions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ReviewSchedules",
                table: "ReviewSchedules");

            migrationBuilder.DropIndex(
                name: "IX_ReviewSchedules_NextReviewOn",
                table: "ReviewSchedules");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProjectTaskProgress",
                table: "ProjectTaskProgress");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PracticeProgress",
                table: "PracticeProgress");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PortfolioChecks",
                table: "PortfolioChecks");

            migrationBuilder.DropIndex(
                name: "IX_Notes_UpdatedAt",
                table: "Notes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LearningPreferences",
                table: "LearningPreferences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InterviewProgress",
                table: "InterviewProgress");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "LearningPreferences");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "TopicProgress",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "StudySessions",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "ReviewSchedules",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "ProjectTaskProgress",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "PracticeProgress",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "PortfolioChecks",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Notes",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "LearningPreferences",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "InterviewProgress",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TopicProgress",
                table: "TopicProgress",
                columns: new[] { "UserId", "TopicId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReviewSchedules",
                table: "ReviewSchedules",
                columns: new[] { "UserId", "TopicId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProjectTaskProgress",
                table: "ProjectTaskProgress",
                columns: new[] { "UserId", "ProjectTaskId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_PracticeProgress",
                table: "PracticeProgress",
                columns: new[] { "UserId", "ExerciseId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_PortfolioChecks",
                table: "PortfolioChecks",
                columns: new[] { "UserId", "ProjectId", "ChecklistItemId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_LearningPreferences",
                table: "LearningPreferences",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InterviewProgress",
                table: "InterviewProgress",
                columns: new[] { "UserId", "QuestionId" });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            // Data saved before accounts existed has no owner. Nothing is deleted and nothing is given to a
            // real account here: it is kept under a placeholder account that can't sign in (no password,
            // locked out). LegacyData:AssignToEmail moves it to an account you choose (see Data/LegacyData.cs).
            // The single default preferences row the old seeder created holds no personal choices, so it is dropped.
            migrationBuilder.Sql(@"
DELETE FROM LearningPreferences
 WHERE DailyGoalMinutes = 60 AND AllowSkippingPrerequisites = 0 AND FocusSkill IS NULL AND WeekStartsOn = N'Monday';

IF EXISTS (SELECT 1 FROM TopicProgress) OR EXISTS (SELECT 1 FROM StudySessions) OR EXISTS (SELECT 1 FROM Notes)
   OR EXISTS (SELECT 1 FROM ReviewSchedules) OR EXISTS (SELECT 1 FROM ProjectTaskProgress) OR EXISTS (SELECT 1 FROM PortfolioChecks)
   OR EXISTS (SELECT 1 FROM PracticeProgress) OR EXISTS (SELECT 1 FROM InterviewProgress) OR EXISTS (SELECT 1 FROM LearningPreferences)
   OR EXISTS (SELECT 1 FROM Projects WHERE RepositoryUrl IS NOT NULL)
BEGIN
    INSERT INTO AspNetUsers (Id, FullName, CreatedAt, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
                             PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled,
                             LockoutEnd, LockoutEnabled, AccessFailedCount)
    VALUES (N'legacy-local-data', N'Data from before accounts', SYSUTCDATETIME(),
            N'legacy-data@devpath.local', N'LEGACY-DATA@DEVPATH.LOCAL', N'legacy-data@devpath.local', N'LEGACY-DATA@DEVPATH.LOCAL', 0,
            NULL, CONVERT(nvarchar(36), NEWID()), CONVERT(nvarchar(36), NEWID()), NULL, 0, 0,
            '9999-12-31T00:00:00+00:00', 1, 0);

    UPDATE TopicProgress       SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE StudySessions       SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE Notes               SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE ReviewSchedules     SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE ProjectTaskProgress SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE PortfolioChecks     SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE PracticeProgress    SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE InterviewProgress   SET UserId = N'legacy-local-data' WHERE UserId = N'';
    UPDATE LearningPreferences SET UserId = N'legacy-local-data' WHERE UserId = N'';
END");

            migrationBuilder.CreateTable(
                name: "TopicVideoCache",
                columns: table => new
                {
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    Query = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    VideosJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FetchedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TopicVideoCache", x => x.TopicId);
                    table.ForeignKey(
                        name: "FK_TopicVideoCache_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectRepositories",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    RepositoryUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectRepositories", x => new { x.UserId, x.ProjectId });
                    table.ForeignKey(
                        name: "FK_ProjectRepositories_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectRepositories_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(@"
INSERT INTO ProjectRepositories (UserId, ProjectId, RepositoryUrl, UpdatedAt)
SELECT N'legacy-local-data', Id, RepositoryUrl, SYSUTCDATETIME() FROM Projects WHERE RepositoryUrl IS NOT NULL;");

            migrationBuilder.DropColumn(
                name: "RepositoryUrl",
                table: "Projects");


            migrationBuilder.CreateTable(
                name: "UserTopicVideos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    VideoId = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    ChannelTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTopicVideos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserTopicVideos_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserTopicVideos_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoProgress",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    VideoId = table.Column<string>(type: "nvarchar(11)", maxLength: 11, nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    IsWatched = table.Column<bool>(type: "bit", nullable: false),
                    IsBookmarked = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoProgress", x => new { x.UserId, x.VideoId });
                    table.ForeignKey(
                        name: "FK_VideoProgress_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VideoProgress_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TopicProgress_TopicId",
                table: "TopicProgress",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_TopicProgress_UserId_Status",
                table: "TopicProgress",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_StudySessions_UserId_SessionDate",
                table: "StudySessions",
                columns: new[] { "UserId", "SessionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ReviewSchedules_TopicId",
                table: "ReviewSchedules",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewSchedules_UserId_NextReviewOn",
                table: "ReviewSchedules",
                columns: new[] { "UserId", "NextReviewOn" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectTaskProgress_ProjectTaskId",
                table: "ProjectTaskProgress",
                column: "ProjectTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_PracticeProgress_ExerciseId",
                table: "PracticeProgress",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioChecks_ProjectId",
                table: "PortfolioChecks",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UserId_UpdatedAt",
                table: "Notes",
                columns: new[] { "UserId", "UpdatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewProgress_QuestionId",
                table: "InterviewProgress",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail",
                unique: true,
                filter: "[NormalizedEmail] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectRepositories_ProjectId",
                table: "ProjectRepositories",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTopicVideos_TopicId",
                table: "UserTopicVideos",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTopicVideos_UserId_TopicId_VideoId",
                table: "UserTopicVideos",
                columns: new[] { "UserId", "TopicId", "VideoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VideoProgress_TopicId",
                table: "VideoProgress",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoProgress_UserId_TopicId",
                table: "VideoProgress",
                columns: new[] { "UserId", "TopicId" });

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewProgress_AspNetUsers_UserId",
                table: "InterviewProgress",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LearningPreferences_AspNetUsers_UserId",
                table: "LearningPreferences",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_AspNetUsers_UserId",
                table: "Notes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PortfolioChecks_AspNetUsers_UserId",
                table: "PortfolioChecks",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeProgress_AspNetUsers_UserId",
                table: "PracticeProgress",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectTaskProgress_AspNetUsers_UserId",
                table: "ProjectTaskProgress",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReviewSchedules_AspNetUsers_UserId",
                table: "ReviewSchedules",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudySessions_AspNetUsers_UserId",
                table: "StudySessions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TopicProgress_AspNetUsers_UserId",
                table: "TopicProgress",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Only safe while at most one account has data: the old tables allow one row per topic/task/exercise.
            migrationBuilder.DropForeignKey(
                name: "FK_InterviewProgress_AspNetUsers_UserId",
                table: "InterviewProgress");

            migrationBuilder.DropForeignKey(
                name: "FK_LearningPreferences_AspNetUsers_UserId",
                table: "LearningPreferences");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_AspNetUsers_UserId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_PortfolioChecks_AspNetUsers_UserId",
                table: "PortfolioChecks");

            migrationBuilder.DropForeignKey(
                name: "FK_PracticeProgress_AspNetUsers_UserId",
                table: "PracticeProgress");

            migrationBuilder.DropForeignKey(
                name: "FK_ProjectTaskProgress_AspNetUsers_UserId",
                table: "ProjectTaskProgress");

            migrationBuilder.DropForeignKey(
                name: "FK_ReviewSchedules_AspNetUsers_UserId",
                table: "ReviewSchedules");

            migrationBuilder.DropForeignKey(
                name: "FK_StudySessions_AspNetUsers_UserId",
                table: "StudySessions");

            migrationBuilder.DropForeignKey(
                name: "FK_TopicProgress_AspNetUsers_UserId",
                table: "TopicProgress");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "ProjectRepositories");

            migrationBuilder.DropTable(
                name: "TopicVideoCache");

            migrationBuilder.DropTable(
                name: "UserTopicVideos");

            migrationBuilder.DropTable(
                name: "VideoProgress");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TopicProgress",
                table: "TopicProgress");

            migrationBuilder.DropIndex(
                name: "IX_TopicProgress_TopicId",
                table: "TopicProgress");

            migrationBuilder.DropIndex(
                name: "IX_TopicProgress_UserId_Status",
                table: "TopicProgress");

            migrationBuilder.DropIndex(
                name: "IX_StudySessions_UserId_SessionDate",
                table: "StudySessions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ReviewSchedules",
                table: "ReviewSchedules");

            migrationBuilder.DropIndex(
                name: "IX_ReviewSchedules_TopicId",
                table: "ReviewSchedules");

            migrationBuilder.DropIndex(
                name: "IX_ReviewSchedules_UserId_NextReviewOn",
                table: "ReviewSchedules");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProjectTaskProgress",
                table: "ProjectTaskProgress");

            migrationBuilder.DropIndex(
                name: "IX_ProjectTaskProgress_ProjectTaskId",
                table: "ProjectTaskProgress");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PracticeProgress",
                table: "PracticeProgress");

            migrationBuilder.DropIndex(
                name: "IX_PracticeProgress_ExerciseId",
                table: "PracticeProgress");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PortfolioChecks",
                table: "PortfolioChecks");

            migrationBuilder.DropIndex(
                name: "IX_PortfolioChecks_ProjectId",
                table: "PortfolioChecks");

            migrationBuilder.DropIndex(
                name: "IX_Notes_UserId_UpdatedAt",
                table: "Notes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LearningPreferences",
                table: "LearningPreferences");

            migrationBuilder.DropPrimaryKey(
                name: "PK_InterviewProgress",
                table: "InterviewProgress");

            migrationBuilder.DropIndex(
                name: "IX_InterviewProgress_QuestionId",
                table: "InterviewProgress");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "TopicProgress");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "StudySessions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ReviewSchedules");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ProjectTaskProgress");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PracticeProgress");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PortfolioChecks");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "LearningPreferences");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "InterviewProgress");

            migrationBuilder.AddColumn<string>(
                name: "RepositoryUrl",
                table: "Projects",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "LearningPreferences",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_TopicProgress",
                table: "TopicProgress",
                column: "TopicId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ReviewSchedules",
                table: "ReviewSchedules",
                column: "TopicId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProjectTaskProgress",
                table: "ProjectTaskProgress",
                column: "ProjectTaskId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PracticeProgress",
                table: "PracticeProgress",
                column: "ExerciseId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PortfolioChecks",
                table: "PortfolioChecks",
                columns: new[] { "ProjectId", "ChecklistItemId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_LearningPreferences",
                table: "LearningPreferences",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_InterviewProgress",
                table: "InterviewProgress",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_TopicProgress_Status",
                table: "TopicProgress",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_StudySessions_SessionDate",
                table: "StudySessions",
                column: "SessionDate");

            migrationBuilder.CreateIndex(
                name: "IX_ReviewSchedules_NextReviewOn",
                table: "ReviewSchedules",
                column: "NextReviewOn");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UpdatedAt",
                table: "Notes",
                column: "UpdatedAt");
        }
    }
}
