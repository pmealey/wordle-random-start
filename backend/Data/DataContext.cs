using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base (options)
        { }

        public DbSet<Comment> Comment { get; set; } = null!;

        public DbSet<DailyResult> DailyResult { get; set; } = null!;

        public DbSet<DailyWord> DailyWord { get; set; } = null!;
    }
}