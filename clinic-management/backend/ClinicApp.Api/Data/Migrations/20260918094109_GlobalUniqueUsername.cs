using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class GlobalUniqueUsername : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_ClinicId_Username",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ClinicId",
                table: "Users",
                column: "ClinicId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_ClinicId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_ClinicId_Username",
                table: "Users",
                columns: new[] { "ClinicId", "Username" },
                unique: true);
        }
    }
}
