using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveJobRecruitmentSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "job_recruitment",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "job_recruitment",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "job_recruitment",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "job_recruitment",
                columns: new[] { "Id", "Benefits", "CreatedAt", "Deadline", "Department", "Description", "IsActive", "Location", "Requirements", "Salary", "Title", "Type", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new List<string> { "Lương thưởng theo doanh số", "Bao cơm trưa", "Hỗ trợ chỗ ở cho thợ ở xa" }, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Vô thời hạn", "Kỹ Thuật Điện", "Sửa chữa hệ thống điện, phun xăng điện tử FI, đấu nối điện đồ chơi cao cấp cho các dòng xe tay ga & xe số.", true, "TP. Hồ Chí Minh", new List<string> { "Kinh nghiệm 1-2 năm về hệ thống điện xe máy", "Tự giác, trách nhiệm cao", "Am hiểu đọc sơ đồ mạch điện" }, "8.000.000 – 12.000.000 VNĐ", "Thợ Kỹ Thuật Điện Xe Máy", "parttime", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new List<string> { "Được đào tạo nâng cao tay nghề phủ Ceramic", "Đồng phục & dụng cụ bảo hộ đầy đủ" }, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Vô thời hạn", "Chăm Sóc & Rửa Xe", "Thực hiện các dịch vụ rửa xe chi tiết, vệ sinh khoang máy, dán film bảo vệ PPF, phủ Ceramic cho xe máy & mô tô phân khối lớn.", true, "TP. Hồ Chí Minh", new List<string> { "Đam mê xe máy, tỉ mỉ, trung thực", "Không yêu cầu bằng cấp", "Ưu tiên ứng viên có kinh nghiệm làm spa xe" }, "6.000.000 – 9.000.000 VNĐ", "Kỹ Thuật Viên Detailing", "parttime", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new List<string> { "Cam kết bao ra nghề", "Nhận vào làm thợ chính ngay sau khóa học" }, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Vô thời hạn", "Đào Tạo Nghề", "Khóa đào tạo thợ máy xe tay ga & xe số thực chiến từ cơ bản đến nâng cao. Học viên được thực hành trực tiếp trên xe thật.", true, "TP. Hồ Chí Minh", new List<string> { "Nam tuổi từ 18 - 25", "Chăm chỉ, chịu khó, có niềm đam mê học nghề" }, "Miễn phí học phí + Phụ cấp", "Học Nghề Sửa Xe (Apprentice)", "apprentice", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }
    }
}
