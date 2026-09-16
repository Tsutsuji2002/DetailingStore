using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddShopSettingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "shop_settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LogoIcon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Tagline = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TaxId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MapEmbedUrl = table.Column<string>(type: "text", nullable: false),
                    WorkingHours = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shop_settings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "shop_settings",
                columns: new[] { "Id", "Address", "Email", "LogoIcon", "LogoUrl", "MapEmbedUrl", "Name", "Phone", "Tagline", "TaxId", "UpdatedAt", "WorkingHours" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), "123 Đường Lý Thường Kiệt, Phường 7, Quận 10, TP. Hồ Chí Minh", "contact@detailingstore.vn", "🏍️", null, "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4508!2d106.6604!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM2LjgiTiAxMDYsNDMnMzcuNCJF!5e0!3m2!1svi!2s!4v1600000000000", "MotoShine", "0901 234 567", "Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Bình Dương", "0315678901", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Thứ 2 – Thứ 7: 7:30 – 18:30 | Chủ nhật: 8:00 – 16:00" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "shop_settings");
        }
    }
}
