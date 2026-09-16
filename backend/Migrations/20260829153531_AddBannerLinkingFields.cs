using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DetailingStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBannerLinkingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "link_type",
                table: "hero_slides",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.AddColumn<Guid>(
                name: "linked_content_id",
                table: "hero_slides",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "linked_content_slug",
                table: "hero_slides",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "link_type",
                table: "hero_slides");

            migrationBuilder.DropColumn(
                name: "linked_content_id",
                table: "hero_slides");

            migrationBuilder.DropColumn(
                name: "linked_content_slug",
                table: "hero_slides");
        }
    }
}
