using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscussionsAndPaths : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LearningPaths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreatorId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Slug = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DescriptionAr = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IconName = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    IsBuiltIn = table.Column<bool>(type: "bit", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningPaths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningPaths_AspNetUsers_CreatorId",
                        column: x => x.CreatorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "LearningPathPhases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LearningPathId = table.Column<int>(type: "int", nullable: false),
                    PhaseId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningPathPhases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningPathPhases_LearningPaths_LearningPathId",
                        column: x => x.LearningPathId,
                        principalTable: "LearningPaths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LearningPathPhases_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LearningPathTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LearningPathId = table.Column<int>(type: "int", nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearningPathTopics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearningPathTopics_LearningPaths_LearningPathId",
                        column: x => x.LearningPathId,
                        principalTable: "LearningPaths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LearningPathTopics_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserLearningPaths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    LearningPathId = table.Column<int>(type: "int", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLearningPaths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserLearningPaths_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserLearningPaths_LearningPaths_LearningPathId",
                        column: x => x.LearningPathId,
                        principalTable: "LearningPaths",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DiscussionReplies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DiscussionId = table.Column<int>(type: "int", nullable: false),
                    AuthorId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    BodyEn = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    BodyAr = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiscussionReplies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiscussionReplies_AspNetUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Discussions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TopicId = table.Column<int>(type: "int", nullable: false),
                    AuthorId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    BodyEn = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    BodyAr = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    IsPinned = table.Column<bool>(type: "bit", nullable: false),
                    AcceptedReplyId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Discussions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Discussions_AspNetUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Discussions_DiscussionReplies_AcceptedReplyId",
                        column: x => x.AcceptedReplyId,
                        principalTable: "DiscussionReplies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Discussions_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DiscussionVotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    DiscussionId = table.Column<int>(type: "int", nullable: true),
                    ReplyId = table.Column<int>(type: "int", nullable: true),
                    Value = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiscussionVotes", x => x.Id);
                    table.CheckConstraint("CK_DiscussionVote_Target", "(DiscussionId IS NOT NULL AND ReplyId IS NULL) OR (DiscussionId IS NULL AND ReplyId IS NOT NULL)");
                    table.CheckConstraint("CK_DiscussionVote_Value", "Value IN (-1, 1)");
                    table.ForeignKey(
                        name: "FK_DiscussionVotes_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DiscussionVotes_DiscussionReplies_ReplyId",
                        column: x => x.ReplyId,
                        principalTable: "DiscussionReplies",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DiscussionVotes_Discussions_DiscussionId",
                        column: x => x.DiscussionId,
                        principalTable: "Discussions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecipientId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Kind = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    DiscussionId = table.Column<int>(type: "int", nullable: true),
                    ActorId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    MessageEn = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    MessageAr = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_ActorId",
                        column: x => x.ActorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_RecipientId",
                        column: x => x.RecipientId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notifications_Discussions_DiscussionId",
                        column: x => x.DiscussionId,
                        principalTable: "Discussions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionReplies_AuthorId",
                table: "DiscussionReplies",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionReplies_DiscussionId_CreatedAt",
                table: "DiscussionReplies",
                columns: new[] { "DiscussionId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Discussions_AcceptedReplyId",
                table: "Discussions",
                column: "AcceptedReplyId",
                unique: true,
                filter: "[AcceptedReplyId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Discussions_AuthorId",
                table: "Discussions",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Discussions_TopicId_IsPinned_CreatedAt",
                table: "Discussions",
                columns: new[] { "TopicId", "IsPinned", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Discussions_TopicId_Score",
                table: "Discussions",
                columns: new[] { "TopicId", "Score" });

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionVotes_DiscussionId",
                table: "DiscussionVotes",
                column: "DiscussionId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionVotes_ReplyId",
                table: "DiscussionVotes",
                column: "ReplyId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionVotes_UserId_DiscussionId_ReplyId",
                table: "DiscussionVotes",
                columns: new[] { "UserId", "DiscussionId", "ReplyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathPhases_LearningPathId_PhaseId",
                table: "LearningPathPhases",
                columns: new[] { "LearningPathId", "PhaseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathPhases_PhaseId",
                table: "LearningPathPhases",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningPaths_CreatorId",
                table: "LearningPaths",
                column: "CreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_LearningPaths_Slug",
                table: "LearningPaths",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathTopics_LearningPathId_TopicId",
                table: "LearningPathTopics",
                columns: new[] { "LearningPathId", "TopicId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningPathTopics_TopicId",
                table: "LearningPathTopics",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ActorId",
                table: "Notifications",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DiscussionId",
                table: "Notifications",
                column: "DiscussionId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientId_IsRead_CreatedAt",
                table: "Notifications",
                columns: new[] { "RecipientId", "IsRead", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_UserLearningPaths_LearningPathId",
                table: "UserLearningPaths",
                column: "LearningPathId");

            migrationBuilder.CreateIndex(
                name: "IX_UserLearningPaths_UserId_LearningPathId",
                table: "UserLearningPaths",
                columns: new[] { "UserId", "LearningPathId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DiscussionReplies_Discussions_DiscussionId",
                table: "DiscussionReplies",
                column: "DiscussionId",
                principalTable: "Discussions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DiscussionReplies_Discussions_DiscussionId",
                table: "DiscussionReplies");

            migrationBuilder.DropTable(
                name: "DiscussionVotes");

            migrationBuilder.DropTable(
                name: "LearningPathPhases");

            migrationBuilder.DropTable(
                name: "LearningPathTopics");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "UserLearningPaths");

            migrationBuilder.DropTable(
                name: "LearningPaths");

            migrationBuilder.DropTable(
                name: "Discussions");

            migrationBuilder.DropTable(
                name: "DiscussionReplies");
        }
    }
}
