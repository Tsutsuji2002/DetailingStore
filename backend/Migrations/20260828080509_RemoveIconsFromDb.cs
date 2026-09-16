using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIconsFromDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "shop_settings",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "LogoIcon", "MapEmbedUrl" },
                values: new object[] { null, "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4508!2d106.6604!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM3LjAiTiAxMDbCsDM5JzM3LjQiRQ!5e0!3m2!1svi!2s!4v1600000000000" });

            migrationBuilder.UpdateData(
                table: "work_shift_configs",
                keyColumn: "Id",
                keyValue: "afternoon",
                column: "Icon",
                value: null);

            migrationBuilder.UpdateData(
                table: "work_shift_configs",
                keyColumn: "Id",
                keyValue: "full",
                column: "Icon",
                value: null);

            migrationBuilder.UpdateData(
                table: "work_shift_configs",
                keyColumn: "Id",
                keyValue: "morning",
                column: "Icon",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "shop_settings",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "LogoIcon", "MapEmbedUrl" },
                values: new object[] { "🏍️", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4508!2d106.6604!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM2LjgiTiAxMDYsNDMnMzcuNCJF!5e0!3m2!1svi!2s!4v1600000000000" });

            migrationBuilder.UpdateData(
                table: "work_shift_configs",
                keyColumn: "Id",
                keyValue: "afternoon",
                column: "Icon",
                value: "🌆");

            migrationBuilder.UpdateData(
                table: "work_shift_configs",
                keyColumn: "Id",
                keyValue: "full",
                column: "Icon",
                value: "☀️");

            migrationBuilder.UpdateData(
                table: "work_shift_configs",
                keyColumn: "Id",
                keyValue: "morning",
                column: "Icon",
                value: "🌅");
        }
    }
}
