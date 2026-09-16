using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddChatEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "chat_channels",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_channels", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "chat_messages",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    channel_id = table.Column<string>(type: "text", nullable: false),
                    sender_id = table.Column<string>(type: "text", nullable: false),
                    sender_name = table.Column<string>(type: "text", nullable: false),
                    sender_avatar = table.Column<string>(type: "text", nullable: true),
                    sender_role = table.Column<string>(type: "text", nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_chat_messages", x => x.id);
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chat_channels");

            migrationBuilder.DropTable(
                name: "chat_messages");
        }
    }
}
