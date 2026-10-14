using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicApp.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class PatientPortalAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Patients",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Patients");
        }
    }
}
