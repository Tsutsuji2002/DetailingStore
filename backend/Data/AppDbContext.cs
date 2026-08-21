using Microsoft.EntityFrameworkCore;
using DetailingStore.Api.Models;

namespace DetailingStore.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
        public DbSet<ServiceEntity> Services => Set<ServiceEntity>();
        public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
        public DbSet<ProductEntity> Products => Set<ProductEntity>();
        public DbSet<ServiceBooking> ServiceBookings => Set<ServiceBooking>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<MechanicDoc> MechanicDocs => Set<MechanicDoc>();
        public DbSet<SiteContent> SiteContents => Set<SiteContent>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Enum mappings to string or integer in PostgreSQL
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<ServiceBooking>()
                .Property(b => b.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>();

            // Configure unique indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<ServiceCategory>()
                .HasIndex(sc => sc.Slug)
                .IsUnique();

            modelBuilder.Entity<ServiceEntity>()
                .HasIndex(s => s.Slug)
                .IsUnique();

            modelBuilder.Entity<ProductCategory>()
                .HasIndex(pc => pc.Slug)
                .IsUnique();

            modelBuilder.Entity<ProductEntity>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            modelBuilder.Entity<MechanicDoc>()
                .HasIndex(m => new { m.Brand, m.VehicleModel });
        }
    }
}
