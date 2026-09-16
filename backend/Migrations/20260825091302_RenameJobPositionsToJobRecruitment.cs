using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameJobPositionsToJobRecruitment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_job_positions",
                table: "job_positions");

            migrationBuilder.RenameTable(
                name: "job_positions",
                newName: "job_recruitment");

            migrationBuilder.AddPrimaryKey(
                name: "PK_job_recruitment",
                table: "job_recruitment",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "job_recruitment",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "Benefits", "Requirements" },
                values: new object[] { new List<string> { "Lương thưởng theo doanh số", "Bao cơm trưa", "Hỗ trợ chỗ ở cho thợ ở xa" }, new List<string> { "Kinh nghiệm 1-2 năm về hệ thống điện xe máy", "Tự giác, trách nhiệm cao", "Am hiểu đọc sơ đồ mạch điện" } });

            migrationBuilder.UpdateData(
                table: "job_recruitment",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Benefits", "Requirements" },
                values: new object[] { new List<string> { "Được đào tạo nâng cao tay nghề phủ Ceramic", "Đồng phục & dụng cụ bảo hộ đầy đủ" }, new List<string> { "Đam mê xe máy, tỉ mỉ, trung thực", "Không yêu cầu bằng cấp", "Ưu tiên ứng viên có kinh nghiệm làm spa xe" } });

            migrationBuilder.UpdateData(
                table: "job_recruitment",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Benefits", "Requirements" },
                values: new object[] { new List<string> { "Cam kết bao ra nghề", "Nhận vào làm thợ chính ngay sau khóa học" }, new List<string> { "Nam tuổi từ 18 - 25", "Chăm chỉ, chịu khó, có niềm đam mê học nghề" } });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_job_recruitment",
                table: "job_recruitment");

            migrationBuilder.RenameTable(
                name: "job_recruitment",
                newName: "job_positions");

            migrationBuilder.AddPrimaryKey(
                name: "PK_job_positions",
                table: "job_positions",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "job_positions",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "Benefits", "Requirements" },
                values: new object[] { new List<string> { "Lương thưởng theo doanh số", "Bao cơm trưa", "Hỗ trợ chỗ ở cho thợ ở xa" }, new List<string> { "Kinh nghiệm 1-2 năm về hệ thống điện xe máy", "Tự giác, trách nhiệm cao", "Am hiểu đọc sơ đồ mạch điện" } });

            migrationBuilder.UpdateData(
                table: "job_positions",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Benefits", "Requirements" },
                values: new object[] { new List<string> { "Được đào tạo nâng cao tay nghề phủ Ceramic", "Đồng phục & dụng cụ bảo hộ đầy đủ" }, new List<string> { "Đam mê xe máy, tỉ mỉ, trung thực", "Không yêu cầu bằng cấp", "Ưu tiên ứng viên có kinh nghiệm làm spa xe" } });

            migrationBuilder.UpdateData(
                table: "job_positions",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Benefits", "Requirements" },
                values: new object[] { new List<string> { "Cam kết bao ra nghề", "Nhận vào làm thợ chính ngay sau khóa học" }, new List<string> { "Nam tuổi từ 18 - 25", "Chăm chỉ, chịu khó, có niềm đam mê học nghề" } });
        }
    }
}
