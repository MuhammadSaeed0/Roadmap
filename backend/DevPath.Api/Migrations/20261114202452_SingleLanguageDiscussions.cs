using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DevPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class SingleLanguageDiscussions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BodyAr",
                table: "Discussions");

            migrationBuilder.DropColumn(
                name: "TitleAr",
                table: "Discussions");

            migrationBuilder.DropColumn(
                name: "BodyAr",
                table: "DiscussionReplies");

            migrationBuilder.RenameColumn(
                name: "TitleEn",
                table: "Discussions",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "BodyEn",
                table: "Discussions",
                newName: "Body");

            migrationBuilder.RenameColumn(
                name: "BodyEn",
                table: "DiscussionReplies",
                newName: "Body");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Discussions",
                newName: "TitleEn");

            migrationBuilder.RenameColumn(
                name: "Body",
                table: "Discussions",
                newName: "BodyEn");

            migrationBuilder.RenameColumn(
                name: "Body",
                table: "DiscussionReplies",
                newName: "BodyEn");

            migrationBuilder.AddColumn<string>(
                name: "BodyAr",
                table: "Discussions",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TitleAr",
                table: "Discussions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BodyAr",
                table: "DiscussionReplies",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            // The previous version showed the Ar fields in Arabic; refill them so a rollback shows the posts, not blanks.
            migrationBuilder.Sql("UPDATE Discussions SET TitleAr = TitleEn, BodyAr = BodyEn;");
            migrationBuilder.Sql("UPDATE DiscussionReplies SET BodyAr = BodyEn;");
        }
    }
}
