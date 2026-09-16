using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkShiftsAndConfigs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "work_shift_configs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StartTime = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EndTime = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Icon = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Color = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_work_shift_configs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "work_shifts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StaffId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ShiftTypeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Date = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_work_shifts", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "work_shift_configs",
                columns: new[] { "Id", "Color", "CreatedAt", "EndTime", "Icon", "IsActive", "Name", "StartTime", "UpdatedAt" },
                values: new object[,]
                {
                    { "afternoon", "#a855f7", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "18:30", "🌆", true, "Ca Chiều", "13:00", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "full", "#f59e0b", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "18:30", "☀️", true, "Ca Cả Ngày", "07:30", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { "morning", "#3b82f6", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "12:00", "🌅", true, "Ca Sáng", "07:30", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "work_shift_configs");

            migrationBuilder.DropTable(
                name: "work_shifts");
        }
    }
}
