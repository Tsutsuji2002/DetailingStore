using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceRequestWorkOrderTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "service_requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    customer_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    customer_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    customer_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    vehicle_info = table.Column<string>(type: "jsonb", nullable: false),
                    requested_service_id = table.Column<Guid>(type: "uuid", nullable: false),
                    preferred_date = table.Column<DateOnly>(type: "date", nullable: false),
                    preferred_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    customer_notes = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_by_admin_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_service_requests_services_requested_service_id",
                        column: x => x.requested_service_id,
                        principalTable: "services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_service_requests_users_customer_id",
                        column: x => x.customer_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_service_requests_users_reviewed_by_admin_id",
                        column: x => x.reviewed_by_admin_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "work_orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    scheduled_start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    scheduled_end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    assigned_staff_ids = table.Column<string>(type: "jsonb", nullable: false, comment: "GIN index required for JSONB array queries"),
                    request_source = table.Column<string>(type: "text", nullable: false),
                    vehicle_info = table.Column<string>(type: "jsonb", nullable: false),
                    service_details = table.Column<string>(type: "text", nullable: false),
                    work_order_status = table.Column<string>(type: "text", nullable: false),
                    customer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    customer_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    customer_phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    customer_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    price_quote = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    admin_notes = table.Column<string>(type: "text", nullable: true),
                    created_by_admin_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    origin_service_request_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_work_orders", x => x.id);
                    table.ForeignKey(
                        name: "FK_work_orders_service_requests_origin_service_request_id",
                        column: x => x.origin_service_request_id,
                        principalTable: "service_requests",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_work_orders_users_created_by_admin_id",
                        column: x => x.created_by_admin_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_work_orders_users_customer_id",
                        column: x => x.customer_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_service_requests_created_at",
                table: "service_requests",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_service_requests_customer_id",
                table: "service_requests",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_requests_requested_service_id",
                table: "service_requests",
                column: "requested_service_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_requests_reviewed_by_admin_id",
                table: "service_requests",
                column: "reviewed_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_requests_status",
                table: "service_requests",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_created_by_admin_id",
                table: "work_orders",
                column: "created_by_admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_customer_id",
                table: "work_orders",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_origin_service_request_id",
                table: "work_orders",
                column: "origin_service_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_scheduled_start_time",
                table: "work_orders",
                column: "scheduled_start_time");

            migrationBuilder.CreateIndex(
                name: "IX_work_orders_work_order_status",
                table: "work_orders",
                column: "work_order_status");

            // Add check constraints for status enums
            migrationBuilder.Sql(@"
                ALTER TABLE service_requests 
                ADD CONSTRAINT chk_service_request_status 
                CHECK (status IN ('Pending', 'Accepted', 'Rejected'));
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE work_orders 
                ADD CONSTRAINT chk_work_order_status 
                CHECK (work_order_status IN ('Pending', 'Accepted', 'Rejected', 'InProgress', 'Completed', 'Expired'));
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE work_orders 
                ADD CONSTRAINT chk_work_order_request_source 
                CHECK (request_source IN ('CustomerRequest', 'DirectEntry'));
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE work_orders 
                ADD CONSTRAINT chk_work_order_scheduled_times 
                CHECK (scheduled_end_time > scheduled_start_time);
            ");

            // Add GIN index for assigned_staff_ids JSONB array queries
            migrationBuilder.Sql(@"
                CREATE INDEX idx_work_orders_assigned_staff_ids ON work_orders USING GIN (assigned_staff_ids);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop check constraints and GIN index before dropping tables
            migrationBuilder.Sql("DROP INDEX IF EXISTS idx_work_orders_assigned_staff_ids;");
            migrationBuilder.Sql("ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS chk_work_order_scheduled_times;");
            migrationBuilder.Sql("ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS chk_work_order_request_source;");
            migrationBuilder.Sql("ALTER TABLE work_orders DROP CONSTRAINT IF EXISTS chk_work_order_status;");
            migrationBuilder.Sql("ALTER TABLE service_requests DROP CONSTRAINT IF EXISTS chk_service_request_status;");

            migrationBuilder.DropTable(
                name: "work_orders");

            migrationBuilder.DropTable(
                name: "service_requests");
        }
    }
}
