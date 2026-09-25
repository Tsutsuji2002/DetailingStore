using System;
using System.Collections.Generic;
using DetailingStore.Api.Models.Scaffold;
using Microsoft.EntityFrameworkCore;

namespace DetailingStore.Api.Data;

public partial class DetailingStoreDbContext : DbContext
{
    public DetailingStoreDbContext(DbContextOptions<DetailingStoreDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<MomoPaymentTransaction> MomoPaymentTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MomoPaymentTransaction>(entity =>
        {
            entity.HasIndex(e => new { e.BookingId, e.Status }, "IX_momo_payment_transactions_booking_id_status")
                .IsUnique()
                .HasFilter("((booking_id IS NOT NULL) AND ((status)::text = 'Pending'::text))");

            entity.HasIndex(e => new { e.ProductOrderId, e.Status }, "IX_momo_payment_transactions_product_order_id_status")
                .IsUnique()
                .HasFilter("((product_order_id IS NOT NULL) AND ((status)::text = 'Pending'::text))");

            entity.Property(e => e.Id).ValueGeneratedNever();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
