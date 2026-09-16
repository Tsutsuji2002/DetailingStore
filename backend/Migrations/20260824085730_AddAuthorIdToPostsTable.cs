using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthorIdToPostsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AuthorId",
                table: "posts",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_posts_AuthorId",
                table: "posts",
                column: "AuthorId");

            migrationBuilder.AddForeignKey(
                name: "FK_posts_users_AuthorId",
                table: "posts",
                column: "AuthorId",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_posts_users_AuthorId",
                table: "posts");

            migrationBuilder.DropIndex(
                name: "IX_posts_AuthorId",
                table: "posts");

            migrationBuilder.DropColumn(
                name: "AuthorId",
                table: "posts");
        }
    }
}
