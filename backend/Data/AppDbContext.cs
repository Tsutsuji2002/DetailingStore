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
        public DbSet<HeroSlide> HeroSlides => Set<HeroSlide>();
        public DbSet<PostEntity> Posts => Set<PostEntity>();
        public DbSet<PostLikeEntity> PostLikes => Set<PostLikeEntity>();
        public DbSet<ShopSettingEntity> ShopSettings => Set<ShopSettingEntity>();
        public DbSet<JobPositionEntity> JobPositions => Set<JobPositionEntity>();
        public DbSet<WorkShiftConfigEntity> WorkShiftConfigs => Set<WorkShiftConfigEntity>();
        public DbSet<WorkShiftEntity> WorkShifts => Set<WorkShiftEntity>();
        public DbSet<ChatChannel> ChatChannels => Set<ChatChannel>();
        public DbSet<ChatChannelMember> ChatChannelMembers => Set<ChatChannelMember>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<ServiceRequestEntity> ServiceRequests => Set<ServiceRequestEntity>();
        public DbSet<WorkOrderEntity> WorkOrders => Set<WorkOrderEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed initial public ChatChannel (1 announcement channel)
            modelBuilder.Entity<ChatChannel>().HasData(
                new ChatChannel
                {
                    Id = "thong-bao-chung",
                    Name = "thong-bao-chung",
                    Description = "Thông báo chung từ ban quản lý",
                    IsPublic = true,
                    IsDirect = false,
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

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

            modelBuilder.Entity<HeroSlide>()
                .Property(h => h.LinkType)
                .HasConversion<string>();

            modelBuilder.Entity<ServiceRequestEntity>()
                .Property(sr => sr.Status)
                .HasConversion<string>();

            modelBuilder.Entity<WorkOrderEntity>()
                .Property(wo => wo.WorkOrderStatus)
                .HasConversion<string>();

            modelBuilder.Entity<WorkOrderEntity>()
                .Property(wo => wo.RequestSource)
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

            modelBuilder.Entity<PostEntity>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            modelBuilder.Entity<MechanicDoc>()
                .HasIndex(m => new { m.Brand, m.VehicleModel });

            // Configure indexes for service_requests
            modelBuilder.Entity<ServiceRequestEntity>()
                .HasIndex(sr => sr.Status);

            modelBuilder.Entity<ServiceRequestEntity>()
                .HasIndex(sr => sr.CreatedAt);

            // Configure indexes for work_orders
            modelBuilder.Entity<WorkOrderEntity>()
                .HasIndex(wo => wo.ScheduledStartTime);

            modelBuilder.Entity<WorkOrderEntity>()
                .HasIndex(wo => wo.WorkOrderStatus);

            // Configure GIN index for assigned_staff_ids using raw SQL via HasComment (will be handled in migration)
            modelBuilder.Entity<WorkOrderEntity>()
                .Property(wo => wo.AssignedStaffIds)
                .HasComment("GIN index required for JSONB array queries");

            // Explicit snake_case table names for Posts & PostLikes
            modelBuilder.Entity<PostEntity>().ToTable("posts");
            modelBuilder.Entity<PostLikeEntity>().ToTable("post_likes");

            // Post Author relationship
            modelBuilder.Entity<PostEntity>()
                .HasOne(p => p.Author)
                .WithMany()
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);

            // PostLike relationship & cascade delete
            modelBuilder.Entity<PostLikeEntity>()
                .HasOne(pl => pl.Post)
                .WithMany(p => p.PostLikes)
                .HasForeignKey(pl => pl.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostLikeEntity>()
                .HasOne(pl => pl.User)
                .WithMany()
                .HasForeignKey(pl => pl.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed initial ShopSettings data
            modelBuilder.Entity<ShopSettingEntity>().HasData(new ShopSettingEntity
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Name = "MotoShine",
                LogoIcon = null,
                Tagline = "Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Bình Dương",
                Address = "123 Đường Lý Thường Kiệt, Phường 7, Quận 10, TP. Hồ Chí Minh",
                Phone = "0901 234 567",
                Email = "contact@detailingstore.vn",
                TaxId = "0315678901",
                MapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4508!2d106.6604!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM3LjAiTiAxMDbCsDM5JzM3LjQiRQ!5e0!3m2!1svi!2s!4v1600000000000",
                WorkingHours = "Thứ 2 – Thứ 7: 7:30 – 18:30 | Chủ nhật: 8:00 – 16:00",
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });

            // Seed initial WorkShiftConfigs data
            modelBuilder.Entity<WorkShiftConfigEntity>().HasData(
                new WorkShiftConfigEntity
                {
                    Id = "morning",
                    Name = "Ca Sáng",
                    StartTime = "07:30",
                    EndTime = "12:00",
                    Icon = null,
                    Color = "#3b82f6",
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new WorkShiftConfigEntity
                {
                    Id = "afternoon",
                    Name = "Ca Chiều",
                    StartTime = "13:00",
                    EndTime = "18:30",
                    Icon = null,
                    Color = "#a855f7",
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                },
                new WorkShiftConfigEntity
                {
                    Id = "full",
                    Name = "Ca Cả Ngày",
                    StartTime = "07:30",
                    EndTime = "18:30",
                    Icon = null,
                    Color = "#f59e0b",
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
