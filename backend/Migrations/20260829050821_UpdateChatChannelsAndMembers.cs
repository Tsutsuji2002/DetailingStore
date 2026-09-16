using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateChatChannelsAndMembers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "chat_channels",
                keyColumn: "id",
                keyValue: "ch1");

            migrationBuilder.DeleteData(
                table: "chat_channels",
                keyColumn: "id",
                keyValue: "ch2");

            migrationBuilder.DeleteData(
                table: "chat_channels",
                keyColumn: "id",
                keyValue: "ch3");

            migrationBuilder.AddColumn<string>(
                name: "creator_id",
                table: "chat_channels",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_direct",
                table: "chat_channels",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                table: "chat_channels",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "chat_channel_members",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    channel_id = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_channel_members", x => x.id);
                    table.ForeignKey(
                        name: "FK_chat_channel_members_chat_channels_channel_id",
                        column: x => x.channel_id,
                        principalTable: "chat_channels",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "chat_channels",
                columns: new[] { "id", "created_at", "creator_id", "description", "is_active", "is_direct", "is_public", "name" },
                values: new object[] { "thong-bao-chung", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, "Thông báo chung từ ban quản lý", true, false, true, "thong-bao-chung" });

            migrationBuilder.CreateIndex(
                name: "IX_chat_channel_members_channel_id",
                table: "chat_channel_members",
                column: "channel_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chat_channel_members");

            migrationBuilder.DeleteData(
                table: "chat_channels",
                keyColumn: "id",
                keyValue: "thong-bao-chung");

            migrationBuilder.DropColumn(
                name: "creator_id",
                table: "chat_channels");

            migrationBuilder.DropColumn(
                name: "is_direct",
                table: "chat_channels");

            migrationBuilder.DropColumn(
                name: "is_public",
                table: "chat_channels");

            migrationBuilder.InsertData(
                table: "chat_channels",
                columns: new[] { "id", "created_at", "description", "is_active", "name" },
                values: new object[,]
                {
                    { "ch1", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Thông báo chung từ ban quản lý", true, "thong-bao-xut-quan" },
                    { "ch2", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Trao đổi xuất nhập vật tư & hóa chất", true, "kho-vat-tu" },
                    { "ch3", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Hỏi đáp & hỗ trợ kỹ thuật sửa chữa", true, "ky-thuat-xe-may" }
                });
        }
    }
}
