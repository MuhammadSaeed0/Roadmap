using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRoadmapTracks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Topics",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDraft",
                table: "Phases",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Tracks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummaryEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummaryAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OutcomeEn = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OutcomeAr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Technologies = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: false),
                    Icon = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tracks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserTracks",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    TrackSlug = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    ChosenAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTracks", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserTracks_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrackPhases",
                columns: table => new
                {
                    TrackId = table.Column<int>(type: "int", nullable: false),
                    PhaseId = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackPhases", x => new { x.TrackId, x.PhaseId });
                    table.ForeignKey(
                        name: "FK_TrackPhases_Phases_PhaseId",
                        column: x => x.PhaseId,
                        principalTable: "Phases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TrackPhases_Tracks_TrackId",
                        column: x => x.TrackId,
                        principalTable: "Tracks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TrackPhases_PhaseId",
                table: "TrackPhases",
                column: "PhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Tracks_Slug",
                table: "Tracks",
                column: "Slug",
                unique: true);

            // Accounts that existed before roadmaps keep following the .NET roadmap and are not asked to pick one.
            // Safe to run again: only accounts without a row get one.
            migrationBuilder.Sql(@"
                INSERT INTO UserTracks (UserId, TrackSlug, ChosenAt)
                SELECT u.Id, 'dotnet-fullstack', SYSUTCDATETIME()
                FROM AspNetUsers u
                WHERE NOT EXISTS (SELECT 1 FROM UserTracks t WHERE t.UserId = u.Id)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrackPhases");

            migrationBuilder.DropTable(
                name: "UserTracks");

            migrationBuilder.DropTable(
                name: "Tracks");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "Topics");

            migrationBuilder.DropColumn(
                name: "IsDraft",
                table: "Phases");
        }
    }
}
