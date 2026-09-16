using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePostsAuthorNameToRoleFormat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE posts SET \"AuthorName\" = 'MotoShine Admin (Admin)' WHERE \"AuthorName\" = 'MotoShine Admin' OR \"AuthorName\" IS NULL OR \"AuthorName\" = '';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
