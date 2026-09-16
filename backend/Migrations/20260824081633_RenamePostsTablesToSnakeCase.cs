using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenamePostsTablesToSnakeCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostLikes_Posts_PostId",
                table: "PostLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_PostLikes_users_UserId",
                table: "PostLikes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Posts",
                table: "Posts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PostLikes",
                table: "PostLikes");

            migrationBuilder.RenameTable(
                name: "Posts",
                newName: "posts");

            migrationBuilder.RenameTable(
                name: "PostLikes",
                newName: "post_likes");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_Slug",
                table: "posts",
                newName: "IX_posts_Slug");

            migrationBuilder.RenameIndex(
                name: "IX_PostLikes_UserId",
                table: "post_likes",
                newName: "IX_post_likes_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_PostLikes_PostId",
                table: "post_likes",
                newName: "IX_post_likes_PostId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_posts",
                table: "posts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_post_likes",
                table: "post_likes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_post_likes_posts_PostId",
                table: "post_likes",
                column: "PostId",
                principalTable: "posts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_post_likes_users_UserId",
                table: "post_likes",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_post_likes_posts_PostId",
                table: "post_likes");

            migrationBuilder.DropForeignKey(
                name: "FK_post_likes_users_UserId",
                table: "post_likes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_posts",
                table: "posts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_post_likes",
                table: "post_likes");

            migrationBuilder.RenameTable(
                name: "posts",
                newName: "Posts");

            migrationBuilder.RenameTable(
                name: "post_likes",
                newName: "PostLikes");

            migrationBuilder.RenameIndex(
                name: "IX_posts_Slug",
                table: "Posts",
                newName: "IX_Posts_Slug");

            migrationBuilder.RenameIndex(
                name: "IX_post_likes_UserId",
                table: "PostLikes",
                newName: "IX_PostLikes_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_post_likes_PostId",
                table: "PostLikes",
                newName: "IX_PostLikes_PostId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Posts",
                table: "Posts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PostLikes",
                table: "PostLikes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PostLikes_Posts_PostId",
                table: "PostLikes",
                column: "PostId",
                principalTable: "Posts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PostLikes_users_UserId",
                table: "PostLikes",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
